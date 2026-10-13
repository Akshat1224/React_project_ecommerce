const { describe, it, mock, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../models/Product");
const Order = require("../models/Order");
const {
  searchProductsByKeyword,
  getOwnedOrderStatus,
  answerFAQ,
} = require("./catalog");

function chain(result) {
  const promise = Promise.resolve(result);
  return {
    limit: () => promise,
    sort: () => ({ limit: () => promise }),
    then: promise.then.bind(promise),
  };
}

describe("product lookup and order access", () => {
  let findStub;
  let findByIdStub;

  beforeEach(() => {
    findStub = mock.method(Product, "find", () =>
      chain([
        {
          _id: { toString: () => "p1" },
          title: "Nike Runner",
          image: "n.png",
          price: 90,
          salePrice: 80,
          brand: "nike",
          category: "shoes",
          totalStock: 4,
        },
      ])
    );
    findByIdStub = mock.method(Order, "findById", async () => null);
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("searches catalog products by keyword", async () => {
    const results = await searchProductsByKeyword("nike");
    assert.equal(results.length, 1);
    assert.equal(results[0].title, "Nike Runner");
    assert.equal(results[0].price, 90);
    assert.equal(findStub.mock.callCount() > 0, true);
  });

  it("returns empty results for blank keywords", async () => {
    const results = await searchProductsByKeyword("  ");
    assert.deepEqual(results, []);
  });

  it("answers known FAQs from catalog copy", () => {
    assert.match(answerFAQ("what is your return policy"), /return/i);
  });

  it("rejects unauthenticated order status queries", async () => {
    const result = await getOwnedOrderStatus("aaaaaaaaaaaaaaaaaaaaaaaa", null);
    assert.equal(result.error, "Unauthorized");
  });

  it("rejects order status when the caller does not own the order", async () => {
    findByIdStub.mock.mockImplementation(async () => ({
      _id: { toString: () => "aaaaaaaaaaaaaaaaaaaaaaaa" },
      userId: "owner-1",
      orderStatus: "pending",
      paymentStatus: "paid",
    }));
    const result = await getOwnedOrderStatus("aaaaaaaaaaaaaaaaaaaaaaaa", { id: "other-user" });
    assert.equal(result.error, "Unauthorized - not your order");
  });

  it("returns order status for the owner only", async () => {
    findByIdStub.mock.mockImplementation(async () => ({
      _id: { toString: () => "aaaaaaaaaaaaaaaaaaaaaaaa" },
      userId: "owner-1",
      orderStatus: "shipped",
      paymentStatus: "paid",
    }));
    const result = await getOwnedOrderStatus("aaaaaaaaaaaaaaaaaaaaaaaa", { id: "owner-1" });
    assert.equal(result.error, null);
    assert.match(result.text, /shipped/);
    assert.equal(result.order.orderStatus, "shipped");
  });
});
