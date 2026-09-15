const User = require("../models/User");
const { hashPassword } = require("../utils/password");

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gujratsolarenergy.com";
  const adminPassword =
    process.env.ADMIN_PASSWORD || "Admin@12345";

  const existingAdmin = await User.findOne({
    email: adminEmail.toLowerCase(),
  });

  if (existingAdmin) {
    return existingAdmin;
  }

  const hashedPassword = await hashPassword(adminPassword);

  const admin = await User.create({
    username: "admin",
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: "Admin",
    status: "ACTIVE",
  });

  return admin;
};

module.exports = seedAdmin;