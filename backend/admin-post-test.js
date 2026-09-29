const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

const ADMIN_EMAIL = "admin@gujratsolarenergy.com";
const ADMIN_PASSWORD = "Admin@12345";

let token;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

const headers = () => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

async function login() {
  const res = await api.post("/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (res.status !== 200) {
    throw new Error(
      `Admin login failed: ${res.status} ${JSON.stringify(res.data)}`
    );
  }

  token = res.data?.data?.token || res.data?.token;

  if (!token) {
    throw new Error("Login successful but token not found.");
  }

  console.log("✅ Admin Login Successful\n");
}

async function get(path) {
  const res = await api.get(path, { headers: headers() });
  return res;
}

async function post(path, data) {
  const res = await api.post(path, data, { headers: headers() });

  const ok = res.status >= 200 && res.status < 300;

  console.log(
    `${ok ? "✅ PASS" : "❌ FAIL"} POST ${path} ${res.status}`
  );

  if (!ok) {
    console.log(
  "   Error:",
  JSON.stringify(res.data, null, 2)
);  }

  return res;
}

async function run() {
  await login();
const leaveTypes = (await get("/leave-types")).data?.data || [];

console.log("\nLeave Types:");
console.log(JSON.stringify(leaveTypes, null, 2));

  console.log("========================================");
  console.log("      ADMIN POST API TEST");
  console.log("========================================\n");

  // Existing records
  const users = (await get("/users")).data?.data || [];
  const leads = (await get("/leads")).data?.data || [];
  const employees = (await get("/employees")).data?.data || [];
  const solarRequirements =
    (await get("/solar-requirements")).data?.data || [];
  const customers = (await get("/customers")).data?.data || [];

  const adminUser = users.find(
    (u) => u.email === ADMIN_EMAIL
  );

const lead =
  leads.find(
    (item) => !item.convertedCustomer
  ) || null;

const employee = employees[0];
const solarRequirement = solarRequirements[0];
const customer = customers[0];  console.log("Existing IDs:");
  console.log("Lead:", lead?._id || "NONE");
  console.log("Employee:", employee?._id || "NONE");
  console.log("Solar Requirement:", solarRequirement?._id || "NONE");
  console.log("Customer:", customer?._id || "NONE");
  console.log();

  // ----------------------------------------
  // 1. LEAD ACTIVITY
  // ----------------------------------------

  if (lead) {
    await post(
      `/lead-activities/lead/${lead._id}`,
     {
  activityType: "Call",
  title: "API Automated Test",
  description: "Automated Admin API POST test",
  status: "Completed",
}    );
  } else {
    console.log("⚠️ SKIP POST /lead-activities/lead/:leadId — no lead");
  }

  // ----------------------------------------
  // 2. TASK
  // ----------------------------------------

  if (employee) {
    await post("/tasks", {
      title: "API Automated Test Task",
      description: "Temporary task created by Admin API test",
      assignedTo: employee._id,
      priority: "Low",
      status: "Pending",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });
  } else {
    console.log("⚠️ SKIP POST /tasks — no employee");
  }

  // ----------------------------------------
  // 3. SOLAR REQUIREMENT
  // ----------------------------------------

  if (lead) {
    await post("/solar-requirements", {
      lead: lead._id,
      requiredKw: 5,
      monthlyBill: 5000,
      monthlyUnits: 500,
      roofType: "RCC",
      roofArea: 1000,
      siteAddress: "API Test Site",
      location: "Test Location",
      connectionType: "Single Phase",
     systemType: "On-grid",
      batteryRequired: false,
      notes: "Automated API test",
    });
  } else {
    console.log(
      "⚠️ SKIP POST /solar-requirements — no lead"
    );
  }

  // ----------------------------------------
  // 4. CUSTOMER
  // ----------------------------------------

  if (lead) {
    await post("/customers", {
      lead: lead._id,
      name: `API Test Customer ${Date.now()}`,
      companyName: "API Test Company",
      mobile: `9${Date.now().toString().slice(-9)}`,
      email: `apitest${Date.now()}@example.com`,
      address: "API Test Address",
    });
  } else {
    console.log("⚠️ SKIP POST /customers — no lead");
  }

  // ----------------------------------------
  // 5. LEAVE
  // ----------------------------------------

 // ----------------------------------------
// 5. LEAVE
// ----------------------------------------

// ----------------------------------------
// 5. LEAVE
// ----------------------------------------

const casualLeave = leaveTypes.find(
  (type) => type.code === "CASUAL"
);



if (employee && casualLeave) {
  await post("/leaves", {
    employee: employee._id,
    leaveType: casualLeave._id,
    startDate: new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0],
    endDate: new Date(Date.now() + 2 * 86400000)
      .toISOString()
      .split("T")[0],
    reason: "API Automated Test Leave",
  });
} else {
  console.log(
    "⚠️ SKIP POST /leaves — employee or leave type missing"
  );
}  // ----------------------------------------
  // 6. SYSTEM CONFIGURATION
  // ----------------------------------------

  if (lead && solarRequirement) {
    await post("/system-configurations", {
      lead: lead._id,
      solarRequirement: solarRequirement._id,
      version: 999,
      systemType: "ON_GRID",
      systemCapacity: 5,
      panels: [],
      inverter: [],
      battery: [],
      installation: [],
      notes: "Automated API test",
    });
  } else {
    console.log(
      "⚠️ SKIP POST /system-configurations — required records missing"
    );
  }

  console.log("\n========================================");
  console.log("          POST TEST COMPLETED");
  console.log("========================================");
}

run().catch((error) => {
  console.error("\n❌ TEST SCRIPT ERROR");
  console.error(error.message);
});
