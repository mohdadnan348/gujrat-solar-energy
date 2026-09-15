const Permission = require("../models/Permission");

const permissions = [
  // Dashboard
  {
    key: "dashboard.view",
    name: "View Dashboard",
    module: "Dashboard",
  },

  // Leads
  {
    key: "lead.view",
    name: "View Leads",
    module: "Lead Management",
  },
  {
    key: "lead.create",
    name: "Create Lead",
    module: "Lead Management",
  },
  {
    key: "lead.update",
    name: "Update Lead",
    module: "Lead Management",
  },
  {
    key: "lead.assign",
    name: "Assign Lead",
    module: "Lead Management",
  },
  {
    key: "lead.delete",
    name: "Deactivate Lead",
    module: "Lead Management",
  },

  // Lead Activities
  {
    key: "leadActivity.view",
    name: "View Lead Activities",
    module: "Lead Activity",
  },
  {
    key: "leadActivity.create",
    name: "Create Lead Activity",
    module: "Lead Activity",
  },

  // Solar Requirements
  {
    key: "solarRequirement.view",
    name: "View Solar Requirements",
    module: "Solar Requirement",
  },
  {
    key: "solarRequirement.create",
    name: "Create Solar Requirement",
    module: "Solar Requirement",
  },
  {
    key: "solarRequirement.update",
    name: "Update Solar Requirement",
    module: "Solar Requirement",
  },

  // System Configuration
  {
    key: "systemConfiguration.view",
    name: "View System Configurations",
    module: "System Configuration",
  },
  {
    key: "systemConfiguration.create",
    name: "Create System Configuration",
    module: "System Configuration",
  },
  {
    key: "systemConfiguration.update",
    name: "Update System Configuration",
    module: "System Configuration",
  },

  // Quotations
  {
    key: "quotation.view",
    name: "View Quotations",
    module: "Quotation",
  },
  {
    key: "quotation.create",
    name: "Create Quotation",
    module: "Quotation",
  },
  {
    key: "quotation.update",
    name: "Update Quotation",
    module: "Quotation",
  },
  {
    key: "quotation.send",
    name: "Send Quotation",
    module: "Quotation",
  },
  {
    key: "quotation.approve",
    name: "Approve Quotation",
    module: "Quotation",
  },

  // Customers
  {
    key: "customer.view",
    name: "View Customers",
    module: "Customer Management",
  },
  {
    key: "customer.create",
    name: "Create Customer",
    module: "Customer Management",
  },
  {
    key: "customer.update",
    name: "Update Customer",
    module: "Customer Management",
  },
  {
    key: "customer.delete",
    name: "Deactivate Customer",
    module: "Customer Management",
  },

  // Invoices
  {
    key: "invoice.view",
    name: "View Invoices",
    module: "Invoice",
  },
  {
    key: "invoice.create",
    name: "Create Invoice",
    module: "Invoice",
  },
  {
    key: "invoice.update",
    name: "Update Invoice",
    module: "Invoice",
  },
  {
    key: "invoice.issue",
    name: "Issue Invoice",
    module: "Invoice",
  },
  {
    key: "invoice.cancel",
    name: "Cancel Invoice",
    module: "Invoice",
  },

  // Tasks
  {
    key: "task.view",
    name: "View Tasks",
    module: "Task Management",
  },
  {
    key: "task.create",
    name: "Create Task",
    module: "Task Management",
  },
  {
    key: "task.update",
    name: "Update Task",
    module: "Task Management",
  },
  {
    key: "task.assign",
    name: "Assign Task",
    module: "Task Management",
  },

  // Employees
  {
    key: "employee.view",
    name: "View Employees",
    module: "Employee Management",
  },
  {
    key: "employee.create",
    name: "Create Employee",
    module: "Employee Management",
  },
  {
    key: "employee.update",
    name: "Update Employee",
    module: "Employee Management",
  },
  {
    key: "employee.delete",
    name: "Deactivate Employee",
    module: "Employee Management",
  },

  // Attendance
  {
    key: "attendance.view",
    name: "View Attendance",
    module: "Attendance",
  },
  {
    key: "attendance.create",
    name: "Create Attendance",
    module: "Attendance",
  },
  {
    key: "attendance.update",
    name: "Update Attendance",
    module: "Attendance",
  },

  // Leave
  {
    key: "leave.view",
    name: "View Leave Requests",
    module: "Leave Management",
  },
  {
    key: "leave.create",
    name: "Create Leave Request",
    module: "Leave Management",
  },
  {
    key: "leave.update",
    name: "Update Leave Request",
    module: "Leave Management",
  },
  {
    key: "leave.approve",
    name: "Approve Leave Request",
    module: "Leave Management",
  },
  {
    key: "leave.reject",
    name: "Reject Leave Request",
    module: "Leave Management",
  },

  // Reports
  {
    key: "report.view",
    name: "View Reports",
    module: "Reporting",
  },

  // Settings
  {
    key: "settings.view",
    name: "View Settings",
    module: "Settings",
  },
  {
    key: "settings.update",
    name: "Update Settings",
    module: "Settings",
  },

  // Activity Logs
  {
    key: "activityLog.view",
    name: "View Activity Logs",
    module: "Activity Log",
  },

  // Notifications
  {
    key: "notification.view",
    name: "View Notifications",
    module: "Notifications",
  },
];

const seedPermissions = async () => {
  for (const permission of permissions) {
    await Permission.findOneAndUpdate(
      { key: permission.key },
      permission,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  return permissions.length;
};

module.exports = {
  permissions,
  seedPermissions,
};