const { authenticateConnection } = require("../utils/ws-auth");
const { generateId, validateMessage, EVENT_TYPES } = require("./protocol");
const { handleChatMessage } = require("./chat-handlers");
const { createRateLimiter } = require("../utils/rate-limit");

const clients = new Map();
const rateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.WS_RATE_WINDOW_MS, 10) || 10000,
  max: parseInt(process.env.WS_RATE_MAX, 10) || 20,
});

const HEARTBEAT_MS = parseInt(process.env.WS_HEARTBEAT_MS, 10) || 30000;
let heartbeatTimer = null;

function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    for (const [, sockets] of clients) {
      for (const ws of sockets) {
        if (ws.isAlive === false) {
          try {
            ws.terminate();
          } catch (e) {
            /* ignore */
          }
          continue;
        }
        ws.isAlive = false;
        try {
          ws.ping();
        } catch (e) {
          /* ignore */
        }
      }
    }
  }, HEARTBEAT_MS);
  if (heartbeatTimer.unref) heartbeatTimer.unref();
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function removeClient(clientId, ws) {
  const set = clients.get(clientId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clients.delete(clientId);
}

function handleChatConnection(ws, req) {
  const user = authenticateConnection(req);
  if (!user) {
    ws.close(4001, "Unauthorized");
    return;
  }
  const clientId = String(user.id);

  if (!clients.has(clientId)) clients.set(clientId, new Set());
  clients.get(clientId).add(ws);

  ws.isAlive = true;
  ws.user = user;
  ws.clientId = clientId;
  startHeartbeat();

  ws.send(
    JSON.stringify({
      id: generateId(),
      type: EVENT_TYPES.STATUS,
      payload: {
        connected: true,
        authenticated: Boolean(user),
      },
      timestamp: Date.now(),
    }),
  );

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", async (data) => {
    try {
      if (!rateLimiter.allow(clientId)) {
        ws.send(
          JSON.stringify({
            id: generateId(),
            type: EVENT_TYPES.ERROR,
            payload: { error: "Rate limit exceeded", code: "RATE_LIMIT" },
            timestamp: Date.now(),
          }),
        );
        return;
      }

      const text = data.toString();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        ws.send(
          JSON.stringify({
            id: generateId(),
            type: EVENT_TYPES.ERROR,
            payload: { error: "Invalid JSON", code: "INVALID_JSON" },
            timestamp: Date.now(),
          }),
        );
        return;
      }

      const msg = validateMessage(parsed);
      if (!msg) {
        ws.send(
          JSON.stringify({
            id: generateId(),
            type: EVENT_TYPES.ERROR,
            payload: {
              error: "Invalid message format",
              code: "INVALID_MESSAGE",
            },
            timestamp: Date.now(),
          }),
        );
        return;
      }
      if (msg.error === "MESSAGE_TOO_LONG") {
        ws.send(
          JSON.stringify({
            id: generateId(),
            type: EVENT_TYPES.ERROR,
            payload: { error: "Message too long", code: "MESSAGE_TOO_LONG" },
            timestamp: Date.now(),
          }),
        );
        return;
      }

      await handleChatMessage(ws, msg);
    } catch (e) {
      ws.send(
        JSON.stringify({
          id: generateId(),
          type: EVENT_TYPES.ERROR,
          payload: { error: "Server error", code: "INTERNAL" },
          timestamp: Date.now(),
        }),
      );
    }
  });

  ws.on("close", () => {
    removeClient(clientId, ws);
    rateLimiter.reset(clientId);
  });

  ws.on("error", () => {
    removeClient(clientId, ws);
  });
}

function broadcastToUser(userId, message) {
  if (!userId) return 0;
  const set = clients.get(String(userId));
  if (!set) return 0;
  const payload = JSON.stringify({
    ...message,
    timestamp: message.timestamp || Date.now(),
  });
  let sent = 0;
  for (const ws of set) {
    if (ws.readyState === 1) {
      ws.send(payload);
      sent += 1;
    }
  }
  return sent;
}

function getUserConnections(userId) {
  const set = clients.get(String(userId));
  return set ? set.size : 0;
}

module.exports = {
  handleChatConnection,
  broadcastToUser,
  getUserConnections,
  clients,
  startHeartbeat,
  stopHeartbeat,
  removeClient,
};
