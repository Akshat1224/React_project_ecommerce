const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("./rate-limit");

describe("rate limiter", () => {
  it("allows traffic under the cap and blocks after", () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 2 });
    assert.equal(limiter.allow("a"), true);
    assert.equal(limiter.allow("a"), true);
    assert.equal(limiter.allow("a"), false);
    limiter.reset("a");
    assert.equal(limiter.allow("a"), true);
  });
});
