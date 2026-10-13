const { describe, it, after } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("events");
const jwt = require("jsonwebtoken");
const {
  handleChatConnection,
  clients,
  stopHeartbeat,
} = require("./chat-handler");
const { JWT_SECRET } = require("../utils/ws-auth");

class FakeSocket extends EventEmitter {
  constructor() {
    super();
    this.readyState = 1;
    this.sent = [];
    this.terminated = false;
  }
  send(data) {
    this.sent.push(JSON.parse(data));
  }
  ping() {}
  terminate() {
    this.terminated = true;
    this.readyState = 3;
    this.emit("close");
  }
  close() {
    this.readyState = 3;
    this.emit("close");
  }
}

describe("disconnect handling", () => {
  after(() => {
    stopHeartbeat();
    clients.clear();
  });

  it("removes a client from the connection map on close", () => {
    const token = jwt.sign({ id: "disc-user", role: "user" }, JWT_SECRET);
    const ws = new FakeSocket();
    handleChatConnection(ws, { headers: { cookie: `token=${token}` } });
    assert.equal(clients.get("disc-user").size, 1);
    ws.close();
    assert.equal(clients.has("disc-user"), false);
  });

  it("keeps anonymous connections until they disconnect", () => {
    const ws = new FakeSocket();
    handleChatConnection(ws, { headers: {} });
    const keys = [...clients.keys()].filter((k) => k.startsWith("anon:"));
    assert.equal(keys.length >= 1, true);
    ws.close();
    assert.equal(clients.has(keys[0]), false);
  });
});
