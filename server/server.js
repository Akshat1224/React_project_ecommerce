require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nexcart")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;
const allowedCorsOrigins = (
  process.env.CORS_ORIGIN ||
  "https://shoeshopawesome.netlify.app,http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedCorsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

//Authentication
app.use("/api/auth", authRouter);

//Admin
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

//Shop
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

//Common Feature
app.use("/api/common/feature", commonFeatureRouter);

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  path: process.env.WS_PATH || "/ws/chat",
  maxPayload: parseInt(process.env.WS_MAX_PAYLOAD_BYTES, 10) || 16384,
});

const { handleChatConnection } = require("./ws/chat-handler");
wss.on("connection", (ws, req) => {
  handleChatConnection(ws, req);
});

server.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));

module.exports = { app, server, wss };
