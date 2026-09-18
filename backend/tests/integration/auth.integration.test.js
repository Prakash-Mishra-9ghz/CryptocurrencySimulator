require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const app = require("../../src/app");
const { connectTestDB, clearTestDB, disconnectTestDB } = require("./setup");

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe("POST /api/auth/register", () => {
  test("valid registration creates an account and a starting wallet", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.passwordHash).toBeUndefined(); // never exposed
  });

  test("duplicate email registration is rejected", async () => {
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "dup@example.com",
      password: "password123",
    });
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser2",
      email: "dup@example.com",
      password: "password456",
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      username: "loginuser",
      email: "login@example.com",
      password: "password123",
    });
  });

  test("valid credentials return a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("invalid credentials are rejected with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/wallet (authorization)", () => {
  test("rejects requests with no token", async () => {
    const res = await request(app).get("/api/wallet");
    expect(res.status).toBe(401);
  });

  test("rejects requests with an invalid token", async () => {
    const res = await request(app).get("/api/wallet").set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
  });

  test("valid token returns the starting virtual balance", async () => {
    await request(app).post("/api/auth/register").send({
      username: "walletuser",
      email: "wallet@example.com",
      password: "password123",
    });
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "wallet@example.com", password: "password123" });

    const res = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.virtualCash).toBe(Number(process.env.STARTING_VIRTUAL_BALANCE_INR));
  });
});
