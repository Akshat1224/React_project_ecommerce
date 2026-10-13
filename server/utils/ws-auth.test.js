const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { authenticateConnection, extractTokenFromRequest, JWT_SECRET } = require("./ws-auth");

describe("websocket authentication", () => {
  it("rejects missing credentials", () => {
    assert.equal(authenticateConnection({ headers: {} }), null);
    assert.equal(extractTokenFromRequest({ headers: {} }), null);
  });

  it("rejects invalid jwt", () => {
    const req = { headers: { cookie: "token=not-a-jwt" } };
    assert.equal(authenticateConnection(req), null);
  });

  it("ignores client-supplied user ids in the query string", () => {
    const req = { url: "/ws/chat?userId=attacker&role=admin", headers: {} };
    assert.equal(authenticateConnection(req), null);
  });

  it("authenticates a valid cookie token", () => {
    const token = jwt.sign({ id: "user-1", role: "user", email: "a@b.c" }, JWT_SECRET);
    const req = { headers: { cookie: `token=${token}` } };
    const user = authenticateConnection(req);
    assert.equal(user.id, "user-1");
    assert.equal(user.role, "user");
  });

  it("authenticates a bearer token", () => {
    const token = jwt.sign({ id: "user-2", role: "user" }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const user = authenticateConnection(req);
    assert.equal(user.id, "user-2");
  });

  it("authenticates a query token and never trusts query userId", () => {
    const token = jwt.sign({ id: "real-user", role: "user" }, JWT_SECRET);
    const req = {
      url: `/ws/chat?token=${token}&userId=attacker`,
      headers: {},
    };
    const user = authenticateConnection(req);
    assert.equal(user.id, "real-user");
  });
});
