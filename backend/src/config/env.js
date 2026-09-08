const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

if (!env.mongoUri) {
  throw new Error("MONGO_URI is missing in .env file");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is missing in .env file");
}

module.exports = env;