const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { hashPassword, comparePassword, signToken } = require("../utils/auth");

const STARTING_BALANCE = Number(process.env.STARTING_VIRTUAL_BALANCE_INR);

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username, email, passwordHash });

  // Every new user gets the approved starting virtual balance (architecture
  // decision #3). Created here so a user can never exist without a wallet.
  await Wallet.create({ userId: user._id, virtualCash: STARTING_BALANCE });

  return res.status(201).json({ message: "Account created.", user: user.toSafeObject() });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user._id.toString());
  return res.json({ token, user: user.toSafeObject() });
}

module.exports = { register, login };
