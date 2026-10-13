const chatHandler = require("../ws/chat-handler");
const { EVENT_TYPES, generateId } = require("../ws/protocol");
const Order = require("../models/Order");

async function publishOrderStatusUpdate(orderId, expectedUserId) {
  const order = await Order.findById(orderId);
  if (!order) return { published: false, reason: "not_found" };

  const ownerId = String(order.userId || "");
  if (expectedUserId && ownerId !== String(expectedUserId)) {
    return { published: false, reason: "ownership_mismatch" };
  }
  if (!ownerId) return { published: false, reason: "no_owner" };

  const message = {
    id: generateId(),
    type: EVENT_TYPES.ORDER_STATUS_UPDATE,
    payload: {
      orderId: order._id.toString(),
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
    },
    timestamp: Date.now(),
  };

  const delivered = chatHandler.broadcastToUser(ownerId, message);
  return { published: true, delivered, ownerId };
}

module.exports = { publishOrderStatusUpdate };
