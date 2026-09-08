const mongoose = require("mongoose");

const proposalContentSchema = new mongoose.Schema(
  {
    companyProfile: {
      type: String,
      trim: true,
      default: "",
    },

    vision: {
      type: String,
      trim: true,
      default: "",
    },

    mission: {
      type: String,
      trim: true,
      default: "",
    },

    warrantyTerms: {
      type: String,
      trim: true,
      default: "",
    },

    subsidyTerms: {
      type: String,
      trim: true,
      default: "",
    },

    installationTerms: {
      type: String,
      trim: true,
      default: "",
    },

    paymentTerms: {
      type: String,
      trim: true,
      default: "",
    },

    quotationValidity: {
      type: String,
      trim: true,
      default: "",
    },

    warrantyExclusions: {
      type: String,
      trim: true,
      default: "",
    },

    scopeOfWork: {
      type: String,
      trim: true,
      default: "",
    },

    testimonials: [
      {
        name: {
          type: String,
          trim: true,
          default: "",
        },

        message: {
          type: String,
          trim: true,
          default: "",
        },

        designation: {
          type: String,
          trim: true,
          default: "",
        },

        image: {
          type: String,
          trim: true,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },

        sortOrder: {
          type: Number,
          default: 0,
        },
      },
    ],

    footerContent: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

proposalContentSchema.index({
  isActive: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "ProposalContent",
  proposalContentSchema
);