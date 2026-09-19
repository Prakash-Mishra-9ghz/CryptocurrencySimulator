require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../../src/app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./setup");

let token;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  await request(app).post("/api/auth/register").send({
    username: "trader",
    email: "trader@example.com",
    password: "password123",
  });
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "trader@example.com", password: "password123" });
  token = loginRes.body.token;
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("POST /api/trades/buy", () => {
  test("valid purchase decreases cash and creates a holding + transaction", async () => {
    const res = await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe("BUY");
    expect(res.body.holding.quantity).toBe(0.001);

    const walletRes = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${token}`);
    expect(walletRes.body.virtualCash).toBeLessThan(
      Number(process.env.STARTING_VIRTUAL_BALANCE_INR)
    );
  });

  test("rejects zero/negative quantity", async () => {
    const res = await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0 });
    expect(res.status).toBe(400);
  });

  test("rejects insufficient cash with no partial update", async () => {
    const res = await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 999999 }); // far more than starting balance can afford
    expect(res.status).toBe(409);

    // Verify no partial update happened — balance unchanged
    const walletRes = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${token}`);
    expect(walletRes.body.virtualCash).toBe(Number(process.env.STARTING_VIRTUAL_BALANCE_INR));
  });

  test("rejects unsupported asset", async () => {
    const res = await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "not-a-real-coin", quantity: 1 });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/trades/sell", () => {
  test("valid sale increases cash and decreases/removes holding", async () => {
    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.002 });

    const res = await request(app)
      .post("/api/trades/sell")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });

    expect(res.status).toBe(201);
    expect(res.body.transaction.type).toBe("SELL");
    expect(res.body.holding.quantity).toBeCloseTo(0.001, 6);
  });

  test("selling the entire holding removes it", async () => {
    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });

    const res = await request(app)
      .post("/api/trades/sell")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });

    expect(res.status).toBe(201);
    expect(res.body.holding).toBeNull();
  });

  test("rejects selling more than owned", async () => {
    const res = await request(app)
      .post("/api/trades/sell")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 1 });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/portfolio", () => {
  test("reflects holdings after a trade", async () => {
    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "ethereum", quantity: 0.01 });

    const res = await request(app)
      .get("/api/portfolio")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.holdings).toHaveLength(1);
    expect(res.body.holdings[0].symbol).toBe("ETH");
  });
});

describe("GET /api/ledger/verify", () => {
  test("chain is valid after several trades", async () => {
    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });
    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "ethereum", quantity: 0.01 });

    const res = await request(app)
      .get("/api/ledger/verify")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.totalTransactions).toBeGreaterThanOrEqual(2);
  });
});

describe("Authorization across users", () => {
  test("a user cannot see another user's portfolio", async () => {
    await request(app).post("/api/auth/register").send({
      username: "other",
      email: "other@example.com",
      password: "password123",
    });
    const otherLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "other@example.com", password: "password123" });

    await request(app)
      .post("/api/trades/buy")
      .set("Authorization", `Bearer ${token}`)
      .send({ assetId: "bitcoin", quantity: 0.001 });

    const otherPortfolio = await request(app)
      .get("/api/portfolio")
      .set("Authorization", `Bearer ${otherLogin.body.token}`);

    expect(otherPortfolio.body.holdings).toHaveLength(0);
  });
});
