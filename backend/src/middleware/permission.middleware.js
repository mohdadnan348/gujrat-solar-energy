const Permission = require("../models/Permission");

const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (requiredPermissions.length === 0) {
        return next();
      }

      const permissions = await Permission.find({
        name: { $in: requiredPermissions },
        isActive: true,
      }).select("name");

      const availablePermissions = permissions.map(
        (permission) => permission.name
      );

      const hasPermission = requiredPermissions.every((permission) =>
        availablePermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have the required permission.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requirePermission,
};