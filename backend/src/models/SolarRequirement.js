const mongoose = require("mongoose");
const { SYSTEM_TYPE } = require("../config/constants");

const SOLAR_REQUIREMENT_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  APPROVED: "APPROVED",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
};

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

    /* =========================
       STATUS
    ========================= */

    status: {
      type: String,
      enum: Object.values(
        SOLAR_REQUIREMENT_STATUS
      ),
      default:
        SOLAR_REQUIREMENT_STATUS.PENDING,
      index: true,
    },

    /* =========================
       ELECTRICITY REQUIREMENT
    ========================= */

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

    /* =========================
       SITE DETAILS
    ========================= */

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

    /* =========================
       SYSTEM
    ========================= */

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

    /* =========================
       SITE SURVEY
    ========================= */

    siteSurveyRequired: {
      type: Boolean,
      default: false,
    },

    siteSurveyCompleted: {
      type: Boolean,
      default: false,
    },

    /* =========================
       FILES
    ========================= */

    photos: {
      type: [String],
      default: [],
    },

    documents: {
      type: [String],
      default: [],
    },

    /* =========================
       NOTES
    ========================= */

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /* =========================
       AUDIT USERS
    ========================= */

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

/* =========================
   INDEXES
========================= */

solarRequirementSchema.index({
  lead: 1,
  status: 1,
});

solarRequirementSchema.index({
  customer: 1,
  status: 1,
});

solarRequirementSchema.index({
  systemType: 1,
});

solarRequirementSchema.index({
  createdAt: -1,
});

const SolarRequirement = mongoose.model(
  "SolarRequirement",
  solarRequirementSchema
);

module.exports = SolarRequirement;

module.exports.SOLAR_REQUIREMENT_STATUS =
  SOLAR_REQUIREMENT_STATUS;