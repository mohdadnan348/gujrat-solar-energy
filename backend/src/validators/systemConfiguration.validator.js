/* =========================================================
   SYSTEM CONFIGURATION VALIDATOR
========================================================= */

const mongoose = require("mongoose");

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(
    value
  );
};

const isNonNegativeNumber = (
  value
) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
};

const isPositiveNumber = (
  value
) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
};

const isOptionalString = (
  value
) => {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    typeof value === "string"
  );
};

/* =========================================================
   COMPONENT TYPES
========================================================= */

const COMPONENT_TYPES = [
  "SOLAR_PANEL",
  "INVERTER",
  "BATTERY",
  "STRUCTURE",
  "ACCESSORY",
  "INSTALLATION",
  "OTHER",
];

/* =========================================================
   VALIDATE ONE COMPONENT
========================================================= */

const validateComponent = (
  item,
  index,
  errors
) => {
  const prefix =
    `Components[${index}]`;

  if (
    !item ||
    typeof item !== "object" ||
    Array.isArray(item)
  ) {
    errors.push(
      `${prefix} must be an object`
    );

    return;
  }

  /* -----------------------------------------
     Component Type
  ----------------------------------------- */

  if (
    !item.componentType ||
    typeof item.componentType !==
      "string"
  ) {
    errors.push(
      `${prefix} componentType is required`
    );
  } else if (
    !COMPONENT_TYPES.includes(
      item.componentType
    )
  ) {
    errors.push(
      `${prefix} componentType is invalid`
    );
  }

  /* -----------------------------------------
     Name
  ----------------------------------------- */

  if (
    !item.name ||
    typeof item.name !==
      "string" ||
    !item.name.trim()
  ) {
    errors.push(
      `${prefix} name is required`
    );
  }

  /* -----------------------------------------
     Quantity
  ----------------------------------------- */

  if (
    item.quantity ===
      undefined ||
    item.quantity === null
  ) {
    errors.push(
      `${prefix} quantity is required`
    );
  } else if (
    !isNonNegativeNumber(
      item.quantity
    )
  ) {
    errors.push(
      `${prefix} quantity must be a non-negative number`
    );
  }

  /* -----------------------------------------
     Unit
  ----------------------------------------- */

  if (
    !isOptionalString(
      item.unit
    )
  ) {
    errors.push(
      `${prefix} unit must be a string`
    );
  }

  /* -----------------------------------------
     Brand
  ----------------------------------------- */

  if (
    !isOptionalString(
      item.brand
    )
  ) {
    errors.push(
      `${prefix} brand must be a string`
    );
  }

  /* -----------------------------------------
     Model
  ----------------------------------------- */

  if (
    !isOptionalString(
      item.model
    )
  ) {
    errors.push(
      `${prefix} model must be a string`
    );
  }

  /* -----------------------------------------
     Capacity
  ----------------------------------------- */

  if (
    item.capacity !==
      undefined &&
    item.capacity !== null &&
    item.capacity !== ""
  ) {
    if (
      !isNonNegativeNumber(
        item.capacity
      )
    ) {
      errors.push(
        `${prefix} capacity must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Capacity Unit
  ----------------------------------------- */

  if (
    !isOptionalString(
      item.capacityUnit
    )
  ) {
    errors.push(
      `${prefix} capacityUnit must be a string`
    );
  }

  /* -----------------------------------------
     Unit Price
  ----------------------------------------- */

  if (
    item.unitPrice !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.unitPrice
      )
    ) {
      errors.push(
        `${prefix} unitPrice must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Frontend Compatibility
     
     Validator also accepts `rate`
     because frontend may still send it.
  ----------------------------------------- */

  if (
    item.rate !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.rate
      )
    ) {
      errors.push(
        `${prefix} rate must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Discount
  ----------------------------------------- */

  if (
    item.discount !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.discount
      )
    ) {
      errors.push(
        `${prefix} discount must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Tax
  ----------------------------------------- */

  if (
    item.tax !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.tax
      )
    ) {
      errors.push(
        `${prefix} tax must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Total Price
     
     Accepted for edit/history,
     but backend remains authoritative.
  ----------------------------------------- */

  if (
    item.totalPrice !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.totalPrice
      )
    ) {
      errors.push(
        `${prefix} totalPrice must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Amount
     
     Backward compatibility with
     older frontend payloads.
  ----------------------------------------- */

  if (
    item.amount !==
      undefined
  ) {
    if (
      !isNonNegativeNumber(
        item.amount
      )
    ) {
      errors.push(
        `${prefix} amount must be a non-negative number`
      );
    }
  }

  /* -----------------------------------------
     Specifications
  ----------------------------------------- */

  if (
    item.specifications !==
      undefined &&
    (
      item.specifications ===
        null ||
      typeof item.specifications !==
        "object" ||
      Array.isArray(
        item.specifications
      )
    )
  ) {
    errors.push(
      `${prefix} specifications must be an object`
    );
  }

  /* -----------------------------------------
     Notes
  ----------------------------------------- */

  if (
    !isOptionalString(
      item.notes
    )
  ) {
    errors.push(
      `${prefix} notes must be a string`
    );
  }
};

/* =========================================================
   VALIDATE COMPONENT ARRAY
========================================================= */

const validateComponentArray = (
  components,
  errors
) => {
  if (
    components ===
      undefined
  ) {
    return;
  }

  if (
    !Array.isArray(
      components
    )
  ) {
    errors.push(
      "Components must be an array"
    );

    return;
  }

  components.forEach(
    (
      item,
      index
    ) => {
      validateComponent(
        item,
        index,
        errors
      );
    }
  );
};

/* =========================================================
   VALIDATE FRONTEND CATEGORY ARRAY
========================================================= */

const validateFrontendCategory = (
  items,
  category,
  errors
) => {
  if (
    items ===
      undefined
  ) {
    return;
  }

  if (
    !Array.isArray(
      items
    )
  ) {
    errors.push(
      `${category} must be an array`
    );

    return;
  }

  items.forEach(
    (
      item,
      index
    ) => {
      if (
        !item ||
        typeof item !==
          "object" ||
        Array.isArray(item)
      ) {
        errors.push(
          `${category}[${index}] must be an object`
        );

        return;
      }

      if (
        !item.name ||
        typeof item.name !==
          "string" ||
        !item.name.trim()
      ) {
        errors.push(
          `${category}[${index}] name is required`
        );
      }

      if (
        item.quantity !==
          undefined &&
        !isNonNegativeNumber(
          item.quantity
        )
      ) {
        errors.push(
          `${category}[${index}] quantity must be a non-negative number`
        );
      }

      if (
        item.rate !==
          undefined &&
        !isNonNegativeNumber(
          item.rate
        )
      ) {
        errors.push(
          `${category}[${index}] rate must be a non-negative number`
        );
      }

      if (
        item.unitPrice !==
          undefined &&
        !isNonNegativeNumber(
          item.unitPrice
        )
      ) {
        errors.push(
          `${category}[${index}] unitPrice must be a non-negative number`
        );
      }

      if (
        item.discount !==
          undefined &&
        !isNonNegativeNumber(
          item.discount
        )
      ) {
        errors.push(
          `${category}[${index}] discount must be a non-negative number`
        );
      }

      if (
        item.tax !==
          undefined &&
        !isNonNegativeNumber(
          item.tax
        )
      ) {
        errors.push(
          `${category}[${index}] tax must be a non-negative number`
        );
      }
    }
  );
};

/* =========================================================
   COMMON REFERENCE VALIDATION
========================================================= */

const validateReferences = (
  body,
  errors,
  {
    requireLead = false,
    requireSolarRequirement = false,
  } = {}
) => {
  const {
    lead,
    solarRequirement,
    customer,
  } = body;

  /* -----------------------------------------
     Lead
  ----------------------------------------- */

  if (
    requireLead &&
    (
      !lead ||
      typeof lead !==
        "string"
    )
  ) {
    errors.push(
      "Lead reference is required"
    );
  } else if (
    lead !==
      undefined &&
    lead !==
      null &&
    lead !== ""
  ) {
    if (
      typeof lead !==
        "string" ||
      !isValidObjectId(
        lead
      )
    ) {
      errors.push(
        "Lead reference must be a valid ID"
      );
    }
  }

  /* -----------------------------------------
     Solar Requirement
  ----------------------------------------- */

  if (
    requireSolarRequirement &&
    (
      !solarRequirement ||
      typeof solarRequirement !==
        "string"
    )
  ) {
    errors.push(
      "Solar requirement reference is required"
    );
  } else if (
    solarRequirement !==
      undefined &&
    solarRequirement !==
      null &&
    solarRequirement !==
      ""
  ) {
    if (
      typeof solarRequirement !==
        "string" ||
      !isValidObjectId(
        solarRequirement
      )
    ) {
      errors.push(
        "Solar requirement reference must be a valid ID"
      );
    }
  }

  /* -----------------------------------------
     Customer
  ----------------------------------------- */

  if (
    customer !==
      undefined &&
    customer !==
      null &&
    customer !== ""
  ) {
    if (
      typeof customer !==
        "string" ||
      !isValidObjectId(
        customer
      )
    ) {
      errors.push(
        "Customer reference must be a valid ID"
      );
    }
  }
};

/* =========================================================
   CREATE VALIDATOR
========================================================= */

const validateSystemConfiguration = (
  req,
  res,
  next
) => {
  const body =
    req.body || {};

  const errors = [];

  /* -----------------------------------------
     References
  ----------------------------------------- */

  validateReferences(
    body,
    errors,
    {
      requireLead: true,
      requireSolarRequirement: true,
    }
  );

  /* -----------------------------------------
     System Capacity
  ----------------------------------------- */

  if (
    body.systemCapacity ===
      undefined ||
    body.systemCapacity ===
      null ||
    body.systemCapacity ===
      ""
  ) {
    errors.push(
      "System capacity is required"
    );
  } else if (
    !isPositiveNumber(
      body.systemCapacity
    )
  ) {
    errors.push(
      "System capacity must be a positive number"
    );
  }

  /* -----------------------------------------
     Capacity Unit
  ----------------------------------------- */

  if (
    body.capacityUnit !==
      undefined &&
    ![
      "KW",
      "MW",
    ].includes(
      body.capacityUnit
    )
  ) {
    errors.push(
      "Capacity unit must be KW or MW"
    );
  }

  /* -----------------------------------------
     System Type
  ----------------------------------------- */

  if (
    !body.systemType ||
    typeof body.systemType !==
      "string"
  ) {
    errors.push(
      "System type is required"
    );
  } else if (
    ![
      "ON_GRID",
      "OFF_GRID",
      "HYBRID",
    ].includes(
      body.systemType
    )
  ) {
    errors.push(
      "System type must be ON_GRID, OFF_GRID or HYBRID"
    );
  }

  /* -----------------------------------------
     Phase
  ----------------------------------------- */

  if (
    body.phase !==
      undefined &&
    body.phase !==
      null &&
    body.phase !== ""
  ) {
    if (
      ![
        "SINGLE_PHASE",
        "THREE_PHASE",
      ].includes(
        body.phase
      )
    ) {
      errors.push(
        "Phase must be SINGLE_PHASE or THREE_PHASE"
      );
    }
  }

  /* -----------------------------------------
     Version
  ----------------------------------------- */

  if (
    body.version !==
      undefined
  ) {
    if (
      !Number.isInteger(
        body.version
      ) ||
      body.version < 1
    ) {
      errors.push(
        "Version must be a positive integer"
      );
    }
  }

  /* -----------------------------------------
     Canonical components[]
  ----------------------------------------- */

  validateComponentArray(
    body.components,
    errors
  );

  /* -----------------------------------------
     Frontend category arrays
  ----------------------------------------- */

  validateFrontendCategory(
    body.panels,
    "Panels",
    errors
  );

  validateFrontendCategory(
    body.inverter,
    "Inverter",
    errors
  );

  validateFrontendCategory(
    body.battery,
    "Battery",
    errors
  );

  validateFrontendCategory(
    body.structure,
    "Structure",
    errors
  );

  validateFrontendCategory(
    body.accessories,
    "Accessories",
    errors
  );

  validateFrontendCategory(
    body.installation,
    "Installation",
    errors
  );

  validateFrontendCategory(
    body.otherItems,
    "Other items",
    errors
  );

  /* -----------------------------------------
     Pricing fields
     
     These are accepted for compatibility.
     Backend calculation remains authoritative.
  ----------------------------------------- */

  const monetaryFields = [
    [
      "installationCost",
      "Installation cost",
    ],
    [
      "transportationCost",
      "Transportation cost",
    ],
    [
      "otherCost",
      "Other cost",
    ],
    [
      "discount",
      "Discount",
    ],
    [
      "taxPercentage",
      "Tax percentage",
    ],
    [
      "subtotal",
      "Subtotal",
    ],
    [
      "taxAmount",
      "Tax amount",
    ],
    [
      "totalAmount",
      "Total amount",
    ],
    [
      "totalDiscount",
      "Total discount",
    ],
    [
      "totalTax",
      "Total tax",
    ],
    [
      "grandTotal",
      "Grand total",
    ],
  ];

  monetaryFields.forEach(
    ([
      field,
      label,
    ]) => {
      if (
        body[field] !==
          undefined
      ) {
        if (
          !isNonNegativeNumber(
            body[field]
          )
        ) {
          errors.push(
            `${label} must be a non-negative number`
          );
        }
      }
    }
  );

  /* -----------------------------------------
     Tax percentage
  ----------------------------------------- */

  if (
    body.taxPercentage !==
      undefined &&
    body.taxPercentage >
      100
  ) {
    errors.push(
      "Tax percentage cannot exceed 100"
    );
  }

  /* -----------------------------------------
     Status
  ----------------------------------------- */

  if (
    body.status !==
      undefined
  ) {
    const validStatuses = [
      "DRAFT",
      "CONFIGURED",
      "APPROVED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
      "INACTIVE",
    ];

    if (
      !validStatuses.includes(
        body.status
      )
    ) {
      errors.push(
        "Invalid system configuration status"
      );
    }
  }

  /* -----------------------------------------
     Notes
  ----------------------------------------- */

  if (
    body.notes !==
      undefined &&
    body.notes !==
      null &&
    body.notes !== "" &&
    typeof body.notes !==
      "string"
  ) {
    errors.push(
      "Notes must be a string"
    );
  }

  /* -----------------------------------------
     Final response
  ----------------------------------------- */

  if (
    errors.length > 0
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "System configuration validation failed",
        errors,
      });
  }

  next();
};

/* =========================================================
   UPDATE VALIDATOR
========================================================= */

const validateSystemConfigurationUpdate = (
  req,
  res,
  next
) => {
  const body =
    req.body || {};

  const errors = [];

  /* -----------------------------------------
     References
  ----------------------------------------- */

  validateReferences(
    body,
    errors
  );

  /* -----------------------------------------
     System Capacity
  ----------------------------------------- */

  if (
    body.systemCapacity !==
      undefined
  ) {
    if (
      !isPositiveNumber(
        body.systemCapacity
      )
    ) {
      errors.push(
        "System capacity must be a positive number"
      );
    }
  }

  /* -----------------------------------------
     Capacity Unit
  ----------------------------------------- */

  if (
    body.capacityUnit !==
      undefined &&
    ![
      "KW",
      "MW",
    ].includes(
      body.capacityUnit
    )
  ) {
    errors.push(
      "Capacity unit must be KW or MW"
    );
  }

  /* -----------------------------------------
     System Type
  ----------------------------------------- */

  if (
    body.systemType !==
      undefined &&
    ![
      "ON_GRID",
      "OFF_GRID",
      "HYBRID",
    ].includes(
      body.systemType
    )
  ) {
    errors.push(
      "System type must be ON_GRID, OFF_GRID or HYBRID"
    );
  }

  /* -----------------------------------------
     Phase
  ----------------------------------------- */

  if (
    body.phase !==
      undefined &&
    body.phase !==
      null &&
    body.phase !== ""
  ) {
    if (
      ![
        "SINGLE_PHASE",
        "THREE_PHASE",
      ].includes(
        body.phase
      )
    ) {
      errors.push(
        "Phase must be SINGLE_PHASE or THREE_PHASE"
      );
    }
  }

  /* -----------------------------------------
     Version
  ----------------------------------------- */

  if (
    body.version !==
      undefined
  ) {
    if (
      !Number.isInteger(
        body.version
      ) ||
      body.version < 1
    ) {
      errors.push(
        "Version must be a positive integer"
      );
    }
  }

  /* -----------------------------------------
     Canonical components
  ----------------------------------------- */

  validateComponentArray(
    body.components,
    errors
  );

  /* -----------------------------------------
     Frontend category arrays
  ----------------------------------------- */

  validateFrontendCategory(
    body.panels,
    "Panels",
    errors
  );

  validateFrontendCategory(
    body.inverter,
    "Inverter",
    errors
  );

  validateFrontendCategory(
    body.battery,
    "Battery",
    errors
  );

  validateFrontendCategory(
    body.structure,
    "Structure",
    errors
  );

  validateFrontendCategory(
    body.accessories,
    "Accessories",
    errors
  );

  validateFrontendCategory(
    body.installation,
    "Installation",
    errors
  );

  validateFrontendCategory(
    body.otherItems,
    "Other items",
    errors
  );

  /* -----------------------------------------
     Pricing fields
  ----------------------------------------- */

  const monetaryFields = [
    [
      "installationCost",
      "Installation cost",
    ],
    [
      "transportationCost",
      "Transportation cost",
    ],
    [
      "otherCost",
      "Other cost",
    ],
    [
      "discount",
      "Discount",
    ],
    [
      "taxPercentage",
      "Tax percentage",
    ],
  ];

  monetaryFields.forEach(
    ([
      field,
      label,
    ]) => {
      if (
        body[field] !==
          undefined &&
        !isNonNegativeNumber(
          body[field]
        )
      ) {
        errors.push(
          `${label} must be a non-negative number`
        );
      }
    }
  );

  if (
    body.taxPercentage !==
      undefined &&
    body.taxPercentage >
      100
  ) {
    errors.push(
      "Tax percentage cannot exceed 100"
    );
  }

  /* -----------------------------------------
     Status
  ----------------------------------------- */

  if (
    body.status !==
      undefined
  ) {
    const validStatuses = [
      "DRAFT",
      "CONFIGURED",
      "APPROVED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
      "INACTIVE",
    ];

    if (
      !validStatuses.includes(
        body.status
      )
    ) {
      errors.push(
        "Invalid system configuration status"
      );
    }
  }

  /* -----------------------------------------
     Notes
  ----------------------------------------- */

  if (
    body.notes !==
      undefined &&
    body.notes !==
      null &&
    body.notes !== "" &&
    typeof body.notes !==
      "string"
  ) {
    errors.push(
      "Notes must be a string"
    );
  }

  /* -----------------------------------------
     Final response
  ----------------------------------------- */

  if (
    errors.length > 0
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "System configuration update validation failed",
        errors,
      });
  }

  next();
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  validateSystemConfiguration,
  validateSystemConfigurationUpdate,
};