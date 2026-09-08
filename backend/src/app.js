const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

// Logger
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1", routes);

// Health Check
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Solar Company Management API is running",
    environment: env.nodeEnv,
  });
});

// Root Route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Solar Company Management API",
  });
});

module.exports = app;