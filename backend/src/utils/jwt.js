const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (payload) => {
  if (!payload || !payload.userId) {
    throw new Error("userId is required to generate token");
  }

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  return jwt.verify(token, env.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};