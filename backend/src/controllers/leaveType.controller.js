const LeaveType = require("../models/LeaveType");

const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await LeaveType.find({
      isActive: true,
    })
      .select("_id name code totalDays isPaid")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: leaveTypes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
};