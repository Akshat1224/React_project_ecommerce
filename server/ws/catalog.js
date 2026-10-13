const Product = require("../models/Product");
const Order = require("../models/Order");

const FAQS = [
  { q: "return policy", a: "You can return eligible items within the stated return window. Check your order details for specifics." },
  { q: "shipping", a: "We offer standard shipping. Delivery times vary by location and availability." },
  { q: "payment", a: "We accept PayPal and the payment methods shown at checkout." },
  { q: "track order", a: "Sign in and open your account orders page, or ask for a specific order ID." },
  { q: "refund", a: "Refunds are processed to the original payment method once items are received and approved." },
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatProductCard(product) {
  return {
    id: product._id.toString(),
    _id: product._id.toString(),
    title: product.title,
    image: product.image,
    price: product.price,
    salePrice: product.salePrice,
    brand: product.brand,
    category: product.category,
    totalStock: product.totalStock,
  };
}

async function searchProductsByKeyword(keyword, limit = 10) {
  if (!keyword || !String(keyword).trim()) return [];
  const regEx = new RegExp(escapeRegex(String(keyword).trim()), "i");
  const results = await Product.find({
    $or: [{ title: regEx }, { description: regEx }, { category: regEx }, { brand: regEx }],
  }).limit(limit);
  return results.map(formatProductCard);
}

async function getProductRecommendations(limit = 5) {
  const results = await Product.find({}).sort({ _id: -1 }).limit(limit);
  return results.map(formatProductCard);
}

async function compareProducts(productIds) {
  if (!Array.isArray(productIds) || productIds.length < 2) return [];
  const ids = productIds.filter(Boolean).slice(0, 4);
  try {
    const products = await Product.find({ _id: { $in: ids } });
    return products.map(formatProductCard);
  } catch (e) {
    return [];
  }
}

function answerFAQ(query) {
  const q = (query || "").toString().trim().toLowerCase();
  if (!q) return null;
  for (const f of FAQS) {
    if (q.includes(f.q)) return f.a;
  }
  return null;
}

async function getOwnedOrderStatus(orderId, user) {
  if (!user || !user.id) {
    return { error: "Unauthorized" };
  }
  if (!orderId) {
    return { error: null, text: "Please provide an orderId to check status." };
  }
  let order;
  try {
    order = await Order.findById(orderId);
  } catch (e) {
    return { error: null, text: "Order not found." };
  }
  if (!order) {
    return { error: null, text: "Order not found." };
  }
  if (String(order.userId) !== String(user.id)) {
    return { error: "Unauthorized - not your order" };
  }
  return {
    error: null,
    text: `Order status: ${order.orderStatus}. Payment status: ${order.paymentStatus}.`,
    order: {
      orderId: order._id.toString(),
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    },
  };
}

module.exports = {
  FAQS,
  formatProductCard,
  searchProductsByKeyword,
  getProductRecommendations,
  compareProducts,
  answerFAQ,
  getOwnedOrderStatus,
};
