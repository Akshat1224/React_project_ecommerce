const jwt = require("jsonwebtoken");
const { URL } = require("url");

const AUTH_COOKIE_KEY = "token";
const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function extractTokenFromRequest(req) {
  const cookies = parseCookies(req.headers && req.headers.cookie);
  if (cookies[AUTH_COOKIE_KEY]) return cookies[AUTH_COOKIE_KEY];

  const auth = req.headers && req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.substring(7);

  if (req.url) {
    try {
      const parsed = new URL(req.url, "http://localhost");
      const queryToken = parsed.searchParams.get("token");
      if (queryToken) return queryToken;
    } catch (e) {
      return null;
    }
  }

  return null;
}

function authenticateConnection(req) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) return null;
    return {
      id: String(decoded.id),
      role: decoded.role,
      email: decoded.email,
      userName: decoded.userName,
    };
  } catch (e) {
    return null;
  }
}

module.exports = {
  authenticateConnection,
  extractTokenFromRequest,
  JWT_SECRET,
};
