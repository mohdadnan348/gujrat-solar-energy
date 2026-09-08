const mongoose = require("mongoose");
const { SYSTEM_TYPE } = require("../config/constants");

const solarRequirementSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Lead reference is required"],
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    requiredKw: {
      type: Number,
      min: [0, "Required kW cannot be negative"],
      default: 0,
    },

    monthlyBill: {
      type: Number,
      min: [0, "Monthly bill cannot be negative"],
      default: 0,
    },

    monthlyUnits: {
      type: Number,
      min: [0, "Monthly units cannot be negative"],
      default: 0,
    },

    roofType: {
      type: String,
      trim: true,
      default: "",
    },

    roofArea: {
      type: Number,
      min: [0, "Roof area cannot be negative"],
      default: 0,
    },

    siteAddress: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    connectionType: {
      type: String,
      trim: true,
      default: "",
    },

    sanctionedLoad: {
      type: Number,
      min: [0, "Sanctioned load cannot be negative"],
      default: 0,
    },

    systemType: {
      type: String,
      enum: Object.values(SYSTEM_TYPE),
      required: [true, "System type is required"],
    },

    batteryRequired: {
      type: Boolean,
      default: false,
    },

    batteryCapacity: {
      type: Number,
      min: [0, "Battery capacity cannot be negative"],
      default: 0,
    },

    siteSurveyRequired: {
      type: Boolean,
      default: false,
    },

    siteSurveyCompleted: {
      type: Boolean,
      default: false,
    },

    photos: {
      type: [String],
      default: [],
    },

    documents: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Additional indexes
// lead and customer already have index: true above.
solarRequirementSchema.index({ systemType: 1 });
solarRequirementSchema.index({ createdAt: -1 });

const SolarRequirement = mongoose.model(
  "SolarRequirement",
  solarRequirementSchema
);

module.exports = SolarRequirement;