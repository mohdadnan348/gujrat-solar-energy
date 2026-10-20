const LeaveType = require("../models/LeaveType");
const User = require("../models/User");
const { ROLES } = require("../config/constants");

/**
 * Creates the leave types used by the existing Employee/Admin leave forms.
 * Existing records are preserved; company leave-day policy is not overwritten.
 * Set CASUAL_LEAVE_DAYS / SICK_LEAVE_DAYS in backend/.env before first run
 * if your company has a defined allocation. Defaults to 0 rather than guessing.
 */
const seedLeaveTypes = async () => {
  const admin = await User.findOne({ role: ROLES.ADMIN }).select("_id email");

  if (!admin) {
    throw new Error(
      "No Admin user found. Create/login an Admin user first, then rerun this seeder."
    );
  }

  const parseDays = (key) => {
    const raw = process.env[key];
    const value = raw === undefined || raw.trim() === "" ? 0 : Number(raw);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${key} must be a valid number greater than or equal to 0.`);
    }

    return value;
  };

  const leaveTypes = [
    {
      name: "Casual Leave",
      code: "CASUAL",
      description: "Casual leave request",
      totalDays: parseDays("CASUAL_LEAVE_DAYS"),
      isPaid: true,
      isActive: true,
    },
    {
      name: "Sick Leave",
      code: "SICK",
      description: "Sick leave request",
      totalDays: parseDays("SICK_LEAVE_DAYS"),
      isPaid: true,
      isActive: true,
    },
  ];

  const results = [];

  for (const type of leaveTypes) {
    const result = await LeaveType.updateOne(
      { code: type.code },
      { $setOnInsert: { ...type, createdBy: admin._id } },
      { upsert: true, runValidators: true }
    );

    results.push({
      code: type.code,
      action: result.upsertedCount ? "created" : "already exists; preserved",
    });
  }

  return results;
};

module.exports = seedLeaveTypes;
