const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: [true, "Quotation number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    solarRequirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SolarRequirement",
      default: null,
      index: true,
    },

    systemConfiguration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemConfiguration",
      default: null,
      index: true,
    },

    revisionNumber: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Sent",
        "Accepted",
        "Rejected",
        "Expired",
      ],
      default: "Draft",
      index: true,
    },

    quotationDate: {
      type: Date,
      required: [true, "Quotation date is required"],
      default: Date.now,
    },

    validUntil: {
      type: Date,
      default: null,
    },

    /**
     * Solar plant information
     */
    plantDetails: {
      capacityKw: {
        type: Number,
        default: 0,
        min: 0,
      },

      systemType: {
        type: String,
        enum: [
          "On-grid",
          "Off-grid",
          "Hybrid",
          "",
        ],
        default: "",
      },

      description: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /**
     * Customer information snapshot.
     * This keeps the quotation unchanged even if
     * customer master data changes later.
     */
    customerDetails: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      companyName: {
        type: String,
        trim: true,
        default: "",
      },

      mobile: {
        type: String,
        trim: true,
        default: "",
      },

      alternateMobile: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },

      address: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      gstNumber: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
    },

    /**
     * Main quotation totals
     */
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgst: {
      type: Number,
      default: 0,
      min: 0,
    },

    igst: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    amountInWords: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Proposal content reference.
     * Stores reusable company profile,
     * warranty, subsidy, terms and testimonials.
     */
    proposalContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProposalContent",
      default: null,
      index: true,
    },

    /**
     * Proposal-specific information
     */
    proposalTitle: {
      type: String,
      trim: true,
      default: "Roof Top Solar Proposal",
    },

    companyIntroduction: {
      type: String,
      trim: true,
      default: "",
    },

    subsidyDetails: {
      type: String,
      trim: true,
      default: "",
    },

    installationSchedule: {
      type: String,
      trim: true,
      default: "",
    },

    warrantyDetails: {
      type: String,
      trim: true,
      default: "",
    },

    scopeOfWork: {
      type: String,
      trim: true,
      default: "",
    },

    paymentTerms: {
      type: String,
      trim: true,
      default: "",
    },

    quotationTerms: {
      type: String,
      trim: true,
      default: "",
    },

    warrantyExclusions: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Proposal assets
     */
    productPhotos: [
      {
        type: String,
        trim: true,
      },
    ],

    documents: [
      {
        type: String,
        trim: true,
      },
    ],

    pdfUrl: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Status timestamps
     */
    sentAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
      index: true,
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

quotationSchema.index({
  customer: 1,
  quotationDate: -1,
});

quotationSchema.index({
  status: 1,
  quotationDate: -1,
});

quotationSchema.index({
  lead: 1,
  revisionNumber: -1,
});

quotationSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "Quotation",
  quotationSchema
);