const mongoose = require("mongoose");

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateCustomer = (req, res, next) => {
  const {
    customerId,
    lead,
    name,
    companyName,
    mobile,
    alternateMobile,
    email,
    address,
    city,
    state,
    pincode,
    gstNumber,
    panNumber,
    customerType,
    siteAddress,
    notes,
  } = req.body;

  const errors = [];

  if (!customerId || typeof customerId !== "string") {
    errors.push("Customer ID is required");
  }

  if (
    lead !== undefined &&
    lead !== null &&
    lead !== ""
  ) {
    if (typeof lead !== "string") {
      errors.push("Lead reference must be a string");
    } else if (!isValidObjectId(lead)) {
      errors.push("Lead reference is invalid");
    }
  }

  if (!name || typeof name !== "string") {
    errors.push("Customer name is required");
  } else if (name.trim().length < 2) {
    errors.push(
      "Customer name must be at least 2 characters"
    );
  }

  if (
    companyName !== undefined &&
    companyName !== null &&
    companyName !== "" &&
    typeof companyName !== "string"
  ) {
    errors.push("Company name must be a string");
  }

  if (!mobile || typeof mobile !== "string") {
    errors.push("Customer mobile number is required");
  }

  if (
    alternateMobile !== undefined &&
    alternateMobile !== null &&
    alternateMobile !== "" &&
    typeof alternateMobile !== "string"
  ) {
    errors.push("Alternate mobile must be a string");
  }

  if (
    email !== undefined &&
    email !== null &&
    email !== ""
  ) {
    if (typeof email !== "string") {
      errors.push("Customer email must be a string");
    } else if (!isValidEmail(email)) {
      errors.push("Please provide a valid customer email");
    }
  }

  const stringFields = [
    ["address", address],
    ["city", city],
    ["state", state],
    ["pincode", pincode],
    ["gstNumber", gstNumber],
    ["panNumber", panNumber],
    ["siteAddress", siteAddress],
    ["notes", notes],
  ];

  stringFields.forEach(([field, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      typeof value !== "string"
    ) {
      errors.push(`${field} must be a string`);
    }
  });

  if (
    customerType !== undefined &&
    customerType !== null &&
    customerType !== ""
  ) {
    if (
      !["Individual", "Business"].includes(
        customerType
      )
    ) {
      errors.push(
        "Customer type must be Individual or Business"
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Customer validation failed",
      errors,
    });
  }

  next();
};

const validateCustomerUpdate = (req, res, next) => {
  const {
    lead,
    name,
    companyName,
    mobile,
    alternateMobile,
    email,
    address,
    city,
    state,
    pincode,
    gstNumber,
    panNumber,
    customerType,
    siteAddress,
    notes,
    status,
  } = req.body;

  const errors = [];

  if (
    lead !== undefined &&
    lead !== null &&
    lead !== ""
  ) {
    if (typeof lead !== "string") {
      errors.push("Lead reference must be a string");
    } else if (!isValidObjectId(lead)) {
      errors.push("Lead reference is invalid");
    }
  }

  if (name !== undefined) {
    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      errors.push(
        "Customer name must be at least 2 characters"
      );
    }
  }

  if (
    companyName !== undefined &&
    companyName !== null &&
    companyName !== "" &&
    typeof companyName !== "string"
  ) {
    errors.push("Company name must be a string");
  }

  if (mobile !== undefined) {
    if (
      typeof mobile !== "string" ||
      mobile.trim() === ""
    ) {
      errors.push(
        "Customer mobile number must be a valid string"
      );
    }
  }

  if (
    alternateMobile !== undefined &&
    alternateMobile !== null &&
    alternateMobile !== "" &&
    typeof alternateMobile !== "string"
  ) {
    errors.push("Alternate mobile must be a string");
  }

  if (
    email !== undefined &&
    email !== null &&
    email !== ""
  ) {
    if (typeof email !== "string") {
      errors.push("Customer email must be a string");
    } else if (!isValidEmail(email)) {
      errors.push("Please provide a valid customer email");
    }
  }

  const stringFields = [
    ["address", address],
    ["city", city],
    ["state", state],
    ["pincode", pincode],
    ["gstNumber", gstNumber],
    ["panNumber", panNumber],
    ["siteAddress", siteAddress],
    ["notes", notes],
  ];

  stringFields.forEach(([field, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      typeof value !== "string"
    ) {
      errors.push(`${field} must be a string`);
    }
  });

  if (customerType !== undefined) {
    if (
      !["Individual", "Business"].includes(
        customerType
      )
    ) {
      errors.push(
        "Customer type must be Individual or Business"
      );
    }
  }

  if (status !== undefined) {
    if (
      !["Active", "Inactive"].includes(status)
    ) {
      errors.push(
        "Customer status must be Active or Inactive"
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Customer update validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateCustomer,
  validateCustomerUpdate,
};