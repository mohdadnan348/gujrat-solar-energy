const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const generateId = require("../utils/generateId");

const buildFilter = ({
  search = "",
  status,
  customerType,
  lead,
  city,
  state,
}) => {
  const filter = {};

  if (search.trim()) {
    filter.$or = [
      { customerId: { $regex: search.trim(), $options: "i" } },
      { name: { $regex: search.trim(), $options: "i" } },
      { companyName: { $regex: search.trim(), $options: "i" } },
      { mobile: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { gstNumber: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status) filter.status = status;
  if (customerType) filter.customerType = customerType;
  if (lead) filter.lead = lead;
  if (city) filter.city = { $regex: city, $options: "i" };
  if (state) filter.state = { $regex: state, $options: "i" };

  return filter;
};

const createCustomer = async (data, createdBy) => {
  if (data.lead) {
    const lead = await Lead.findById(data.lead);

    if (!lead) {
      const error = new Error("Lead not found");
      error.statusCode = 404;
      throw error;
    }

    if (lead.convertedCustomer) {
      const error = new Error(
        "This lead is already converted to a customer"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const existingMobile = await Customer.findOne({
    mobile: data.mobile,
  });

  if (existingMobile) {
    const error = new Error(
      "Customer with this mobile number already exists"
    );
    error.statusCode = 409;
    throw error;
  }

  const customerId = generateId("CUS");

  const customer = await Customer.create({
    customerId,
    lead: data.lead || undefined,
    name: data.name,
    companyName: data.companyName,
    mobile: data.mobile,
    alternateMobile: data.alternateMobile,
    email: data.email,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    gstNumber: data.gstNumber,
    panNumber: data.panNumber,
    customerType: data.customerType || "Individual",
    siteAddress: data.siteAddress,
    notes: data.notes,
    status: data.status || "Active",
    createdBy,
  });

  if (data.lead) {
    const lead = await Lead.findById(data.lead);

    if (lead) {
      lead.convertedCustomer = customer._id;

      const statusPath = Lead.schema.path("status");

      if (
        statusPath &&
        Array.isArray(statusPath.enumValues) &&
        statusPath.enumValues.includes("CONVERTED")
      ) {
        lead.status = "CONVERTED";
      }

      lead.updatedBy = createdBy;
      await lead.save();
    }
  }

  return getCustomerById(customer._id);
};

const getCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  customerType,
  lead,
  city,
  state,
}) => {
  const filter = buildFilter({
    search,
    status,
    customerType,
    lead,
    city,
    state,
  });

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (pageNumber - 1) * limitNumber;

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .populate(
        "lead",
        "leadId customerName companyName mobile status"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getCustomerById = async (customerId) => {
  const customer = await Customer.findById(customerId)
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .populate(
      "createdBy",
      "username email role"
    )
    .populate(
      "updatedBy",
      "username email role"
    );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

const getCustomerByCustomerId = async (customerCode) => {
  const customer = await Customer.findOne({
    customerId: customerCode,
  })
    .populate(
      "lead",
      "leadId customerName companyName mobile email status"
    )
    .populate(
      "createdBy",
      "username email role"
    )
    .populate(
      "updatedBy",
      "username email role"
    );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

const updateCustomer = async (
  customerId,
  data,
  updatedBy
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.mobile && data.mobile !== customer.mobile) {
    const existingMobile = await Customer.findOne({
      mobile: data.mobile,
      _id: { $ne: customerId },
    });

    if (existingMobile) {
      const error = new Error(
        "Customer with this mobile number already exists"
      );
      error.statusCode = 409;
      throw error;
    }
  }

  if (data.lead !== undefined) {
    if (data.lead) {
      const lead = await Lead.findById(data.lead);

      if (!lead) {
        const error = new Error("Lead not found");
        error.statusCode = 404;
        throw error;
      }

      if (
        lead.convertedCustomer &&
        String(lead.convertedCustomer) !== String(customer._id)
      ) {
        const error = new Error(
          "This lead is already linked to another customer"
        );
        error.statusCode = 409;
        throw error;
      }

      lead.convertedCustomer = customer._id;
      lead.updatedBy = updatedBy;

      const statusPath = Lead.schema.path("status");

      if (
        statusPath &&
        Array.isArray(statusPath.enumValues) &&
        statusPath.enumValues.includes("CONVERTED")
      ) {
        lead.status = "CONVERTED";
      }

      await lead.save();

      customer.lead = lead._id;
    } else {
      customer.lead = undefined;
    }
  }

  const allowedFields = [
    "name",
    "companyName",
    "mobile",
    "alternateMobile",
    "email",
    "address",
    "city",
    "state",
    "pincode",
    "gstNumber",
    "panNumber",
    "customerType",
    "siteAddress",
    "notes",
    "status",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      customer[field] = data[field];
    }
  });

  customer.updatedBy = updatedBy;

  await customer.save();

  return getCustomerById(customer._id);
};

const updateCustomerStatus = async (
  customerId,
  status,
  updatedBy
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  if (!["Active", "Inactive"].includes(status)) {
    const error = new Error("Invalid customer status");
    error.statusCode = 400;
    throw error;
  }

  customer.status = status;
  customer.updatedBy = updatedBy;

  await customer.save();

  return getCustomerById(customer._id);
};

const deactivateCustomer = async (
  customerId,
  updatedBy
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  customer.status = "Inactive";
  customer.updatedBy = updatedBy;

  await customer.save();

  return customer;
};

const getCustomersByLead = async (leadId) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  return Customer.find({
    lead: leadId,
  })
    .populate(
      "createdBy",
      "username email role"
    )
    .populate(
      "updatedBy",
      "username email role"
    )
    .sort({ createdAt: -1 })
    .lean();
};

const getCustomerStats = async () => {
  const [statusStats, typeStats] =
    await Promise.all([
      Customer.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Customer.aggregate([
        {
          $group: {
            _id: "$customerType",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
    ]);

  return {
    byStatus: statusStats,
    byType: typeStats,
  };
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerByCustomerId,
  updateCustomer,
  updateCustomerStatus,
  deactivateCustomer,
  getCustomersByLead,
  getCustomerStats,
};