const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");
const { startJobs } = require("./jobs");

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // Start background jobs
    startJobs();

    // Start Express server
    app.listen(env.port, () => {
      console.log(
        `Server running on http://localhost:${env.port}`
      );
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();