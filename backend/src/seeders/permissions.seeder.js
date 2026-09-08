const Permission = require("../models/Permission");

const permissions = [
  // Dashboard
  ["dashboard", "view"],

  // Leads
  ["lead", "create"],
  ["lead", "view"],
  ["lead", "edit"],
  ["lead", "assign"],
  ["lead", "transfer"],
  ["lead", "close"],

  // Solar Requirements
  ["solar_requirement", "create"],
  ["solar_requirement", "view"],
  ["solar_requirement", "edit"],

  // System Configuration
  ["system_configuration", "create"],
  ["system_configuration", "view"],
  ["system_configuration", "edit"],

  // Quotations
  ["quotation", "create"],
  ["quotation", "view"],
  ["quotation", "edit"],
  ["quotation", "send"],
  ["quotation", "approve"],
  ["quotation", "reject"],

  // Customers
  ["customer", "create"],
  ["customer", "view"],
  ["customer", "edit"],

  // Invoices
  ["invoice", "create"],
  ["invoice", "view"],
  ["invoice", "edit"],
  ["invoice", "cancel"],

  // Payments
  ["payment", "create"],
  ["payment", "view"],
  ["payment", "edit"],

  // Tasks
  ["task", "create"],
  ["task", "view"],
  ["task", "edit"],
  ["task", "assign"],
  ["task", "reassign"],
  ["task", "complete"],

  // Employees
  ["employee", "create"],
  ["employee", "view"],
  ["employee", "edit"],
  ["employee", "deactivate"],

  // Attendance
  ["attendance", "create"],
  ["attendance", "view"],
  ["attendance", "edit"],

  // Leave
  ["leave", "create"],
  ["leave", "view"],
  ["leave", "approve"],
  ["leave", "reject"],
  ["leave", "cancel"],

  // Reports
  ["report", "view"],
  ["report", "export"],

  // Settings
  ["setting", "view"],
  ["setting", "edit"],

  // Audit Logs
  ["audit_log", "view"],

  // Notifications
  ["notification", "view"],
  ["notification", "manage"],
];

const seedPermissions = async () => {
  for (const [module, action] of permissions) {
    const name = `${module}.${action}`;

    await Permission.findOneAndUpdate(
      { name },
      {
        name,
        module,
        action,
        description: `${action} permission for ${module}`,
        isActive: true,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  console.log("Permissions seeded successfully");
};

module.exports = seedPermissions;