"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Loader from "@/components/common/Loader";
import attendanceService from "@/services/attendance.service";
import "./detail.css";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const toDateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
}) : "—";
const formatTime = (value) => value ? new Date(value).toLocaleTimeString("en-IN", {
  hour: "2-digit", minute: "2-digit",
}) : "—";
const norm = (value) => String(value || "").trim().toLowerCase();

export default function EmployeeAttendanceDetailPage() {
  const params = useParams();
  const employeeId = params?.employeeId;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");

  const load = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const dateFrom = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const dateTo = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const response = await attendanceService.getEmployeeAttendance(employeeId, {
        dateFrom, dateTo, page: 1, limit: 100,
      });
      const list = Array.isArray(response?.data) ? response.data
        : Array.isArray(response?.attendances) ? response.attendances
        : Array.isArray(response) ? response : [];
      setRecords(list);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Attendance records load nahi ho paaye.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [employeeId, month, year]);

  const employee = records.find((r) => r?.employee && typeof r.employee === "object")?.employee;
  const stats = useMemo(() => {
    const count = (status) => records.filter((r) => norm(r.status) === norm(status)).length;
    const totalHours = records.reduce((sum, r) => sum + (Number(r.totalHours ?? r.workingHours) || 0), 0);
    const lateMinutes = records.reduce((sum, r) => sum + (Number(r.lateMinutes) || 0), 0);
    return {
      total: records.length,
      present: count("Present"),
      absent: count("Absent"),
      late: count("Late"),
      halfDay: count("Half Day"),
      leave: count("Leave"),
      totalHours: Math.round(totalHours * 100) / 100,
      lateMinutes,
    };
  }, [records]);

  const salarySummary = useMemo(() => {
    const salary = Math.max(0, Number(monthlySalary) || 0);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day += 1) {
      if (new Date(year, month, day).getDay() !== 0) workingDays += 1; // Sunday weekly off
    }

    const absentDays = records.filter((r) => norm(r.status) === "absent").length;
    const halfDays = records.filter((r) => ["half day", "half-day", "halfday"].includes(norm(r.status))).length;
    const leaveDays = records.filter((r) => ["leave", "on leave", "approved leave"].includes(norm(r.status))).length;
    const presentDays = records.filter((r) => ["present", "late"].includes(norm(r.status))).length;
    const dailyRate = workingDays > 0 ? salary / workingDays : 0;
    const absentDeduction = dailyRate * absentDays;
    const halfDayDeduction = dailyRate * 0.5 * halfDays;
    const totalDeduction = Math.min(salary, absentDeduction + halfDayDeduction);
    return {
      salary,
      workingDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      dailyRate,
      absentDeduction,
      halfDayDeduction,
      totalDeduction,
      payable: Math.max(0, salary - totalDeduction),
    };
  }, [monthlySalary, records, month, year]);

  const weekly = useMemo(() => {
    const today = startOfDay(new Date());
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const items = records.filter((r) => {
      const d = startOfDay(new Date(r.attendanceDate || r.date));
      return d >= monday && d <= sunday;
    });
    const hours = items.reduce((sum, r) => sum + (Number(r.totalHours ?? r.workingHours) || 0), 0);
    return { total: items.length, present: items.filter((r) => ["present", "late"].includes(norm(r.status))).length,
      absent: items.filter((r) => norm(r.status) === "absent").length,
      hours: Math.round(hours * 100) / 100 };
  }, [records]);

  const calendarCells = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const byDay = new Map(records.map((r) => [toDateKey(r.attendanceDate || r.date), r]));
    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: days }, (_, i) => {
        const date = new Date(year, month, i + 1);
        return { day: i + 1, record: byDay.get(toDateKey(date)) };
      }),
    ];
  }, [records, month, year]);

  const employeeName = employee?.name || employee?.fullName || employee?.employeeId || "Employee Attendance";
  const statusClass = (status) => norm(status).replace(/\s+/g, "-") || "unknown";

  return (
    <main className="attendance-detail-page">
      <div className="attendance-detail-top">
        <div>
          <Link href="/admin/attendance" className="attendance-back">← Back to Attendance</Link>
          <h1>{employeeName}</h1>
          <p>Complete attendance history, weekly totals and monthly summary.</p>
          {employee?.employeeId && <span className="attendance-employee-id">Employee ID: {employee.employeeId}</span>}
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
      </div>

      <section className="attendance-period-controls">
        <label>Month
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {monthNames.map((name, index) => <option value={index} key={name}>{name}</option>)}
          </select>
        </label>
        <label>Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </section>

      {error && <div className="attendance-detail-error">{error}</div>}
      <section className="attendance-detail-stats">
        {[
          ["Monthly Records", stats.total], ["Present", stats.present], ["Absent", stats.absent],
          ["Late", stats.late], ["Half Day", stats.halfDay], ["On Leave", stats.leave],
          ["Working Hours", `${stats.totalHours} hrs`], ["Late Minutes", stats.lateMinutes],
        ].map(([label, value]) => <article key={label} className="attendance-stat-card"><span>{label}</span><strong>{value}</strong></article>)}
      </section>

      <section className="attendance-salary-card">
        <div className="attendance-salary-heading">
          <div>
            <h2>Monthly Salary Calculator</h2>
            <p>{monthNames[month]} {year} · Attendance records ke according estimated salary</p>
          </div>
          <label className="attendance-salary-input">
            Monthly Salary (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              placeholder="e.g. 15000"
              aria-label="Monthly salary in rupees"
            />
          </label>
        </div>
        <div className="attendance-salary-grid">
          <article><span>Working Days (Sunday off)</span><strong>{salarySummary.workingDays}</strong></article>
          <article><span>Present / Late</span><strong>{salarySummary.presentDays}</strong></article>
          <article><span>Absent Days</span><strong>{salarySummary.absentDays}</strong></article>
          <article><span>Half Days</span><strong>{salarySummary.halfDays}</strong></article>
          <article><span>Daily Salary Rate</span><strong>{salarySummary.dailyRate.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</strong></article>
          <article><span>Absent Deduction</span><strong className="salary-deduction">{salarySummary.absentDeduction.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</strong></article>
          <article><span>Half-day Deduction</span><strong className="salary-deduction">{salarySummary.halfDayDeduction.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</strong></article>
          <article><span>Total Deduction</span><strong className="salary-deduction">{salarySummary.totalDeduction.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</strong></article>
        </div>
        <div className="attendance-salary-payable">
          <div><span>Estimated Payable Salary</span><small>Approved leave aur unmarked dates ko absent nahi maana gaya.</small></div>
          <strong>{salarySummary.payable.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })}</strong>
        </div>
        <p className="attendance-salary-note">Rule: Daily rate = monthly salary ÷ selected month ke working days (Sunday excluded). Absent par 1 din aur Half Day par 0.5 din ki deduction. Late ko full paid day maana hai. Ye estimate hai; salary abhi database mein save nahi hoti.</p>
      </section>

      <section className="attendance-weekly-card">
        <div><h2>Current Week</h2><p>Monday to Sunday</p></div>
        <div className="attendance-weekly-values">
          <span><strong>{weekly.total}</strong> recorded days</span>
          <span><strong>{weekly.present}</strong> present/late</span>
          <span><strong>{weekly.absent}</strong> absent</span>
          <span><strong>{weekly.hours}</strong> working hours</span>
        </div>
      </section>

      <section className="attendance-calendar-card">
        <h2>{monthNames[month]} {year} Calendar</h2>
        <div className="attendance-calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div className="attendance-calendar-weekday" key={d}>{d}</div>)}
          {calendarCells.map((cell, i) => cell ? (
            <div key={cell.day} className={`attendance-calendar-day ${cell.record ? `has-record status-${statusClass(cell.record.status)}` : ""}`}>
              <strong>{cell.day}</strong>
              {cell.record && <span>{cell.record.status || "Recorded"}</span>}
              {cell.record && <small>{cell.record.totalHours ?? 0}h</small>}
            </div>
          ) : <div key={`blank-${i}`} className="attendance-calendar-day empty" />)}
        </div>
      </section>

      <section className="attendance-detail-table-card">
        <div className="attendance-section-heading"><h2>Date-wise Attendance</h2><span>{records.length} records</span></div>
        {loading ? <div className="attendance-detail-loader"><Loader /></div> : records.length === 0 ? (
          <div className="attendance-detail-empty">Selected month ke liye attendance records nahi mile.</div>
        ) : (
          <div className="attendance-detail-table-scroll"><table>
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Working Hours</th><th>Late Minutes</th><th>Status</th><th>Notes</th></tr></thead>
            <tbody>{[...records].sort((a, b) => new Date(b.attendanceDate || b.date) - new Date(a.attendanceDate || a.date)).map((r, i) => (
              <tr key={r._id || `${r.attendanceDate}-${i}`}>
                <td>{formatDate(r.attendanceDate || r.date)}</td><td>{formatTime(r.checkIn || r.checkInTime)}</td>
                <td>{formatTime(r.checkOut || r.checkOutTime)}</td><td>{Number(r.totalHours ?? r.workingHours ?? 0).toFixed(2)} hrs</td>
                <td>{r.lateMinutes ?? 0}</td><td><Badge variant={statusClass(r.status)}>{r.status || "Unknown"}</Badge></td><td>{r.remarks || r.notes || "—"}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
