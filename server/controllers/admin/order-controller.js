const Order = require("../../models/Order");
const { publishOrderStatusUpdate } = require("../../services/order-notifier");
const ALLOWED_ORDER_STATUSES = new Set([
  "pending",
  "confirmed",
  "inProcess",
  "inShipping",
  "delivered",
  "rejected",
]);

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!ALLOWED_ORDER_STATUSES.has(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status!",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        success: true,
        message: "Order status is unchanged.",
        data: order,
      });
    }

    order.orderStatus = orderStatus;
    order.orderUpdateDate = new Date();
    await order.save();

    publishOrderStatusUpdate(order._id, order.userId).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
