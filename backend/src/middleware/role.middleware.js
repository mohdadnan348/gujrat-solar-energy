const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

module.exports = {
  allowRoles,
};

/**
 * Role-based authorization middleware.
 * Normalizes role values so legacy records such as "Employee" and
 * canonical values such as "EMPLOYEE" are treated consistently.
 * This does not grant access to roles that are not explicitly allowed.
 */
// const normalizeRole = (role) => String(role || "").trim().toUpperCase();

// const allowRoles = (...allowedRoles) => {
//   const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required.",
//       });
//     }

//     const userRole = normalizeRole(req.user.role);
//     if (!normalizedAllowedRoles.includes(userRole)) {
//       return res.status(403).json({
//         success: false,
//         message: "You do not have permission to access this resource.",
//       });
//     }

//     return next();
//   };
// };

// module.exports = { allowRoles };
