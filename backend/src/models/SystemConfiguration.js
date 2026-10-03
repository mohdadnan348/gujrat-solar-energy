const mongoose = require("mongoose");

/**
 * System Configuration Component
 *
 * Frontend ke different sections ko backend me
 * ek common `components` structure me store kiya jayega.
 */
const systemComponentSchema = new mongoose.Schema(
  {
    componentType: {
      type: String,
      required: true,
      enum: [
        "SOLAR_PANEL",
        "INVERTER",
        "BATTERY",
        "STRUCTURE",
        "ACCESSORY",
        "INSTALLATION",
        "OTHER",
      ],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    model: {
      type: String,
      trim: true,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    unit: {
      type: String,
      default: "PCS",
      trim: true,
    },

    capacity: {
      type: Number,
      min: 0,
    },

    capacityUnit: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Backend authoritative pricing fields
     */
    unitPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * Optional frontend/business information.
     */
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      min: 0,
      default: 0,
    },

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const systemConfigurationSchema = new mongoose.Schema(
  {
    /**
     * Human-readable configuration number.
     */
    configurationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    /**
     * Configuration version.
     */
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    /**
     * Main references.
     */
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    solarRequirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SolarRequirement",
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },

    /**
     * Solar system information.
     */
    systemCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    capacityUnit: {
      type: String,
      enum: ["KW", "MW"],
      default: "KW",
    },

    systemType: {
      type: String,
      enum: ["ON_GRID", "OFF_GRID", "HYBRID"],
      required: true,
    },

    phase: {
      type: String,
      enum: ["SINGLE_PHASE", "THREE_PHASE"],
    },

    /**
     * Component counts.
     * These are automatically calculated from components.
     */
    panelCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    inverterCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    batteryCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * All configuration components.
     */
    components: {
      type: [systemComponentSchema],
      default: [],
    },

    /**
     * Pricing.
     *
     * subtotal = components + installation +
     * transportation + other cost
     *
     * taxable amount = subtotal - discount
     *
     * total = taxable amount + tax
     */
    subtotal: {
      type: Number,
      min: 0,
      default: 0,
    },

    installationCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    transportationCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    otherCost: {
      type: Number,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      min: 0,
      default: 0,
    },

    taxPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * Configuration status.
     */
    status: {
      type: String,
      enum: [
        "DRAFT",
        "CONFIGURED",
        "APPROVED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
        "INACTIVE",
      ],
      default: "DRAFT",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Audit fields.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Useful indexes.
 */
systemConfigurationSchema.index({
  lead: 1,
  createdAt: -1,
});

systemConfigurationSchema.index({
  customer: 1,
  createdAt: -1,
});

systemConfigurationSchema.index({
  lead: 1,
  version: -1,
});

systemConfigurationSchema.index({
  solarRequirement: 1,
  version: -1,
});

/**
 * Automatically calculate component counts
 * and pricing before save.
 */
systemConfigurationSchema.pre("save", function (next) {
  const components = Array.isArray(this.components)
    ? this.components
    : [];

  /**
   * Calculate component total prices.
   */
  components.forEach((component) => {
    const quantity = Number(component.quantity) || 0;
    const unitPrice = Number(component.unitPrice) || 0;

    component.quantity = quantity;
    component.unitPrice = unitPrice;
    component.totalPrice = Number(
      (quantity * unitPrice).toFixed(2)
    );
  });

  /**
   * Component counts.
   */
  this.panelCount = components
    .filter(
      (component) =>
        component.componentType === "SOLAR_PANEL"
    )
    .reduce(
      (total, component) =>
        total + (Number(component.quantity) || 0),
      0
    );

  this.inverterCount = components
    .filter(
      (component) =>
        component.componentType === "INVERTER"
    )
    .reduce(
      (total, component) =>
        total + (Number(component.quantity) || 0),
      0
    );

  this.batteryCount = components
    .filter(
      (component) =>
        component.componentType === "BATTERY"
    )
    .reduce(
      (total, component) =>
        total + (Number(component.quantity) || 0),
      0
    );

  /**
   * Component subtotal.
   */
  const componentSubtotal = components.reduce(
    (total, component) =>
      total + (Number(component.totalPrice) || 0),
    0
  );

  /**
   * Additional costs.
   */
  const installationCost =
    Number(this.installationCost) || 0;

  const transportationCost =
    Number(this.transportationCost) || 0;

  const otherCost =
    Number(this.otherCost) || 0;

  /**
   * Discount.
   */
  const discount =
    Number(this.discount) || 0;

  /**
   * Base subtotal.
   */
  const baseAmount =
    componentSubtotal +
    installationCost +
    transportationCost +
    otherCost;

  this.subtotal = Number(
    Math.max(baseAmount, 0).toFixed(2)
  );

  /**
   * Taxable amount.
   */
  const taxableAmount = Math.max(
    baseAmount - discount,
    0
  );

  /**
   * GST / tax.
   */
  const taxPercentage =
    Number(this.taxPercentage) || 0;

  this.taxAmount = Number(
    (
      taxableAmount *
      (taxPercentage / 100)
    ).toFixed(2)
  );

  /**
   * Final amount.
   */
  this.totalAmount = Number(
    Math.max(
      taxableAmount + this.taxAmount,
      0
    ).toFixed(2)
  );

  next();
});

module.exports = mongoose.model(
  "SystemConfiguration",
  systemConfigurationSchema
);