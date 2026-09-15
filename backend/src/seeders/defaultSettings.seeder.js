const Setting = require("../models/Setting");

const defaultSettings = [
  {
    key: "company.name",
    value: "GUJRAT SOLAR ENERGY",
    category: "COMPANY",
    description: "Company name",
    isPublic: true,
  },
  {
    key: "company.gstin",
    value: "09GBQPS0127B1ZL",
    category: "COMPANY",
    description: "Company GSTIN",
    isPublic: true,
  },
  {
    key: "company.address",
    value:
      "83/161-3 PARAMPURWA, JUHI, Kanpur, Kanpur Nagar, UTTAR PRADESH, 208014",
    category: "COMPANY",
    description: "Company registered address",
    isPublic: true,
  },
  {
    key: "company.mobile",
    value: "+91 8545909039",
    category: "COMPANY",
    description: "Company contact number",
    isPublic: true,
  },
  {
    key: "company.email",
    value: "gujratsolar14@gmail.com",
    category: "COMPANY",
    description: "Company email address",
    isPublic: true,
  },
  {
    key: "company.website",
    value: "www.gujratsolarenergy.com",
    category: "COMPANY",
    description: "Company website",
    isPublic: true,
  },
  {
    key: "system.currency",
    value: "INR",
    category: "SYSTEM",
    description: "Default system currency",
    isPublic: true,
  },
  {
    key: "system.currencySymbol",
    value: "₹",
    category: "SYSTEM",
    description: "Default currency symbol",
    isPublic: true,
  },
  {
    key: "system.timezone",
    value: "Asia/Kolkata",
    category: "SYSTEM",
    description: "Default application timezone",
    isPublic: true,
  },
  {
    key: "quotation.validityDays",
    value: 30,
    category: "QUOTATION",
    description: "Default quotation validity period in days",
    isPublic: false,
  },
  {
    key: "quotation.taxPercentage",
    value: 0,
    category: "QUOTATION",
    description: "Default quotation tax percentage",
    isPublic: false,
  },
  {
    key: "invoice.taxPercentage",
    value: 0,
    category: "INVOICE",
    description: "Default invoice tax percentage",
    isPublic: false,
  },
];

const seedDefaultSettings = async () => {
  for (const setting of defaultSettings) {
    await Setting.findOneAndUpdate(
      { key: setting.key },
      { $setOnInsert: setting },
      {
        upsert: true,
        new: true,
      }
    );
  }

  return defaultSettings.length;
};

module.exports = {
  defaultSettings,
  seedDefaultSettings,
};