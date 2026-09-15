const ActivityLog = require("../models/ActivityLog");

/**
 * Audit middleware
 *
 * Captures the authenticated user's request details.
 * It stores the audit entry after the response is completed.
 */
const auditMiddleware = (options = {}) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      const shouldLog =
        options.log !== false &&
        req.user &&
        req.method !== "GET";

      if (shouldLog) {
        const action =
          options.action ||
          `${req.method} ${req.baseUrl || ""}${req.path || ""}`;

        const logData = {
          user: req.user.userId || req.user._id,
          action,
          module:
            options.module ||
            req.baseUrl?.split("/").filter(Boolean)[0] ||
            "system",
          description:
            options.description ||
            `${req.method} request performed on ${req.originalUrl}`,
          ipAddress:
            req.ip ||
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress,
          userAgent: req.get("user-agent"),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            params: req.params,
            query: req.query,
          },
        };

        ActivityLog.create(logData).catch((error) => {
          console.error(
            "Audit log creation failed:",
            error.message
          );
        });
      }

      return res.send(body);
    };

    next();
  };
};

module.exports = auditMiddleware;