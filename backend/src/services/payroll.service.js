const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const isSunday = (date) => date.getDay() === 0;
const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getMonthlyPayroll = async ({ month, year, employee: employeeId } = {}) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 ||
      !Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100) {
    const error = new Error("Valid month (1-12) and year are required");
    error.statusCode = 400;
    throw error;
  }

  const start = new Date(yearNumber, monthNumber - 1, 1);
  const end = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);
  const today = new Date();
  const isCurrentMonth = yearNumber === today.getFullYear() && monthNumber === today.getMonth() + 1;
  const periodEnd = isCurrentMonth ? new Date(Math.min(today.getTime(), end.getTime())) : end;
  const employees = await Employee.find({
    ...(employeeId ? { _id: employeeId } : {}),
    status: { $not: /^inactive$/i },
  }).select("employeeId name email role joiningDate monthlySalary status").lean();

  const output = [];
  for (const employee of employees) {
    const effectiveStart = employee.joiningDate && employee.joiningDate > start
      ? new Date(employee.joiningDate.getFullYear(), employee.joiningDate.getMonth(), employee.joiningDate.getDate())
      : start;
    const attendanceStart = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), effectiveStart.getDate());
    const attendanceEnd = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
    let workingDaysInMonth = 0;
    for (let d = new Date(effectiveStart); d <= end; d.setDate(d.getDate() + 1)) {
      if (!isSunday(d)) workingDaysInMonth += 1;
    }
    let elapsedWorkingDays = 0;
    for (let d = new Date(attendanceStart); d <= attendanceEnd; d.setDate(d.getDate() + 1)) {
      if (!isSunday(d)) elapsedWorkingDays += 1;
    }
    const records = await Attendance.find({
      employee: employee._id,
      attendanceDate: { $gte: attendanceStart, $lte: attendanceEnd },
    }).select("status totalHours attendanceDate").lean();
    const byDate = new Map(records.map((record) => [new Date(record.attendanceDate).toDateString(), record]));
    let presentDays = 0, lateDays = 0, halfDays = 0, absentDays = 0, unmarkedDays = 0, totalHours = 0;
    for (let d = new Date(attendanceStart); d <= attendanceEnd; d.setDate(d.getDate() + 1)) {
      if (isSunday(d)) continue;
      const record = byDate.get(d.toDateString());
      if (!record) { unmarkedDays += 1; continue; }
      const status = String(record.status || "").toUpperCase().replace(/[ -]/g, "_");
      totalHours += Number(record.totalHours) || 0;
      if (status === "ABSENT") absentDays += 1;
      else if (status === "HALF_DAY") halfDays += 1;
      else if (status === "LATE") lateDays += 1;
      else if (status === "PRESENT") presentDays += 1;
    }
    // Unmarked future dates are not treated as absences. Only explicit Absent records deduct salary.
    const monthlySalary = Number(employee.monthlySalary) || 0;
    const dailyRate = workingDaysInMonth > 0 ? monthlySalary / workingDaysInMonth : 0;
    const absentDeduction = dailyRate * absentDays;
    const halfDayDeduction = dailyRate * 0.5 * halfDays;
    const totalDeduction = absentDeduction + halfDayDeduction;
    output.push({
      employee: { _id: employee._id, employeeId: employee.employeeId, name: employee.name, email: employee.email, role: employee.role },
      month: monthNumber, year: yearNumber, monthlySalary: money(monthlySalary),
      workingDaysInMonth, elapsedWorkingDays, presentDays, lateDays, halfDays, absentDays, unmarkedDays,
      totalHours: money(totalHours), dailyRate: money(dailyRate), absentDeduction: money(absentDeduction),
      halfDayDeduction: money(halfDayDeduction), totalDeduction: money(totalDeduction),
      payableSalary: money(Math.max(0, monthlySalary - totalDeduction)),
      note: "Sunday excluded. Late counts as a full day; only explicit Absent and Half Day records deduct salary. Unmarked days are shown separately, not silently deducted.",
    });
  }
  return output;
};

module.exports = { getMonthlyPayroll };
