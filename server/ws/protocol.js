const { v4: uuidv4 } = require("uuid");

function generateId() {
  try {
    return uuidv4();
  } catch (e) {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

const EVENT_TYPES = {
  CHAT_MESSAGE: "chat_message",
  CHAT_RESPONSE: "chat_response",
  CHAT_RESPONSE_CHUNK: "chat_response_chunk",
  ERROR: "error",
  STATUS: "status",
  PRODUCT_RECOMMENDATION: "product_recommendation",
  ORDER_STATUS_UPDATE: "order_status_update",
  PING: "ping",
  PONG: "pong",
};

const CLIENT_EVENT_TYPES = new Set([
  EVENT_TYPES.CHAT_MESSAGE,
  EVENT_TYPES.PING,
]);

const MAX_MESSAGE_LENGTH = parseInt(process.env.WS_MAX_MESSAGE_LENGTH, 10) || 2000;

function sendJson(ws, payload) {
  if (!ws || ws.readyState !== 1) return;
  ws.send(
    JSON.stringify({
      id: payload.id || generateId(),
      timestamp: payload.timestamp || Date.now(),
      ...payload,
    })
  );
}

function validateMessage(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (!raw.type || typeof raw.type !== "string") return null;
  if (!CLIENT_EVENT_TYPES.has(raw.type)) return null;
  if (raw.id != null && typeof raw.id !== "string") return null;
  if (raw.payload != null && (typeof raw.payload !== "object" || Array.isArray(raw.payload))) {
    return null;
  }

  const payload = raw.payload || {};
  if (raw.type === EVENT_TYPES.CHAT_MESSAGE) {
    if (payload.content != null && typeof payload.content !== "string") return null;
    if (payload.keyword != null && typeof payload.keyword !== "string") return null;
    if (payload.orderId != null && typeof payload.orderId !== "string") return null;
    if (payload.productIds != null && !Array.isArray(payload.productIds)) return null;
    const content = payload.content || "";
    if (content.length > MAX_MESSAGE_LENGTH) return { error: "MESSAGE_TOO_LONG" };
  }

  return {
    id: raw.id || generateId(),
    type: raw.type,
    payload,
    timestamp: Date.now(),
  };
}

module.exports = {
  generateId,
  EVENT_TYPES,
  CLIENT_EVENT_TYPES,
  MAX_MESSAGE_LENGTH,
  validateMessage,
  sendJson,
};
