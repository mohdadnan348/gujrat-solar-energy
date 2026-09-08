const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Company Information
    |--------------------------------------------------------------------------
    */

    company: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      legalName: {
        type: String,
        trim: true,
        default: "",
      },

      logo: {
        type: String,
        trim: true,
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

      phone: {
        type: String,
        trim: true,
        default: "",
      },

      alternatePhone: {
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

      website: {
        type: String,
        trim: true,
        default: "",
      },

      gstin: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },

      pan: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Company Profile
    |--------------------------------------------------------------------------
    */

    companyProfile: {
      introduction: {
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

      aboutUs: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Bank Details
    |--------------------------------------------------------------------------
    */

    bankDetails: {
      bankName: {
        type: String,
        trim: true,
        default: "",
      },

      accountName: {
        type: String,
        trim: true,
        default: "",
      },

      accountNumber: {
        type: String,
        trim: true,
        default: "",
      },

      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },

      branchName: {
        type: String,
        trim: true,
        default: "",
      },

      upiId: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Authorized Signatory
    |--------------------------------------------------------------------------
    */

    signature: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      designation: {
        type: String,
        trim: true,
        default: "",
      },

      signatureImage: {
        type: String,
        trim: true,
        default: "",
      },

      stampImage: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Lead Settings
    |--------------------------------------------------------------------------
    */

    leadSources: [
      {
        type: String,
        trim: true,
      },
    ],

    leadStatuses: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Task Settings
    |--------------------------------------------------------------------------
    */

    taskStatuses: [
      {
        type: String,
        trim: true,
      },
    ],

    taskPriorities: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Product Master
    |--------------------------------------------------------------------------
    */

    productMaster: [
      {
        name: {
          type: String,
          trim: true,
        },

        category: {
          type: String,
          trim: true,
        },

        brand: {
          type: String,
          trim: true,
        },

        specification: {
          type: String,
          trim: true,
        },

        unit: {
          type: String,
          trim: true,
          default: "Nos",
        },

        defaultRate: {
          type: Number,
          min: 0,
          default: 0,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Tax Settings
    |--------------------------------------------------------------------------
    */

    taxSettings: {
      defaultTaxRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      cgstRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      sgstRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      igstRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Quotation Settings
    |--------------------------------------------------------------------------
    */

    quotationSettings: {
      prefix: {
        type: String,
        trim: true,
        uppercase: true,
        default: "EST",
      },

      startingNumber: {
        type: Number,
        min: 1,
        default: 1,
      },

      defaultValidityDays: {
        type: Number,
        min: 1,
        default: 7,
      },

      defaultTitle: {
        type: String,
        trim: true,
        default: "Roof Top Solar Proposal",
      },

      currency: {
        type: String,
        trim: true,
        default: "INR",
      },

      currencySymbol: {
        type: String,
        trim: true,
        default: "₹",
      },

      showCompanyProfile: {
        type: Boolean,
        default: true,
      },

      showProductPhotos: {
        type: Boolean,
        default: true,
      },

      showBOM: {
        type: Boolean,
        default: true,
      },

      showWarranty: {
        type: Boolean,
        default: true,
      },

      showSubsidy: {
        type: Boolean,
        default: true,
      },

      showPaymentTerms: {
        type: Boolean,
        default: true,
      },

      showTestimonials: {
        type: Boolean,
        default: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Proposal / PDF Settings
    |--------------------------------------------------------------------------
    */

    proposalSettings: {
      coverTitle: {
        type: String,
        trim: true,
        default: "Roof Top Solar Proposal",
      },

      coverSubtitle: {
        type: String,
        trim: true,
        default: "",
      },

      footerText: {
        type: String,
        trim: true,
        default: "",
      },

      thankYouText: {
        type: String,
        trim: true,
        default: "Thank You",
      },

      defaultPaymentTerms: {
        type: String,
        trim: true,
        default: "",
      },

      defaultWarrantyTerms: {
        type: String,
        trim: true,
        default: "",
      },

      defaultSubsidyTerms: {
        type: String,
        trim: true,
        default: "",
      },

      defaultInstallationTerms: {
        type: String,
        trim: true,
        default: "",
      },

      defaultScopeOfWork: {
        type: String,
        trim: true,
        default: "",
      },

      defaultWarrantyExclusions: {
        type: String,
        trim: true,
        default: "",
      },

      defaultQuotationTerms: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Invoice Settings
    |--------------------------------------------------------------------------
    */

    invoiceSettings: {
      prefix: {
        type: String,
        trim: true,
        uppercase: true,
        default: "INV",
      },

      startingNumber: {
        type: Number,
        min: 1,
        default: 1,
      },

      defaultDueDays: {
        type: Number,
        min: 0,
        default: 7,
      },

      currency: {
        type: String,
        trim: true,
        default: "INR",
      },

      currencySymbol: {
        type: String,
        trim: true,
        default: "₹",
      },

      defaultTerms: {
        type: String,
        trim: true,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Leave Settings
    |--------------------------------------------------------------------------
    */

    leaveTypes: [
      {
        name: {
          type: String,
          trim: true,
        },

        code: {
          type: String,
          trim: true,
          uppercase: true,
        },

        annualLimit: {
          type: Number,
          min: 0,
          default: 0,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Fields
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

/*
|--------------------------------------------------------------------------
| Index
|--------------------------------------------------------------------------
*/

settingSchema.index({ "company.name": 1 });

/*
|--------------------------------------------------------------------------
| Model
|--------------------------------------------------------------------------
*/

module.exports = mongoose.model("Setting", settingSchema);