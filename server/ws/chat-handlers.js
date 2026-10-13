const { EVENT_TYPES, MAX_MESSAGE_LENGTH, generateId } = require("./protocol");
const {
  searchProductsByKeyword,
  getProductRecommendations,
  compareProducts,
  answerFAQ,
  getOwnedOrderStatus,
} = require("./catalog");
const { maybeStreamToSocket } = require("../services/ai-provider");

function extractOrderId(payload, content) {
  if (payload.orderId) return payload.orderId;
  const match = content.match(/\b[a-f0-9]{24}\b/i);
  return match ? match[0] : null;
}

function extractCompareIds(payload) {
  if (Array.isArray(payload.productIds)) return payload.productIds.map(String);
  return [];
}

async function resolveIntent(content, payload) {
  if (content.includes("recommend") || content.includes("suggest")) {
    const products = await getProductRecommendations(5);
    return {
      intent: "recommend",
      products,
      fallbackText: products.length
        ? "Here are some product recommendations from the catalog:"
        : "No products are available in the catalog right now.",
    };
  }

  if (content.includes("compare")) {
    const ids = extractCompareIds(payload);
    let products = await compareProducts(ids);
    if (!products.length) {
      const keyword = content.replace(/compare/gi, " ").replace(/\band\b|\bvs\b/gi, " ").trim();
      products = await searchProductsByKeyword(keyword, 4);
    }
    return {
      intent: "compare",
      products,
      fallbackText: products.length
        ? "Comparison based on catalog data:"
        : "Need at least two catalog products to compare. Send productIds or product names.",
    };
  }

  if (content.includes("search") || payload.keyword) {
    const keyword = payload.keyword || content.replace(/search/gi, " ").trim();
    const products = await searchProductsByKeyword(keyword);
    return {
      intent: "search",
      products,
      fallbackText: products.length
        ? `Search results for ${keyword}:`
        : "No matching products found in the catalog.",
      keyword,
    };
  }

  if (content.includes("order") && (content.includes("status") || content.includes("track"))) {
    return { intent: "order_status" };
  }

  const faq = answerFAQ(content);
  if (faq) {
    return { intent: "faq", products: null, fallbackText: faq };
  }

  const products = await searchProductsByKeyword(content, 5);
  if (products.length) {
    return {
      intent: "search",
      products,
      fallbackText: "Here are catalog matches for your question:",
    };
  }

  const recs = await getProductRecommendations(3);
  return {
    intent: "help",
    products: recs,
    fallbackText:
      "I can help with search, compare, recommendations, FAQs, or order status. Here are a few catalog products:",
  };
}

async function handleChatMessage(ws, msg) {
  const now = Date.now();

  if (msg.type === EVENT_TYPES.PING) {
    ws.send(
      JSON.stringify({
        id: msg.id,
        type: EVENT_TYPES.PONG,
        payload: {},
        timestamp: now,
      })
    );
    return;
  }

  if (msg.type !== EVENT_TYPES.CHAT_MESSAGE) {
    ws.send(
      JSON.stringify({
        id: msg.id,
        type: EVENT_TYPES.ERROR,
        payload: { error: "Unsupported event type", code: "UNSUPPORTED_TYPE" },
        timestamp: now,
      })
    );
    return;
  }

  const rawContent = (msg.payload && msg.payload.content) || "";
  if (rawContent.length > MAX_MESSAGE_LENGTH) {
    ws.send(
      JSON.stringify({
        id: generateId(),
        type: EVENT_TYPES.ERROR,
        payload: { error: "Message too long", code: "MESSAGE_TOO_LONG" },
        timestamp: now,
      })
    );
    return;
  }

  const content = rawContent.trim().toLowerCase();
  const resolved = await resolveIntent(content, msg.payload || {});

  if (resolved.intent === "order_status") {
    const orderId = extractOrderId(msg.payload || {}, rawContent);
    const result = await getOwnedOrderStatus(orderId, ws.user);
    if (result.error) {
      ws.send(
        JSON.stringify({
          id: generateId(),
          type: EVENT_TYPES.ERROR,
          payload: { error: result.error, code: "UNAUTHORIZED" },
          timestamp: now,
        })
      );
      return;
    }
    const facts = { order: result.order || null, note: result.text };
    const aiText = await maybeStreamToSocket(ws, msg.id, rawContent, facts);
    ws.send(
      JSON.stringify({
        id: msg.id,
        type: EVENT_TYPES.CHAT_RESPONSE,
        payload: { content: aiText || result.text, products: null },
        timestamp: Date.now(),
      })
    );
    return;
  }

  const facts = {
    intent: resolved.intent,
    products: resolved.products || [],
    keyword: resolved.keyword || null,
  };
  const aiText = await maybeStreamToSocket(ws, msg.id, rawContent, facts);
  ws.send(
    JSON.stringify({
      id: msg.id,
      type: EVENT_TYPES.CHAT_RESPONSE,
      payload: {
        content: aiText || resolved.fallbackText,
        products: resolved.products,
      },
      timestamp: Date.now(),
    })
  );
}

module.exports = { handleChatMessage };
