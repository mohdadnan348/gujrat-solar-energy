const Setting = require("../models/Setting");

const getSettings = async () => {
  let settings = await Setting.findOne({
    isActive: true,
  }).lean();

  if (!settings) {
    settings = await Setting.findOne().lean();
  }

  return settings;
};

const getSettingsById = async (
  settingId
) => {
  const settings =
    await Setting.findById(
      settingId
    ).lean();

  if (!settings) {
    const error = new Error(
      "Settings not found"
    );
    error.statusCode = 404;
    throw error;
  }

  return settings;
};

const createSettings = async (
  data,
  userId
) => {
  const existing =
    await Setting.findOne();

  if (existing) {
    const error = new Error(
      "Settings already exist. Use update settings instead."
    );
    error.statusCode = 409;
    throw error;
  }

  const settings =
    await Setting.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

  return settings;
};

const updateSettings = async (
  data,
  userId
) => {
  let settings =
    await Setting.findOne({
      isActive: true,
    });

  if (!settings) {
    settings =
      await Setting.findOne();
  }

  if (!settings) {
    settings =
      await Setting.create({
        ...data,
        createdBy: userId,
        updatedBy: userId,
      });

    return settings;
  }

  const allowedFields = [
    "company",
    "companyProfile",
    "bankDetails",
    "signature",
    "leadSources",
    "leadStatuses",
    "taskStatuses",
    "taskPriorities",
    "productMaster",
    "taxSettings",
    "quotationSettings",
    "proposalSettings",
    "invoiceSettings",
    "leaveTypes",
  ];

  for (const field of allowedFields) {
    if (
      data[field] !== undefined
    ) {
      settings[field] =
        data[field];
    }
  }

  settings.updatedBy = userId;

  await settings.save();

  return settings;
};

const updateCompanySettings =
  async (
    companyData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      settings =
        await Setting.create({
          company: companyData,
          createdBy: userId,
          updatedBy: userId,
        });

      return settings;
    }

    settings.company = {
      ...(settings.company || {}),
      ...companyData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateBankDetails =
  async (
    bankData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.bankDetails = {
      ...(settings.bankDetails || {}),
      ...bankData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateSignatureSettings =
  async (
    signatureData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.signature = {
      ...(settings.signature || {}),
      ...signatureData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateQuotationSettings =
  async (
    quotationData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.quotationSettings = {
      ...(settings.quotationSettings ||
        {}),
      ...quotationData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateProposalSettings =
  async (
    proposalData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.proposalSettings = {
      ...(settings.proposalSettings ||
        {}),
      ...proposalData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateInvoiceSettings =
  async (
    invoiceData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.invoiceSettings = {
      ...(settings.invoiceSettings ||
        {}),
      ...invoiceData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateTaxSettings =
  async (
    taxData,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.taxSettings = {
      ...(settings.taxSettings || {}),
      ...taxData,
    };

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateLeadMasters =
  async (
    data,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    if (
      data.leadSources !==
      undefined
    ) {
      settings.leadSources =
        data.leadSources;
    }

    if (
      data.leadStatuses !==
      undefined
    ) {
      settings.leadStatuses =
        data.leadStatuses;
    }

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateTaskMasters =
  async (
    data,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    if (
      data.taskStatuses !==
      undefined
    ) {
      settings.taskStatuses =
        data.taskStatuses;
    }

    if (
      data.taskPriorities !==
      undefined
    ) {
      settings.taskPriorities =
        data.taskPriorities;
    }

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateProductMaster =
  async (
    productMaster,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.productMaster =
      productMaster;

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const updateLeaveTypes =
  async (
    leaveTypes,
    userId
  ) => {
    let settings =
      await Setting.findOne({
        isActive: true,
      });

    if (!settings) {
      settings =
        await Setting.findOne();
    }

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.leaveTypes =
      leaveTypes;

    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const activateSettings = async (
  settingId,
  userId
) => {
  const settings =
    await Setting.findById(
      settingId
    );

  if (!settings) {
    const error = new Error(
      "Settings not found"
    );
    error.statusCode = 404;
    throw error;
  }

  await Setting.updateMany(
    {
      _id: {
        $ne: settingId,
      },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        updatedBy: userId,
      },
    }
  );

  settings.isActive = true;
  settings.updatedBy = userId;

  await settings.save();

  return settings;
};

const deactivateSettings =
  async (
    settingId,
    userId
  ) => {
    const settings =
      await Setting.findById(
        settingId
      );

    if (!settings) {
      const error = new Error(
        "Settings not found"
      );
      error.statusCode = 404;
      throw error;
    }

    settings.isActive = false;
    settings.updatedBy = userId;

    await settings.save();

    return settings;
  };

const getCompanySettings =
  async () => {
    const settings =
      await getSettings();

    return settings?.company || {};
  };

const getBankDetails = async () => {
  const settings =
    await getSettings();

  return settings?.bankDetails || {};
};

const getSignatureSettings =
  async () => {
    const settings =
      await getSettings();

    return settings?.signature || {};
  };

const getQuotationSettings =
  async () => {
    const settings =
      await getSettings();

    return (
      settings?.quotationSettings || {}
    );
  };

const getProposalSettings =
  async () => {
    const settings =
      await getSettings();

    return (
      settings?.proposalSettings || {}
    );
  };

const getInvoiceSettings =
  async () => {
    const settings =
      await getSettings();

    return (
      settings?.invoiceSettings || {}
    );
  };

const getTaxSettings = async () => {
  const settings =
    await getSettings();

  return (
    settings?.taxSettings || {}
  );
};

module.exports = {
  getSettings,
  getSettingsById,
  createSettings,
  updateSettings,

  updateCompanySettings,
  updateBankDetails,
  updateSignatureSettings,

  updateQuotationSettings,
  updateProposalSettings,
  updateInvoiceSettings,
  updateTaxSettings,

  updateLeadMasters,
  updateTaskMasters,
  updateProductMaster,
  updateLeaveTypes,

  activateSettings,
  deactivateSettings,

  getCompanySettings,
  getBankDetails,
  getSignatureSettings,
  getQuotationSettings,
  getProposalSettings,
  getInvoiceSettings,
  getTaxSettings,
};