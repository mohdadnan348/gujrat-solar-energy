const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const isNonNegativeNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
};

const validateItem = (item, index, category, errors) => {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    errors.push(`${category}[${index}] must be an object`);
    return;
  }

  if (!item.name || typeof item.name !== "string") {
    errors.push(`${category}[${index}] name is required`);
  }

  if (
    item.quantity === undefined ||
    !isNonNegativeNumber(item.quantity)
  ) {
    errors.push(
      `${category}[${index}] quantity must be a non-negative number`
    );
  }

  if (
    item.unit !== undefined &&
    item.unit !== null &&
    typeof item.unit !== "string"
  ) {
    errors.push(`${category}[${index}] unit must be a string`);
  }

  if (
    item.rate !== undefined &&
    !isNonNegativeNumber(item.rate)
  ) {
    errors.push(
      `${category}[${index}] rate must be a non-negative number`
    );
  }

  if (
    item.discount !== undefined &&
    !isNonNegativeNumber(item.discount)
  ) {
    errors.push(
      `${category}[${index}] discount must be a non-negative number`
    );
  }

  if (
    item.tax !== undefined &&
    !isNonNegativeNumber(item.tax)
  ) {
    errors.push(
      `${category}[${index}] tax must be a non-negative number`
    );
  }

  // Amount is calculated by backend.
  if (
    item.amount !== undefined &&
    !isNonNegativeNumber(item.amount)
  ) {
    errors.push(
      `${category}[${index}] amount must be a non-negative number`
    );
  }
};

const validateItemArray = (items, category, errors) => {
  if (items === undefined) {
    return;
  }

  if (!Array.isArray(items)) {
    errors.push(`${category} must be an array`);
    return;
  }

  items.forEach((item, index) => {
    validateItem(item, index, category, errors);
  });
};

const validateSystemConfiguration = (
  req,
  res,
  next
) => {
  const {
    lead,
    solarRequirement,
    customer,
    version,
    panels,
    inverter,
    battery,
    structure,
    accessories,
    installation,
    otherItems,
    subtotal,
    totalDiscount,
    totalTax,
    grandTotal,
    notes,
  } = req.body;

  const errors = [];

  // Lead
  if (!lead || typeof lead !== "string") {
    errors.push("Lead reference is required");
  } else if (!isValidObjectId(lead)) {
    errors.push("Lead reference must be a valid ID");
  }

  // Solar Requirement
  if (
    !solarRequirement ||
    typeof solarRequirement !== "string"
  ) {
    errors.push(
      "Solar requirement reference is required"
    );
  } else if (!isValidObjectId(solarRequirement)) {
    errors.push(
      "Solar requirement reference must be a valid ID"
    );
  }

  // Customer
  if (
    customer !== undefined &&
    customer !== null &&
    customer !== ""
  ) {
    if (
      typeof customer !== "string" ||
      !isValidObjectId(customer)
    ) {
      errors.push(
        "Customer reference must be a valid ID"
      );
    }
  }

  // Version
  if (
    version !== undefined &&
    (!Number.isInteger(version) || version < 1)
  ) {
    errors.push(
      "Version must be a positive integer"
    );
  }

  // Configuration Items
  validateItemArray(
    panels,
    "Panels",
    errors
  );

  validateItemArray(
    inverter,
    "Inverter",
    errors
  );

  validateItemArray(
    battery,
    "Battery",
    errors
  );

  validateItemArray(
    structure,
    "Structure",
    errors
  );

  validateItemArray(
    accessories,
    "Accessories",
    errors
  );

  validateItemArray(
    installation,
    "Installation",
    errors
  );

  validateItemArray(
    otherItems,
    "Other items",
    errors
  );

  // Monetary fields are accepted for response/history
  // but should ultimately be calculated by backend.
  if (
    subtotal !== undefined &&
    !isNonNegativeNumber(subtotal)
  ) {
    errors.push(
      "Subtotal must be a non-negative number"
    );
  }

  if (
    totalDiscount !== undefined &&
    !isNonNegativeNumber(totalDiscount)
  ) {
    errors.push(
      "Total discount must be a non-negative number"
    );
  }

  if (
    totalTax !== undefined &&
    !isNonNegativeNumber(totalTax)
  ) {
    errors.push(
      "Total tax must be a non-negative number"
    );
  }

  if (
    grandTotal !== undefined &&
    !isNonNegativeNumber(grandTotal)
  ) {
    errors.push(
      "Grand total must be a non-negative number"
    );
  }

  // Notes
  if (
    notes !== undefined &&
    notes !== null &&
    notes !== "" &&
    typeof notes !== "string"
  ) {
    errors.push("Notes must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message:
        "System configuration validation failed",
      errors,
    });
  }

  next();
};

const validateSystemConfigurationUpdate = (
  req,
  res,
  next
) => {
  const {
    lead,
    solarRequirement,
    customer,
    version,
    panels,
    inverter,
    battery,
    structure,
    accessories,
    installation,
    otherItems,
    notes,
  } = req.body;

  const errors = [];

  if (lead !== undefined) {
    if (
      typeof lead !== "string" ||
      !isValidObjectId(lead)
    ) {
      errors.push(
        "Lead reference must be a valid ID"
      );
    }
  }

  if (solarRequirement !== undefined) {
    if (
      typeof solarRequirement !== "string" ||
      !isValidObjectId(solarRequirement)
    ) {
      errors.push(
        "Solar requirement reference must be a valid ID"
      );
    }
  }

  if (
    customer !== undefined &&
    customer !== null &&
    customer !== ""
  ) {
    if (
      typeof customer !== "string" ||
      !isValidObjectId(customer)
    ) {
      errors.push(
        "Customer reference must be a valid ID"
      );
    }
  }

  if (
    version !== undefined &&
    (!Number.isInteger(version) || version < 1)
  ) {
    errors.push(
      "Version must be a positive integer"
    );
  }

  validateItemArray(
    panels,
    "Panels",
    errors
  );

  validateItemArray(
    inverter,
    "Inverter",
    errors
  );

  validateItemArray(
    battery,
    "Battery",
    errors
  );

  validateItemArray(
    structure,
    "Structure",
    errors
  );

  validateItemArray(
    accessories,
    "Accessories",
    errors
  );

  validateItemArray(
    installation,
    "Installation",
    errors
  );

  validateItemArray(
    otherItems,
    "Other items",
    errors
  );

  if (
    notes !== undefined &&
    notes !== null &&
    notes !== "" &&
    typeof notes !== "string"
  ) {
    errors.push("Notes must be a string");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message:
        "System configuration update validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateSystemConfiguration,
  validateSystemConfigurationUpdate,
};