const mongoose = require("mongoose");

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
    },

    model: {
      type: String,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
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
    },

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

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const systemConfigurationSchema = new mongoose.Schema(
  {
    configurationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

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
      enum: [
        "ON_GRID",
        "OFF_GRID",
        "HYBRID",
      ],
      required: true,
    },

    phase: {
      type: String,
      enum: [
        "SINGLE_PHASE",
        "THREE_PHASE",
      ],
    },

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

    components: {
      type: [systemComponentSchema],
      default: [],
    },

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

    status: {
      type: String,
      enum: [
        "DRAFT",
        "CONFIGURED",
        "APPROVED",
        "REJECTED",
      ],
      default: "DRAFT",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
    },

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

systemConfigurationSchema.index({
  lead: 1,
  createdAt: -1,
});

systemConfigurationSchema.index({
  customer: 1,
  createdAt: -1,
});

systemConfigurationSchema.pre("save", function (next) {
  this.panelCount = this.components.filter(
    (component) => component.componentType === "SOLAR_PANEL"
  ).reduce((total, component) => total + component.quantity, 0);

  this.inverterCount = this.components.filter(
    (component) => component.componentType === "INVERTER"
  ).reduce((total, component) => total + component.quantity, 0);

  this.batteryCount = this.components.filter(
    (component) => component.componentType === "BATTERY"
  ).reduce((total, component) => total + component.quantity, 0);

  this.subtotal = this.components.reduce(
    (total, component) =>
      total + (Number(component.totalPrice) || 0),
    0
  );

  const additionalCosts =
    (Number(this.installationCost) || 0) +
    (Number(this.transportationCost) || 0) +
    (Number(this.otherCost) || 0);

  const discountAmount = Number(this.discount) || 0;

  const taxableAmount = Math.max(
    this.subtotal + additionalCosts - discountAmount,
    0
  );

  this.taxAmount =
    taxableAmount * ((Number(this.taxPercentage) || 0) / 100);

  this.totalAmount = taxableAmount + this.taxAmount;

  next();
});

module.exports = mongoose.model(
  "SystemConfiguration",
  systemConfigurationSchema
);