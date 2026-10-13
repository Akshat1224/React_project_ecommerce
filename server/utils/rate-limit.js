function createRateLimiter({ windowMs = 10000, max = 20 } = {}) {
  const hits = new Map();

  function allow(key) {
    const now = Date.now();
    const bucket = hits.get(key) || [];
    const recent = bucket.filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    return true;
  }

  function reset(key) {
    if (key) hits.delete(key);
    else hits.clear();
  }

  return { allow, reset };
}

module.exports = { createRateLimiter };
