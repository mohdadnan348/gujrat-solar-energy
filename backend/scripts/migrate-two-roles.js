/**
 * One-time migration: collapse legacy MANAGER/HR accounts to EMPLOYEE.
 * Run from backend directory after backing up MongoDB:
 *   node scripts/migrate-two-roles.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function migrate() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGODB_URI (or MONGO_URI) in backend/.env");
  await mongoose.connect(uri);

  const legacyRoles = ["MANAGER", "HR", "Manager", "Hr", "manager", "hr"];
  const users = await mongoose.connection.collection("users").updateMany(
    { role: { $in: legacyRoles } },
    { $set: { role: "EMPLOYEE" } }
  );
  const employees = await mongoose.connection.collection("employees").updateMany(
    { role: { $in: legacyRoles } },
    { $set: { role: "EMPLOYEE" } }
  );
  await mongoose.connection.collection("roles").deleteMany({
    name: { $in: legacyRoles },
  });
  console.log(`Users converted: ${users.modifiedCount}`);
  console.log(`Employees converted: ${employees.modifiedCount}`);
  console.log("Legacy Manager/HR role records removed.");
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error("Role migration failed:", error.message);
  try { await mongoose.disconnect(); } catch {}
  process.exitCode = 1;
});
