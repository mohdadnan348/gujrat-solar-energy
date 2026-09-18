const validateRegister = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = [];

  // Email
  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email");
  }

  // Password
  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  // Username
  if (username !== undefined && username !== null && username !== "") {
    if (typeof username !== "string") {
      errors.push("Username must be a string");
    } else if (username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }
  }

  // Role
  if (role !== undefined && typeof role !== "string") {
    errors.push("Role must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};


const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};


const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  // Email
  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please provide a valid email");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};


const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;
  const errors = [];

  // Token
  if (!token || typeof token !== "string") {
    errors.push("Reset token is required");
  }

  // New Password
  if (!newPassword || typeof newPassword !== "string") {
    errors.push("New password is required");
  } else if (newPassword.length < 6) {
    errors.push("New password must be at least 6 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};


module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};