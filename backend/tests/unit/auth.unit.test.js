process.env.JWT_SECRET = "test-secret-for-unit-tests";
process.env.JWT_EXPIRES_IN = "1h";

const { hashPassword, comparePassword, signToken, verifyToken } = require("../../src/utils/auth");

describe("password hashing", () => {
  test("hash is not the same as the plain password", async () => {
    const hash = await hashPassword("myPassword123");
    expect(hash).not.toBe("myPassword123");
  });

  test("comparePassword returns true for the correct password", async () => {
    const hash = await hashPassword("myPassword123");
    await expect(comparePassword("myPassword123", hash)).resolves.toBe(true);
  });

  test("comparePassword returns false for the wrong password", async () => {
    const hash = await hashPassword("myPassword123");
    await expect(comparePassword("wrongPassword", hash)).resolves.toBe(false);
  });
});

describe("JWT sign/verify", () => {
  test("signed token can be verified and contains the userId", () => {
    const token = signToken("user123");
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user123");
  });

  test("verifyToken throws on a tampered token", () => {
    const token = signToken("user123");
    const tampered = token.slice(0, -2) + "xx";
    expect(() => verifyToken(tampered)).toThrow();
  });

  test("verifyToken throws on garbage input", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow();
  });
});
