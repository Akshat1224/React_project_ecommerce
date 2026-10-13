const { EVENT_TYPES, generateId } = require("../ws/protocol");

function getAiProvider() {
  const defaultProvider =
    process.env.NODE_ENV === "production" ? "openai" : "ollama";
  return (process.env.AI_PROVIDER || defaultProvider).toLowerCase();
}

function isAiConfigured() {
  const provider = getAiProvider();
  if (provider === "ollama") return true;
  return (
    Boolean(process.env.AI_API_KEY) &&
    ["openai", "openai-compatible"].includes(provider)
  );
}

function buildFactsPrompt(userText, facts) {
  return [
    {
      role: "system",
      content:
        "You are NexCart's shopping assistant. Use ONLY the provided JSON facts. Never invent products, prices, stock, discounts, or order statuses. If facts are missing, say you do not have that information. Keep replies concise.",
    },
    {
      role: "user",
      content: `Customer message:\n${userText}\n\nVerified facts JSON:\n${JSON.stringify(facts)}`,
    },
  ];
}

async function streamAiReply({ userText, facts, onChunk }) {
  if (!isAiConfigured()) return null;

  const provider = getAiProvider();
  const defaultBaseUrl =
    provider === "ollama"
      ? "http://127.0.0.1:11434/v1"
      : "https://api.openai.com/v1";
  const base = (process.env.AI_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
  const model =
    process.env.AI_MODEL ||
    (provider === "ollama" ? "qwen2.5:3b" : "gpt-4o-mini");
  const url = `${base}/chat/completions`;
  const headers = { "Content-Type": "application/json" };
  if (provider !== "ollama") {
    headers.Authorization = `Bearer ${process.env.AI_API_KEY}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        stream: true,
        messages: buildFactsPrompt(userText, facts),
      }),
    });
  } catch (e) {
    return null;
  }

  if (!response.ok || !response.body) return null;

  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  try {
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          continue;
        }
        const delta =
          parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
        const piece = delta && delta.content;
        if (piece) {
          full += piece;
          if (typeof onChunk === "function") onChunk(piece);
        }
      }
    }
  } catch (e) {
    return full || null;
  }

  return full || null;
}

async function maybeStreamToSocket(ws, requestId, userText, facts) {
  if (!isAiConfigured()) return null;

  const aiText = await streamAiReply({
    userText,
    facts,
    onChunk: (piece) => {
      if (ws.readyState !== 1) return;
      ws.send(
        JSON.stringify({
          id: requestId || generateId(),
          type: EVENT_TYPES.CHAT_RESPONSE_CHUNK,
          payload: { content: piece },
          timestamp: Date.now(),
        }),
      );
    },
  });

  return aiText;
}

module.exports = { isAiConfigured, streamAiReply, maybeStreamToSocket };
