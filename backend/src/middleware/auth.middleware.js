const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const { USER_STATUS } = require("../config/constants");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

module.exports = {
  protect,
};