const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { validateMessage, generateId, EVENT_TYPES, MAX_MESSAGE_LENGTH } = require("./protocol");

describe("websocket message validation", () => {
  it("accepts a chat message and assigns an id", () => {
    const msg = validateMessage({ type: EVENT_TYPES.CHAT_MESSAGE, payload: { content: "hi" } });
    assert.equal(msg.type, EVENT_TYPES.CHAT_MESSAGE);
    assert.equal(msg.payload.content, "hi");
    assert.ok(msg.id);
  });

  it("preserves client message ids", () => {
    const msg = validateMessage({ id: "123", type: EVENT_TYPES.PING, payload: {} });
    assert.equal(msg.id, "123");
    assert.equal(msg.type, EVENT_TYPES.PING);
  });

  it("rejects missing type, non-objects, and unknown events", () => {
    assert.equal(validateMessage({ payload: {} }), null);
    assert.equal(validateMessage(null), null);
    assert.equal(validateMessage("x"), null);
    assert.equal(validateMessage({ type: EVENT_TYPES.ORDER_STATUS_UPDATE, payload: {} }), null);
    assert.equal(validateMessage({ type: EVENT_TYPES.CHAT_MESSAGE, payload: "x" }), null);
  });

  it("rejects oversized chat content", () => {
    const msg = validateMessage({
      type: EVENT_TYPES.CHAT_MESSAGE,
      payload: { content: "a".repeat(MAX_MESSAGE_LENGTH + 1) },
    });
    assert.equal(msg.error, "MESSAGE_TOO_LONG");
  });

  it("generates unique ids", () => {
    assert.notEqual(generateId(), generateId());
  });
});
