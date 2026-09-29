const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/v1";

const ADMIN_EMAIL = "admin@gujratsolarenergy.com";
const ADMIN_PASSWORD = "Admin@12345";

let token = "";

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

const results = [];

function extractList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function extractObject(response) {
  const data = response?.data;

  if (!data) return null;

  if (data.data && !Array.isArray(data.data)) {
    return data.data;
  }

  return data;
}

function getId(item) {
  return item?._id || item?.id;
}

async function login() {
  const response = await api.post("/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Admin login failed: ${response.status} ${JSON.stringify(response.data)}`
    );
  }

  token =
    response.data?.data?.token ||
    response.data?.token ||
    response.data?.data?.accessToken ||
    response.data?.accessToken;

  if (!token) {
    throw new Error("Login successful but token was not found.");
  }

  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  console.log("✅ Admin Login Successful\n");
}

async function getCollection(path) {
  const response = await api.get(path);

  if (response.status >= 200 && response.status < 300) {
    return extractList(response);
  }

  return [];
}

async function testGet(path, label = "") {
  const response = await api.get(path);

  const name = `GET ${path}`;

  if (response.status >= 200 && response.status < 300) {
    console.log(
      `✅ PASS  ${name.padEnd(65)} ${response.status}`
    );

    results.push({
      path,
      status: response.status,
      result: "PASS",
    });

    return true;
  }

  console.log(
    `❌ FAIL  ${name.padEnd(65)} ${response.status}`
  );

  console.log(
    `       Error: ${JSON.stringify(
      response.data?.message ||
        response.data?.error ||
        response.data ||
        "Unknown error"
    )}`
  );

  results.push({
    path,
    status: response.status,
    result: "FAIL",
    error:
      response.data?.message ||
      response.data?.error ||
      JSON.stringify(response.data),
  });

  return false;
}

async function testIfId(label, collection, pathBuilder) {
  if (!collection.length) {
    console.log(
      `⚠️ SKIP  ${label} — no database record available`
    );

    results.push({
      path: label,
      result: "SKIP",
      reason: "No database record available",
    });

    return;
  }

  const item = collection[0];
  const id = getId(item);

  if (!id) {
    console.log(
      `⚠️ SKIP  ${label} — record has no _id/id`
    );

    results.push({
      path: label,
      result: "SKIP",
      reason: "No ID found",
    });

    return;
  }

  await testGet(pathBuilder(id), label);
}

async function main() {
  console.log("========================================");
  console.log("   ADMIN PARAMETERIZED GET API TEST");
  console.log("========================================\n");

  await login();

  console.log("Collecting database IDs...\n");

  const users = await getCollection("/users");
  const solarRequirements = await getCollection(
    "/solar-requirements"
  );
  const tasks = await getCollection("/tasks");
  const invoices = await getCollection("/invoices");
  const leaves = await getCollection("/leaves");
  const quotations = await getCollection("/quotations");
  const systemConfigurations = await getCollection(
    "/system-configurations"
  );
  const customers = await getCollection("/customers");
  const attendance = await getCollection("/attendance");
  const employees = await getCollection("/employees");
  const leads = await getCollection("/leads");

  const leadActivities = await getCollection(
    "/lead-activities/follow-ups"
  );

  const activityLogs = await getCollection(
    "/activity-logs"
  );

  console.log(
    `Users:                  ${users.length}`
  );
  console.log(
    `Solar Requirements:     ${solarRequirements.length}`
  );
  console.log(
    `Tasks:                  ${tasks.length}`
  );
  console.log(
    `Lead Activities:        ${leadActivities.length}`
  );
  console.log(
    `Activity Logs:          ${activityLogs.length}`
  );
  console.log(
    `Invoices:               ${invoices.length}`
  );
  console.log(
    `Leaves:                 ${leaves.length}`
  );
  console.log(
    `Quotations:             ${quotations.length}`
  );
  console.log(
    `System Configurations:  ${systemConfigurations.length}`
  );
  console.log(
    `Customers:              ${customers.length}`
  );
  console.log(
    `Attendance:             ${attendance.length}`
  );
  console.log(
    `Employees:              ${employees.length}`
  );
  console.log(
    `Leads:                  ${leads.length}`
  );

  console.log("\n========================================");
  console.log("      PARAMETERIZED GET API TEST");
  console.log("========================================\n");

  // USER MANAGEMENT
  await testIfId(
    "GET /users/:id",
    users,
    (id) => `/users/${id}`
  );

  // SOLAR REQUIREMENT
  await testIfId(
    "GET /solar-requirements/:id",
    solarRequirements,
    (id) => `/solar-requirements/${id}`
  );

  await testIfId(
    "GET /solar-requirements/lead/:leadId",
    leads,
    (id) => `/solar-requirements/lead/${id}`
  );

  // TASK
  await testIfId(
    "GET /tasks/:id",
    tasks,
    (id) => `/tasks/${id}`
  );

  // LEAD ACTIVITY
  await testIfId(
    "GET /lead-activities/:id",
    leadActivities,
    (id) => `/lead-activities/${id}`
  );

  await testIfId(
    "GET /lead-activities/lead/:leadId",
    leads,
    (id) => `/lead-activities/lead/${id}`
  );

  // ACTIVITY LOG
  await testIfId(
    "GET /activity-logs/:id",
    activityLogs,
    (id) => `/activity-logs/${id}`
  );

  await testIfId(
    "GET /activity-logs/record/:recordId",
    activityLogs,
    (item) =>
      `/activity-logs/record/${getId(item)}`
  );

  await testIfId(
    "GET /activity-logs/user/:userId",
    users,
    (id) => `/activity-logs/user/${id}`
  );

  // INVOICE
  await testIfId(
    "GET /invoices/:id",
    invoices,
    (id) => `/invoices/${id}`
  );

  await testIfId(
    "GET /invoices/:id/items",
    invoices,
    (id) => `/invoices/${id}/items`
  );

  // LEAVE
  await testIfId(
    "GET /leaves/:id",
    leaves,
    (id) => `/leaves/${id}`
  );

  await testIfId(
    "GET /leaves/employee/:employeeId/balance",
    employees,
    (id) =>
      `/leaves/employee/${id}/balance`
  );

  // QUOTATION
  await testIfId(
    "GET /quotations/:id",
    quotations,
    (id) => `/quotations/${id}`
  );

  await testIfId(
    "GET /quotations/:id/items",
    quotations,
    (id) => `/quotations/${id}/items`
  );

  await testIfId(
    "GET /quotations/:id/bom",
    quotations,
    (id) => `/quotations/${id}/bom`
  );

  // SYSTEM CONFIGURATION
  await testIfId(
    "GET /system-configurations/:id",
    systemConfigurations,
    (id) =>
      `/system-configurations/${id}`
  );

  await testIfId(
    "GET /system-configurations/lead/:leadId",
    leads,
    (id) =>
      `/system-configurations/lead/${id}`
  );

  await testIfId(
    "GET /system-configurations/lead/:leadId/latest",
    leads,
    (id) =>
      `/system-configurations/lead/${id}/latest`
  );

  // CUSTOMER
  await testIfId(
    "GET /customers/:id",
    customers,
    (id) => `/customers/${id}`
  );

  await testIfId(
    "GET /customers/lead/:leadId",
    leads,
    (id) => `/customers/lead/${id}`
  );

  // ATTENDANCE
  await testIfId(
    "GET /attendance/:id",
    attendance,
    (id) => `/attendance/${id}`
  );

  await testIfId(
    "GET /attendance/employee/:employeeId",
    employees,
    (id) =>
      `/attendance/employee/${id}`
  );

  // Use first attendance date for employee/date endpoint
  if (employees.length) {
    const employeeId = getId(employees[0]);

    const employeeAttendance = attendance.find(
      (item) =>
        String(
          item.employee?._id ||
            item.employee ||
            ""
        ) === String(employeeId)
    );

    if (employeeAttendance) {
      const date =
        employeeAttendance.attendanceDate ||
        employeeAttendance.date;

      if (date) {
        const dateOnly = String(date).substring(
          0,
          10
        );

        await testGet(
          `/attendance/employee/${employeeId}/date/${dateOnly}`
        );
      } else {
        console.log(
          "⚠️ SKIP  GET /attendance/employee/:employeeId/date/:date — no attendance date"
        );
      }
    } else {
      console.log(
        "⚠️ SKIP  GET /attendance/employee/:employeeId/date/:date — no matching attendance record"
      );
    }
  } else {
    console.log(
      "⚠️ SKIP  GET /attendance/employee/:employeeId/date/:date — no employee"
    );
  }

  // EMPLOYEE
  await testIfId(
    "GET /employees/:id",
    employees,
    (id) => `/employees/${id}`
  );

  // LEAD
  await testIfId(
    "GET /leads/:id",
    leads,
    (id) => `/leads/${id}`
  );

  // NOTIFICATIONS - record based
  const notificationRecordId =
    activityLogs.length
      ? getId(activityLogs[0])
      : null;

  if (notificationRecordId) {
    await testGet(
      `/notifications/record/${notificationRecordId}`
    );
  } else {
    console.log(
      "⚠️ SKIP  GET /notifications/record/:recordId — no record ID available"
    );
  }

  console.log("\n========================================");
  console.log("          TEST SUMMARY");
  console.log("========================================");

  const tested = results.filter(
    (x) => x.result !== "SKIP"
  );

  const passed = tested.filter(
    (x) => x.result === "PASS"
  );

  const failed = tested.filter(
    (x) => x.result === "FAIL"
  );

  const skipped = results.filter(
    (x) => x.result === "SKIP"
  );

  console.log(`TESTED : ${tested.length}`);
  console.log(`PASS   : ${passed.length}`);
  console.log(`FAIL   : ${failed.length}`);
  console.log(`SKIP   : ${skipped.length}`);

  if (failed.length) {
    console.log("\n❌ FAILED APIs:\n");

    failed.forEach((item) => {
      console.log(
        `${item.path} → ${item.status}`
      );
      console.log(
        `   ${item.error}`
      );
    });
  }

  if (skipped.length) {
    console.log("\n⚠️ SKIPPED APIs:\n");

    skipped.forEach((item) => {
      console.log(
        `${item.path} → ${item.reason}`
      );
    });
  }

  console.log(
    "\n========================================"
  );
}

main().catch((error) => {
  console.error("\n❌ TEST SCRIPT ERROR:");
  console.error(error);
  process.exit(1);
});