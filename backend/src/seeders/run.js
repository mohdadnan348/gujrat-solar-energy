require("dotenv").config();

const connectDB = require("../config/db");
const seedAdmin = require("./admin.seeder");

const run = async () => {
  try {
    await connectDB();

    const admin = await seedAdmin();

    console.log("=================================");
    console.log("Admin created/found successfully");
    console.log("Email:", admin.email);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("SEED ERROR:", error);
    process.exit(1);
  }
};

run();