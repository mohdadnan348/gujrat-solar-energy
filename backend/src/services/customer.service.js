const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Employee = require("../models/Employee");
const generateId = require("../utils/generateId");

/*
|--------------------------------------------------------------------------
| Build Customer Filter
|--------------------------------------------------------------------------
*/

const buildFilter = ({
  search = "",
  status,
  customerType,
  lead,
  city,
  state,
}) => {
  const filter = {};

  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) {
    filter.$or = [
      {
        customerId: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
      {
        name: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
      {
        companyName: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
      {
        mobile: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
      {
        email: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
      {
        gstNumber: {
          $regex: trimmedSearch,
          $options: "i",
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (customerType) {
    filter.customerType = customerType;
  }

  if (lead) {
    filter.lead = lead;
  }

  if (city) {
    filter.city = {
      $regex: String(city).trim(),
      $options: "i",
    };
  }

  if (state) {
    filter.state = {
      $regex: String(state).trim(),
      $options: "i",
    };
  }

  return filter;
};

/*
|--------------------------------------------------------------------------
| Get Employee Profile
|--------------------------------------------------------------------------
|
| User._id
|    ↓
| Employee.user
|    ↓
| Employee._id
|
| Lead.assignedTo -> Employee._id
|
|--------------------------------------------------------------------------
*/

const getEmployeeScope = async (userId) => {
  if (!userId) {
    const error = new Error(
      "User identity is required to access customers"
    );

    error.statusCode = 401;

    throw error;
  }

  const employee = await Employee.findOne({
    user: userId,
  })
    .select("_id employeeId name email status user")
    .lean();

  if (!employee) {
    const error = new Error(
      "Employee profile not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return employee;
};

/*
|--------------------------------------------------------------------------
| Get Employee Lead IDs
|--------------------------------------------------------------------------
|
| Employee owns a lead when:
|
| 1. Lead.createdBy = current User
| OR
| 2. Lead.assignedTo = current Employee
|
|--------------------------------------------------------------------------
*/

const getEmployeeLeadIds = async (userId) => {
  const employee =
    await getEmployeeScope(userId);

  const leads = await Lead.find({
    $or: [
      {
        createdBy: userId,
      },
      {
        assignedTo: employee._id,
      },
    ],
  })
    .select("_id")
    .lean();

  return {
    employeeId: employee._id,
    leadIds: leads.map(
      (lead) => lead._id
    ),
  };
};

/*
|--------------------------------------------------------------------------
| Apply Employee Scope
|--------------------------------------------------------------------------
*/

const applyEmployeeScope = async (
  filter,
  userId,
  role
) => {
  const normalizedRole =
    String(role || "").toUpperCase();

  if (normalizedRole !== "EMPLOYEE") {
    return filter;
  }

  if (!userId) {
    const error = new Error(
      "User identity is required to access customers"
    );

    error.statusCode = 401;

    throw error;
  }

  const {
    leadIds,
  } = await getEmployeeLeadIds(userId);

  /*
  |--------------------------------------------------------------------------
  | Employee can see:
  |
  | 1. Customers created by himself
  | 2. Customers linked to his own/assigned leads
  |--------------------------------------------------------------------------
  */

  const ownershipConditions = [
    {
      createdBy: userId,
    },
  ];

  if (leadIds.length > 0) {
    ownershipConditions.push({
      lead: {
        $in: leadIds,
      },
    });
  }

  const existingOr = filter.$or;

  /*
  |--------------------------------------------------------------------------
  | Search already contains $or
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | search condition
  |        AND
  | employee ownership
  |
  |--------------------------------------------------------------------------
  */

  if (existingOr) {
    delete filter.$or;

    filter.$and = [
      {
        $or: existingOr,
      },
      {
        $or: ownershipConditions,
      },
    ];
  } else {
    filter.$or =
      ownershipConditions;
  }

  return filter;
};

/*
|--------------------------------------------------------------------------
| Create Customer
|--------------------------------------------------------------------------
*/

const createCustomer = async (
  data,
  createdBy
) => {
  if (!createdBy) {
    const error = new Error(
      "Created by user is required"
    );

    error.statusCode = 401;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Lead
  |--------------------------------------------------------------------------
  */

  let lead = null;

  if (data.lead) {
    lead = await Lead.findById(
      data.lead
    );

    if (!lead) {
      const error = new Error(
        "Lead not found"
      );

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

  /*
  |--------------------------------------------------------------------------
  | Duplicate Mobile
  |--------------------------------------------------------------------------
  */

  if (data.mobile) {
    const existingMobile =
      await Customer.findOne({
        mobile: data.mobile,
      });

    if (existingMobile) {
      const error = new Error(
        "Customer with this mobile number already exists"
      );

      error.statusCode = 409;

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Create Customer
  |--------------------------------------------------------------------------
  */

  const customerId =
    generateId("CUS");

  const customer =
    await Customer.create({
      customerId,

      lead:
        data.lead || undefined,

      name:
        data.name,

      companyName:
        data.companyName,

      mobile:
        data.mobile,

      alternateMobile:
        data.alternateMobile,

      email:
        data.email,

      address:
        data.address,

      city:
        data.city,

      state:
        data.state,

      pincode:
        data.pincode,

      gstNumber:
        data.gstNumber,

      panNumber:
        data.panNumber,

      customerType:
        data.customerType ||
        "Individual",

      siteAddress:
        data.siteAddress,

      notes:
        data.notes,

      status:
        data.status ||
        "Active",

      createdBy,
    });

  /*
  |--------------------------------------------------------------------------
  | Convert Lead
  |--------------------------------------------------------------------------
  */

  if (lead) {
    lead.convertedCustomer =
      customer._id;

    lead.updatedBy =
      createdBy;

    const statusPath =
      Lead.schema.path("status");

    if (
      statusPath &&
      Array.isArray(
        statusPath.enumValues
      ) &&
      statusPath.enumValues.includes(
        "CONVERTED"
      )
    ) {
      lead.status =
        "CONVERTED";
    }

    await lead.save();
  }

  /*
  |--------------------------------------------------------------------------
  | Return Created Customer
  |--------------------------------------------------------------------------
  */

  return getCustomerById(
    customer._id,
    createdBy,
    null
  );
};

/*
|--------------------------------------------------------------------------
| Get Customers
|--------------------------------------------------------------------------
*/

const getCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  customerType,
  lead,
  city,
  state,
  userId,
  role,
}) => {
  let filter =
    buildFilter({
      search,
      status,
      customerType,
      lead,
      city,
      state,
    });

  /*
  |--------------------------------------------------------------------------
  | Employee Access
  |--------------------------------------------------------------------------
  */

  filter =
    await applyEmployeeScope(
      filter,
      userId,
      role
    );

  const pageNumber = Math.max(
    Number(page) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(
      Number(limit) || 10,
      1
    ),
    100
  );

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const [
    customers,
    total,
  ] = await Promise.all([
    Customer.find(filter)
      .populate(
        "lead",
        "leadId customerName companyName mobile status assignedTo createdBy"
      )
      .populate(
        "createdBy",
        "username email role"
      )
      .populate(
        "updatedBy",
        "username email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Customer.countDocuments(
      filter
    ),
  ]);

  return {
    customers,

    pagination: {
      page:
        pageNumber,

      limit:
        limitNumber,

      total,

      totalPages:
        Math.ceil(
          total /
            limitNumber
        ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Get Customer By ID
|--------------------------------------------------------------------------
*/

const getCustomerById = async (
  customerId,
  userId,
  role
) => {
  const customer =
    await Customer.findById(
      customerId
    )
      .populate(
        "lead",
        "leadId customerName companyName mobile email status assignedTo createdBy"
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
    const error = new Error(
      "Customer not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Employee Authorization
  |--------------------------------------------------------------------------
  */

  const normalizedRole =
    String(role || "").toUpperCase();

  if (
    normalizedRole === "EMPLOYEE"
  ) {
    if (!userId) {
      const error = new Error(
        "User identity is required"
      );

      error.statusCode = 401;

      throw error;
    }

    const employee =
      await getEmployeeScope(
        userId
      );

    const createdByEmployee =
      customer.createdBy &&
      String(
        customer.createdBy._id
      ) ===
        String(userId);

    const assignedLead =
      customer.lead &&
      customer.lead.assignedTo &&
      String(
        customer.lead.assignedTo
      ) ===
        String(employee._id);

    const createdFromOwnLead =
      customer.lead &&
      customer.lead.createdBy &&
      String(
        customer.lead.createdBy
      ) ===
        String(userId);

    if (
      !createdByEmployee &&
      !assignedLead &&
      !createdFromOwnLead
    ) {
      const error = new Error(
        "You do not have permission to access this customer"
      );

      error.statusCode = 403;

      throw error;
    }
  }

  return customer;
};

/*
|--------------------------------------------------------------------------
| Get Customer By Customer ID
|--------------------------------------------------------------------------
*/

const getCustomerByCustomerId = async (
  customerCode
) => {
  const customer =
    await Customer.findOne({
      customerId:
        customerCode,
    })
      .populate(
        "lead",
        "leadId customerName companyName mobile email status assignedTo createdBy"
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
    const error = new Error(
      "Customer not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return customer;
};

/*
|--------------------------------------------------------------------------
| Update Customer
|--------------------------------------------------------------------------
*/

const updateCustomer = async (
  customerId,
  data,
  updatedBy,
  role
) => {
  const customer =
    await Customer.findById(
      customerId
    );

  if (!customer) {
    const error = new Error(
      "Customer not found"
    );

    error.statusCode = 404;

    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Employee authorization
  |--------------------------------------------------------------------------
  */

  const normalizedRole =
    String(role || "").toUpperCase();

  if (
    normalizedRole === "EMPLOYEE"
  ) {
    await getCustomerById(
      customerId,
      updatedBy,
      role
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Duplicate Mobile
  |--------------------------------------------------------------------------
  */

  if (
    data.mobile &&
    data.mobile !==
      customer.mobile
  ) {
    const existingMobile =
      await Customer.findOne({
        mobile:
          data.mobile,

        _id: {
          $ne: customerId,
        },
      });

    if (existingMobile) {
      const error = new Error(
        "Customer with this mobile number already exists"
      );

      error.statusCode = 409;

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Lead Update
  |--------------------------------------------------------------------------
  */

  if (
    data.lead !==
    undefined
  ) {
    if (data.lead) {
      const lead =
        await Lead.findById(
          data.lead
        );

      if (!lead) {
        const error = new Error(
          "Lead not found"
        );

        error.statusCode = 404;

        throw error;
      }

      if (
        lead.convertedCustomer &&
        String(
          lead.convertedCustomer
        ) !==
          String(
            customer._id
          )
      ) {
        const error = new Error(
          "This lead is already linked to another customer"
        );

        error.statusCode = 409;

        throw error;
      }

      lead.convertedCustomer =
        customer._id;

      lead.updatedBy =
        updatedBy;

      const statusPath =
        Lead.schema.path(
          "status"
        );

      if (
        statusPath &&
        Array.isArray(
          statusPath.enumValues
        ) &&
        statusPath.enumValues.includes(
          "CONVERTED"
        )
      ) {
        lead.status =
          "CONVERTED";
      }

      await lead.save();

      customer.lead =
        lead._id;
    } else {
      customer.lead =
        undefined;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Allowed Fields
  |--------------------------------------------------------------------------
  */

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

  allowedFields.forEach(
    (field) => {
      if (
        data[field] !==
        undefined
      ) {
        customer[field] =
          data[field];
      }
    }
  );

  customer.updatedBy =
    updatedBy;

  await customer.save();

  return getCustomerById(
    customer._id,
    updatedBy,
    role
  );
};

/*
|--------------------------------------------------------------------------
| Update Customer Status
|--------------------------------------------------------------------------
*/

const updateCustomerStatus =
  async (
    customerId,
    status,
    updatedBy,
    role
  ) => {
    const customer =
      await Customer.findById(
        customerId
      );

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const normalizedRole =
      String(role || "").toUpperCase();

    if (
      normalizedRole ===
      "EMPLOYEE"
    ) {
      await getCustomerById(
        customerId,
        updatedBy,
        role
      );
    }

    if (
      ![
        "Active",
        "Inactive",
      ].includes(status)
    ) {
      const error = new Error(
        "Invalid customer status"
      );

      error.statusCode = 400;

      throw error;
    }

    customer.status =
      status;

    customer.updatedBy =
      updatedBy;

    await customer.save();

    return getCustomerById(
      customer._id,
      updatedBy,
      role
    );
  };

/*
|--------------------------------------------------------------------------
| Deactivate Customer
|--------------------------------------------------------------------------
*/

const deactivateCustomer =
  async (
    customerId,
    updatedBy,
    role
  ) => {
    const customer =
      await Customer.findById(
        customerId
      );

    if (!customer) {
      const error = new Error(
        "Customer not found"
      );

      error.statusCode = 404;

      throw error;
    }

    const normalizedRole =
      String(role || "").toUpperCase();

    if (
      normalizedRole ===
      "EMPLOYEE"
    ) {
      await getCustomerById(
        customerId,
        updatedBy,
        role
      );
    }

    customer.status =
      "Inactive";

    customer.updatedBy =
      updatedBy;

    await customer.save();

    return customer;
  };

/*
|--------------------------------------------------------------------------
| Customers By Lead
|--------------------------------------------------------------------------
*/

const getCustomersByLead =
  async (
    leadId
  ) => {
    const lead =
      await Lead.findById(
        leadId
      );

    if (!lead) {
      const error = new Error(
        "Lead not found"
      );

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
      .sort({
        createdAt: -1,
      })
      .lean();
  };

/*
|--------------------------------------------------------------------------
| Customer Stats
|--------------------------------------------------------------------------
*/

const getCustomerStats =
  async () => {
    const [
      statusStats,
      typeStats,
    ] = await Promise.all([
      Customer.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
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
            count: {
              $sum: 1,
            },
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
      byStatus:
        statusStats,

      byType:
        typeStats,
    };
  };

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerByCustomerId,
  updateCustomer,
  updateCustomerStatus,
  deactivateCustomer,
  getCustomersByLead,
  getCustomerByLead:
    getCustomersByLead,
  getCustomerStats,
};