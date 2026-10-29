const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");

const isSunday = (date) => date.getDay() === 0;
const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const dateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, days = 1) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const normalizeStatus = (status) => String(status || "").trim().toUpperCase().replace(/[ -]+/g, "_");

const getMonthlyPayroll = async ({ month, year, employee: employeeId } = {}) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 ||
      !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
    const error = new Error("Valid month (1-12) and year are required");
    error.statusCode = 400;
    throw error;
  }

  const monthStart = new Date(yearNumber, monthNumber - 1, 1);
  const monthEnd = new Date(yearNumber, monthNumber, 0);
  const now = new Date();
  const today = dayStart(now);
  const isCurrentMonth = yearNumber === now.getFullYear() && monthNumber === now.getMonth() + 1;
  // Don't classify today's attendance as missing until the attendance scheduler's 3 PM cutoff.
  const countTodayAsElapsed = !isCurrentMonth || now.getHours() >= 15;
  const periodEnd = isCurrentMonth
    ? (countTodayAsElapsed ? today : addDays(today, -1))
    : monthEnd;

  const employees = await Employee.find({
    ...(employeeId ? { _id: employeeId } : {}),
    status: { $not: /^inactive$/i },
  }).select("employeeId name email role joiningDate monthlySalary status").lean();

  const output = [];
  for (const employee of employees) {
    const joinedAt = employee.joiningDate ? dayStart(new Date(employee.joiningDate)) : monthStart;
    const effectiveStart = joinedAt > monthStart ? joinedAt : monthStart;
    const salary = Math.max(0, Number(employee.monthlySalary) || 0);

    if (effectiveStart > monthEnd) {
      output.push({
        employee: { _id: employee._id, employeeId: employee.employeeId, name: employee.name, email: employee.email, role: employee.role },
        month: monthNumber, year: yearNumber, monthlySalary: 0, configuredMonthlySalary: money(salary), eligibleForPayroll: false, workingDaysInMonth: 0,
        elapsedWorkingDays: 0, presentDays: 0, lateDays: 0, halfDays: 0, absentDays: 0,
        unmarkedDays: 0, approvedLeaveDays: 0, totalHours: 0, dailyRate: 0,
        absentDeduction: 0, halfDayDeduction: 0, totalDeduction: 0, payableSalary: 0,
        note: "Employee joined after the selected payroll month.",
      });
      continue;
    }

    // Daily rate is based on scheduled working days in the employee's eligible month.
    let workingDaysInMonth = 0;
    for (let d = new Date(effectiveStart); d <= monthEnd; d = addDays(d)) {
      if (!isSunday(d)) workingDaysInMonth += 1;
    }

    const boundedEnd = periodEnd < effectiveStart ? addDays(effectiveStart, -1) : periodEnd;
    const attendanceStart = effectiveStart;
    const attendanceEndExclusive = addDays(boundedEnd, 1);
    const [records, approvedLeaves] = await Promise.all([
      Attendance.find({
        employee: employee._id,
        attendanceDate: { $gte: attendanceStart, $lt: attendanceEndExclusive },
      }).select("status totalHours attendanceDate").lean(),
      LeaveRequest.find({
        employee: employee._id,
        status: "Approved",
        startDate: { $lte: boundedEnd },
        endDate: { $gte: attendanceStart },
      }).select("startDate endDate totalDays").lean(),
    ]);

    const byDate = new Map(records.map((record) => [dateKey(record.attendanceDate), record]));
    const approvedLeaveDates = new Set();
    for (const leave of approvedLeaves) {
      const leaveStart = dayStart(new Date(leave.startDate)) < attendanceStart ? attendanceStart : dayStart(new Date(leave.startDate));
      const leaveEndRaw = dayStart(new Date(leave.endDate));
      const leaveEnd = leaveEndRaw > boundedEnd ? boundedEnd : leaveEndRaw;
      for (let d = new Date(leaveStart); d <= leaveEnd; d = addDays(d)) {
        if (!isSunday(d)) approvedLeaveDates.add(dateKey(d));
      }
    }

    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let unmarkedDays = 0;
    let approvedLeaveDays = 0;
    let totalHours = 0;

    for (let d = new Date(attendanceStart); d <= boundedEnd; d = addDays(d)) {
      if (isSunday(d)) continue;
      const key = dateKey(d);
      if (approvedLeaveDates.has(key)) {
        approvedLeaveDays += 1;
        continue; // Approved leave does not attract attendance deduction.
      }

      const record = byDate.get(key);
      if (!record) {
        // Missing attendance is unmarked, not automatically absent.
        // Only an explicit ABSENT status creates a salary deduction.
        unmarkedDays += 1;
        continue;
      }

      const status = normalizeStatus(record.status);
      totalHours += Number(record.totalHours) || 0;
      if (status === "ABSENT") absentDays += 1;
      else if (status === "HALF_DAY") halfDays += 1;
      else if (status === "LATE" || status === "PRESENT") {
        // LATE is still a paid full working day, consistent with the attendance module's status.
        if (status === "LATE") lateDays += 1;
        else presentDays += 1;
      } else {
        // Unknown statuses should not silently cause a deduction.
        unmarkedDays += 1;
      }
    }

    const dailyRate = workingDaysInMonth > 0 ? salary / workingDaysInMonth : 0;
    const absentDeduction = dailyRate * absentDays;
    const halfDayDeduction = dailyRate * 0.5 * halfDays;
    const totalDeduction = absentDeduction + halfDayDeduction;
    output.push({
      employee: { _id: employee._id, employeeId: employee.employeeId, name: employee.name, email: employee.email, role: employee.role },
      month: monthNumber,
      year: yearNumber,
      monthlySalary: money(salary),
      configuredMonthlySalary: money(salary),
      eligibleForPayroll: true,
      workingDaysInMonth,
      elapsedWorkingDays: Math.max(0, Array.from({ length: Math.max(0, Math.floor((boundedEnd - attendanceStart) / 86400000) + 1) }, (_, i) => addDays(attendanceStart, i)).filter((d) => !isSunday(d)).length),
      presentDays,
      lateDays,
      halfDays,
      absentDays,
      unmarkedDays,
      approvedLeaveDays,
      totalHours: money(totalHours),
      dailyRate: money(dailyRate),
      absentDeduction: money(absentDeduction),
      halfDayDeduction: money(halfDayDeduction),
      totalDeduction: money(totalDeduction),
      payableSalary: money(Math.max(0, salary - totalDeduction)),
      note: "Daily rate uses the full scheduled working days in the selected month (excluding Sundays). Present/Late = full paid day; Half Day = 0.5 day deduction; only explicitly marked Absent = full day deduction. Approved leave and dates without an attendance record are not deducted; missing records are shown as unmarked. Employees joining after the selected month have zero eligible payroll salary for that period.",
    });
  }
  return output;
};

module.exports = { getMonthlyPayroll };
