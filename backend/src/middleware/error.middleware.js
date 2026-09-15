const errorMiddleware = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = err.statusCode || err.status || 500;

  let message =
    err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(err.errors).map(
      (error) => ({
        field: error.path,
        message: error.message,
      })
    );

    return res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(err.keyPattern || {});

    return res.status(statusCode).json({
      success: false,
      message: fields.length
        ? `${fields.join(", ")} already exists`
        : "Duplicate record already exists",
    });
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;

    return res.status(statusCode).json({
      success: false,
      message: `Invalid ${err.path || "resource"} ID`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;

    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;

    message = "Authentication token has expired";
  }

  // Multer errors
  if (err.name === "MulterError") {
    statusCode = 400;

    return res.status(statusCode).json({
      success: false,
      message: err.message || "File upload failed",
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

module.exports = errorMiddleware;