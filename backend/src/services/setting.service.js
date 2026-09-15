const Setting = require("../models/Setting");

const getSettings = async () => {
  const settings = await Setting.find({ isActive: true })
    .sort({ key: 1 })
    .lean();

  return settings;
};

const getDocumentSettings = async () => {
  const settings = await Setting.find({
    isActive: true,
    key: {
      $in: [
        "company",
        "quotation",
        "invoice",
        "tax",
        "bank",
        "signature",
      ],
    },
  })
    .sort({ key: 1 })
    .lean();

  return settings;
};

const getSettingByKey = async (key) => {
  if (!key) {
    throw new Error("Setting key is required.");
  }

  return Setting.findOne({
    key,
    isActive: true,
  }).lean();
};

const upsertSetting = async (key, value, userId = null) => {
  if (!key) {
    throw new Error("Setting key is required.");
  }

  const setting = await Setting.findOneAndUpdate(
    { key },
    {
      key,
      value,
      ...(userId ? { updatedBy: userId } : {}),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return setting;
};

const updateSettings = async (settings, userId = null) => {
  if (!settings || typeof settings !== "object") {
    throw new Error("Settings data is required.");
  }

  const entries = Object.entries(settings);

  if (!entries.length) {
    throw new Error("At least one setting is required.");
  }

  const updatedSettings = [];

  for (const [key, value] of entries) {
    const setting = await upsertSetting(
      key,
      value,
      userId
    );

    updatedSettings.push(setting);
  }

  return updatedSettings;
};

const updateCompany = async (data, userId = null) => {
  return upsertSetting("company", data, userId);
};

const updateBankDetails = async (data, userId = null) => {
  return upsertSetting("bank", data, userId);
};

const updateSignature = async (data, userId = null) => {
  return upsertSetting("signature", data, userId);
};

const updateProposalSettings = async (
  data,
  userId = null
) => {
  return upsertSetting("proposal", data, userId);
};

const updateQuotationSettings = async (
  data,
  userId = null
) => {
  return upsertSetting("quotation", data, userId);
};

const updateInvoiceSettings = async (
  data,
  userId = null
) => {
  return upsertSetting("invoice", data, userId);
};

const updateTaxSettings = async (
  data,
  userId = null
) => {
  return upsertSetting("tax", data, userId);
};

module.exports = {
  getSettings,
  getDocumentSettings,
  getSettingByKey,
  updateSettings,
  updateCompany,
  updateBankDetails,
  updateSignature,
  updateProposalSettings,
  updateQuotationSettings,
  updateInvoiceSettings,
  updateTaxSettings,
};