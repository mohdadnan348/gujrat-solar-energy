const { SYSTEM_TYPE } = require("../config/constants");

const isNonNegativeNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
};

const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const validateSolarRequirement = (req, res, next) => {
  const {
    lead,
    customer,
    requiredKw,
    monthlyBill,
    monthlyUnits,
    roofType,
    roofArea,
    siteAddress,
    location,
    connectionType,
    sanctionedLoad,
    systemType,
    batteryRequired,
    batteryCapacity,
    siteSurveyRequired,
    siteSurveyCompleted,
    photos,
    documents,
    notes,
  } = req.body;

  const errors = [];

  // Lead
  if (!lead || typeof lead !== "string") {
    errors.push("Lead reference is required");
  } else if (!isValidObjectId(lead)) {
    errors.push("Lead reference must be a valid ID");
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
      errors.push("Customer reference must be a valid ID");
    }
  }

  // Required kW
  if (
    requiredKw !== undefined &&
    !isNonNegativeNumber(requiredKw)
  ) {
    errors.push("Required kW must be a non-negative number");
  }

  // Monthly Bill
  if (
    monthlyBill !== undefined &&
    !isNonNegativeNumber(monthlyBill)
  ) {
    errors.push("Monthly bill must be a non-negative number");
  }

  // Monthly Units
  if (
    monthlyUnits !== undefined &&
    !isNonNegativeNumber(monthlyUnits)
  ) {
    errors.push("Monthly units must be a non-negative number");
  }

  // Roof Type
  if (
    roofType !== undefined &&
    roofType !== null &&
    roofType !== "" &&
    typeof roofType !== "string"
  ) {
    errors.push("Roof type must be a string");
  }

  // Roof Area
  if (
    roofArea !== undefined &&
    !isNonNegativeNumber(roofArea)
  ) {
    errors.push("Roof area must be a non-negative number");
  }

  // Site Address
  if (
    siteAddress !== undefined &&
    siteAddress !== null &&
    siteAddress !== "" &&
    typeof siteAddress !== "string"
  ) {
    errors.push("Site address must be a string");
  }

  // Location
  if (
    location !== undefined &&
    location !== null &&
    location !== "" &&
    typeof location !== "string"
  ) {
    errors.push("Location must be a string");
  }

  // Connection Type
  if (
    connectionType !== undefined &&
    connectionType !== null &&
    connectionType !== "" &&
    typeof connectionType !== "string"
  ) {
    errors.push("Connection type must be a string");
  }

  // Sanctioned Load
  if (
    sanctionedLoad !== undefined &&
    !isNonNegativeNumber(sanctionedLoad)
  ) {
    errors.push(
      "Sanctioned load must be a non-negative number"
    );
  }

  // System Type
  if (!systemType || typeof systemType !== "string") {
    errors.push("System type is required");
  } else if (
    !Object.values(SYSTEM_TYPE).includes(systemType)
  ) {
    errors.push(
      `Invalid system type. Allowed types: ${Object.values(
        SYSTEM_TYPE
      ).join(", ")}`
    );
  }

  // Battery Required
  if (
    batteryRequired !== undefined &&
    typeof batteryRequired !== "boolean"
  ) {
    errors.push("Battery required must be a boolean");
  }

  // Battery Capacity
  if (
    batteryCapacity !== undefined &&
    !isNonNegativeNumber(batteryCapacity)
  ) {
    errors.push(
      "Battery capacity must be a non-negative number"
    );
  }

  // Site Survey Required
  if (
    siteSurveyRequired !== undefined &&
    typeof siteSurveyRequired !== "boolean"
  ) {
    errors.push(
      "Site survey required must be a boolean"
    );
  }

  // Site Survey Completed
  if (
    siteSurveyCompleted !== undefined &&
    typeof siteSurveyCompleted !== "boolean"
  ) {
    errors.push(
      "Site survey completed must be a boolean"
    );
  }

  // Photos
  if (photos !== undefined) {
    if (!Array.isArray(photos)) {
      errors.push("Photos must be an array");
    } else if (
      photos.some((photo) => typeof photo !== "string")
    ) {
      errors.push("Each photo must be a string");
    }
  }

  // Documents
  if (documents !== undefined) {
    if (!Array.isArray(documents)) {
      errors.push("Documents must be an array");
    } else if (
      documents.some(
        (document) => typeof document !== "string"
      )
    ) {
      errors.push("Each document must be a string");
    }
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
      message: "Solar requirement validation failed",
      errors,
    });
  }

  next();
};

const validateSolarRequirementUpdate = (
  req,
  res,
  next
) => {
  const {
    lead,
    customer,
    requiredKw,
    monthlyBill,
    monthlyUnits,
    roofType,
    roofArea,
    siteAddress,
    location,
    connectionType,
    sanctionedLoad,
    systemType,
    batteryRequired,
    batteryCapacity,
    siteSurveyRequired,
    siteSurveyCompleted,
    photos,
    documents,
    notes,
  } = req.body;

  const errors = [];

  if (lead !== undefined) {
    if (
      typeof lead !== "string" ||
      !isValidObjectId(lead)
    ) {
      errors.push("Lead reference must be a valid ID");
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
      errors.push("Customer reference must be a valid ID");
    }
  }

  if (
    requiredKw !== undefined &&
    !isNonNegativeNumber(requiredKw)
  ) {
    errors.push("Required kW must be a non-negative number");
  }

  if (
    monthlyBill !== undefined &&
    !isNonNegativeNumber(monthlyBill)
  ) {
    errors.push("Monthly bill must be a non-negative number");
  }

  if (
    monthlyUnits !== undefined &&
    !isNonNegativeNumber(monthlyUnits)
  ) {
    errors.push("Monthly units must be a non-negative number");
  }

  if (
    roofType !== undefined &&
    roofType !== null &&
    roofType !== "" &&
    typeof roofType !== "string"
  ) {
    errors.push("Roof type must be a string");
  }

  if (
    roofArea !== undefined &&
    !isNonNegativeNumber(roofArea)
  ) {
    errors.push("Roof area must be a non-negative number");
  }

  if (
    siteAddress !== undefined &&
    siteAddress !== null &&
    siteAddress !== "" &&
    typeof siteAddress !== "string"
  ) {
    errors.push("Site address must be a string");
  }

  if (
    location !== undefined &&
    location !== null &&
    location !== "" &&
    typeof location !== "string"
  ) {
    errors.push("Location must be a string");
  }

  if (
    connectionType !== undefined &&
    connectionType !== null &&
    connectionType !== "" &&
    typeof connectionType !== "string"
  ) {
    errors.push("Connection type must be a string");
  }

  if (
    sanctionedLoad !== undefined &&
    !isNonNegativeNumber(sanctionedLoad)
  ) {
    errors.push(
      "Sanctioned load must be a non-negative number"
    );
  }

  if (systemType !== undefined) {
    if (
      typeof systemType !== "string" ||
      !Object.values(SYSTEM_TYPE).includes(systemType)
    ) {
      errors.push(
        `Invalid system type. Allowed types: ${Object.values(
          SYSTEM_TYPE
        ).join(", ")}`
      );
    }
  }

  if (
    batteryRequired !== undefined &&
    typeof batteryRequired !== "boolean"
  ) {
    errors.push("Battery required must be a boolean");
  }

  if (
    batteryCapacity !== undefined &&
    !isNonNegativeNumber(batteryCapacity)
  ) {
    errors.push(
      "Battery capacity must be a non-negative number"
    );
  }

  if (
    siteSurveyRequired !== undefined &&
    typeof siteSurveyRequired !== "boolean"
  ) {
    errors.push(
      "Site survey required must be a boolean"
    );
  }

  if (
    siteSurveyCompleted !== undefined &&
    typeof siteSurveyCompleted !== "boolean"
  ) {
    errors.push(
      "Site survey completed must be a boolean"
    );
  }

  if (photos !== undefined) {
    if (!Array.isArray(photos)) {
      errors.push("Photos must be an array");
    } else if (
      photos.some((photo) => typeof photo !== "string")
    ) {
      errors.push("Each photo must be a string");
    }
  }

  if (documents !== undefined) {
    if (!Array.isArray(documents)) {
      errors.push("Documents must be an array");
    } else if (
      documents.some(
        (document) => typeof document !== "string"
      )
    ) {
      errors.push("Each document must be a string");
    }
  }

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
      message: "Solar requirement update validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateSolarRequirement,
  validateSolarRequirementUpdate,
};