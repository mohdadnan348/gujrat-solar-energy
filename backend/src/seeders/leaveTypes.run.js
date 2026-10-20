const mongoose = require("mongoose");
const connectDB = require("../config/db");
const seedLeaveTypes = require("./leaveTypes.seeder");

const run = async () => {
  try {
    await connectDB();
    const results = await seedLeaveTypes();

    console.log("Leave type seeding completed:");
    for (const item of results) {
      console.log(`- ${item.code}: ${item.action}`);
    }
  } catch (error) {
    console.error("LEAVE TYPE SEED ERROR:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run();
