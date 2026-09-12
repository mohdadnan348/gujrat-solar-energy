const AuditLog = require("../models/AuditLog");

const auditMiddleware = async (req, res, next) => {
  try {
    const startTime = Date.now();

    const userId = req.user?.id || req.user?._id || null;

    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      const duration = Date.now() - startTime;

      const auditData = {
        user: userId,
        method: req.method,
        endpoint: req.originalUrl,
        ipAddress:
          req.headers["x-forwarded-for"]?.split(",")[0] ||
          req.socket?.remoteAddress ||
          req.ip,
        userAgent: req.headers["user-agent"],
        statusCode: res.statusCode,
        duration,
      };

      AuditLog.create(auditData).catch((error) => {
        console.error("Audit Log Error:", error);
      });

      return originalSend.call(this, body);
    };

    req.audit = {
      startTime,
      userId,
    };

    next();
  } catch (error) {
    console.error("Audit Middleware Error:", error);
    next();
  }
};

module.exports = auditMiddleware;