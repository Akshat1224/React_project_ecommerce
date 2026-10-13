const { describe, it, mock, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const Order = require("../models/Order");
const chatHandler = require("../ws/chat-handler");
const { EVENT_TYPES } = require("../ws/protocol");
const { publishOrderStatusUpdate } = require("./order-notifier");

describe("order status change events", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it("publishes to the order owner after a persisted status change", async () => {
    mock.method(Order, "findById", async () => ({
      _id: { toString: () => "ord1" },
      userId: "customer-1",
      orderStatus: "shipped",
      paymentStatus: "paid",
    }));
    const broadcast = mock.method(chatHandler, "broadcastToUser", () => 1);

    const result = await publishOrderStatusUpdate("ord1", "customer-1");
    assert.equal(result.published, true);
    assert.equal(result.ownerId, "customer-1");
    assert.equal(broadcast.mock.callCount(), 1);
    const [userId, message] = broadcast.mock.calls[0].arguments;
    assert.equal(userId, "customer-1");
    assert.equal(message.type, EVENT_TYPES.ORDER_STATUS_UPDATE);
    assert.equal(message.payload.status, "shipped");
    assert.equal(message.payload.orderId, "ord1");
  });

  it("does not publish when the expected recipient is not the owner", async () => {
    mock.method(Order, "findById", async () => ({
      _id: { toString: () => "ord1" },
      userId: "customer-1",
      orderStatus: "shipped",
      paymentStatus: "paid",
    }));
    const broadcast = mock.method(chatHandler, "broadcastToUser", () => 1);
    const result = await publishOrderStatusUpdate("ord1", "admin-or-attacker");
    assert.equal(result.published, false);
    assert.equal(broadcast.mock.callCount(), 0);
  });
});
