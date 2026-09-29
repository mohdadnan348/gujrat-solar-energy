const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

// ==========================================
// ADMIN LOGIN DETAILS
// ==========================================
// YAHAN apne ADMIN login credentials daalo
const ADMIN_EMAIL = "admin@gujratsolarenergy.com";
const ADMIN_PASSWORD = "Admin@12345";

// ==========================================
// API LIST - SAFE GET TESTS
// ==========================================
const APIs = [
  // Users
  ["GET", "/users"],

  // Reports
  ["GET", "/reports"],
  ["GET", "/reports/leads"],
  ["GET", "/reports/quotations"],
  ["GET", "/reports/invoices"],
  ["GET", "/reports/tasks"],
  ["GET", "/reports/attendance"],
  ["GET", "/reports/leaves"],
  ["GET", "/reports/employees"],
  ["GET", "/reports/sales-performance"],

  // Solar Requirements
  ["GET", "/solar-requirements"],

  // Tasks
  ["GET", "/tasks/my"],
  ["GET", "/tasks/overdue"],
  ["GET", "/tasks"],

  // Lead Activities
  ["GET", "/lead-activities/follow-ups"],

  // Activity Logs
  ["GET", "/activity-logs"],

  // Invoices
  ["GET", "/invoices"],

  // Leaves
  ["GET", "/leaves/my"],
  ["GET", "/leaves/my/balance"],
  ["GET", "/leaves"],

  // Quotations
  ["GET", "/quotations"],

  // System Configuration
  ["GET", "/system-configurations"],

  // Customers
  ["GET", "/customers"],

  // Attendance
  ["GET", "/attendance/my"],
  ["GET", "/attendance/summary"],
  ["GET", "/attendance"],

  // Settings
  ["GET", "/settings"],
  ["GET", "/settings/document"],

  // Dashboard
  ["GET", "/dashboard"],
  ["GET", "/dashboard/summary"],
  ["GET", "/dashboard/leads"],
  ["GET", "/dashboard/quotations"],
  ["GET", "/dashboard/invoices"],
  ["GET", "/dashboard/tasks"],
  ["GET", "/dashboard/employee-performance"],
  ["GET", "/dashboard/recent/leads"],
  ["GET", "/dashboard/recent/quotations"],
  ["GET", "/dashboard/recent/invoices"],
  ["GET", "/dashboard/upcoming-tasks"],

  // Employees
  ["GET", "/employees"],

  // Leads
  ["GET", "/leads"],
];

async function login() {
  console.log("\n========================================");
  console.log("       ADMIN API AUTOMATED TEST");
  console.log("========================================\n");

  console.log("Logging in as Admin...");

  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token =
      response.data?.data?.token ||
      response.data?.token ||
      response.data?.data?.accessToken ||
      response.data?.accessToken;

    if (!token) {
      console.log("\n❌ LOGIN FAILED");
      console.log("Response:", JSON.stringify(response.data, null, 2));
      process.exit(1);
    }

    console.log("✅ Admin Login Successful\n");

    return token;
  } catch (error) {
    console.log("\n❌ ADMIN LOGIN FAILED");

    console.log(
      "Status:",
      error.response?.status || "NO RESPONSE"
    );

    console.log(
      "Message:",
      error.response?.data || error.message
    );

    process.exit(1);
  }
}

async function testAPI(token, method, endpoint) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000,
    });

    console.log(
      `✅ PASS  ${method.padEnd(6)} ${endpoint.padEnd(45)} ${response.status}`
    );

    return {
      status: "PASS",
      method,
      endpoint,
      code: response.status,
    };
  } catch (error) {
    const status = error.response?.status || "ERR";

    console.log(
      `❌ FAIL  ${method.padEnd(6)} ${endpoint.padEnd(45)} ${status}`
    );

    if (error.response?.data) {
      console.log(
        "       Error:",
        JSON.stringify(error.response.data)
      );
    } else {
      console.log(
        "       Error:",
        error.message
      );
    }

    return {
      status: "FAIL",
      method,
      endpoint,
      code: status,
      error: error.response?.data || error.message,
    };
  }
}

async function runTests() {
  const token = await login();

  const results = [];

  console.log("========================================");
  console.log("       TESTING ADMIN GET APIs");
  console.log("========================================\n");

  for (const [method, endpoint] of APIs) {
    const result = await testAPI(
      token,
      method,
      endpoint
    );

    results.push(result);
  }

  const passed = results.filter(
    (r) => r.status === "PASS"
  ).length;

  const failed = results.filter(
    (r) => r.status === "FAIL"
  ).length;

  console.log("\n========================================");
  console.log("          TEST SUMMARY");
  console.log("========================================");

  console.log(`TOTAL : ${results.length}`);
  console.log(`PASS  : ${passed}`);
  console.log(`FAIL  : ${failed}`);

  console.log("========================================\n");

  if (failed > 0) {
    console.log("❌ FAILED APIs:\n");

    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => {
        console.log(
          `${r.method} ${r.endpoint} → ${r.code}`
        );
      });
  } else {
    console.log("🎉 ALL TESTED APIs PASSED!");
  }
}

runTests();