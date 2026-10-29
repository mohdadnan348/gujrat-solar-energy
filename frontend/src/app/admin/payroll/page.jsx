"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Select from "@/components/common/Select";
import "./payroll.css";

const currentDate = new Date();
const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value) || 0);
const getRows = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.payroll)) return data.payroll;
  if (Array.isArray(response?.payroll)) return response.payroll;
  return [];
};

export default function AdminPayrollPage() {
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadPayroll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/payroll/monthly", { params: { month, year } });
      setRows(getRows(response));
      setLoaded(true);
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.message || err?.message || "Payroll data load nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { loadPayroll(); }, [loadPayroll]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => `${row.employee?.name || ""} ${row.employee?.employeeId || ""} ${row.employee?.email || ""}`.toLowerCase().includes(term));
  }, [rows, search]);

  const totals = useMemo(() => filteredRows.reduce((acc, row) => {
    acc.salary += Number(row.monthlySalary) || 0;
    acc.deduction += Number(row.totalDeduction) || 0;
    acc.payable += Number(row.payableSalary) || 0;
    acc.absent += Number(row.absentDays) || 0;
    return acc;
  }, { salary: 0, deduction: 0, payable: 0, absent: 0 }), [filteredRows]);

  const exportCsv = () => {
    const headers = ["Employee ID", "Employee Name", "Month", "Year", "Monthly Salary", "Working Days", "Present", "Late", "Half Days", "Absent", "Unmarked", "Daily Rate", "Absent Deduction", "Half Day Deduction", "Total Deduction", "Payable Salary"];
    const values = filteredRows.map((r) => [r.employee?.employeeId, r.employee?.name, r.month, r.year, r.monthlySalary, r.workingDaysInMonth, r.presentDays, r.lateDays, r.halfDays, r.absentDays, r.unmarkedDays, r.dailyRate, r.absentDeduction, r.halfDayDeduction, r.totalDeduction, r.payableSalary]);
    const csv = [headers, ...values].map((line) => line.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payroll-${year}-${String(month).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="payroll-page">
      <header className="payroll-header">
        <div><span className="payroll-eyebrow">PEOPLE & FINANCE</span><h1>Salary / Payroll</h1><p>Attendance ke basis par monthly salary aur deductions ka breakdown.</p></div>
        <div className="payroll-header-actions"><Button onClick={exportCsv} disabled={!filteredRows.length}>Export CSV</Button><Button onClick={loadPayroll} disabled={loading}>Refresh</Button></div>
      </header>

      <section className="payroll-filters">
        <div className="payroll-filter"><label htmlFor="payroll-month">Month</label><Select id="payroll-month" value={month} onChange={setMonth} options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }) }))} /></div>
        <div className="payroll-filter"><label htmlFor="payroll-year">Year</label><Select id="payroll-year" value={year} onChange={setYear} options={Array.from({ length: 7 }, (_, i) => { const y = currentDate.getFullYear() - 3 + i; return { value: String(y), label: String(y) }; })} /></div>
        <div className="payroll-filter payroll-search"><label htmlFor="payroll-search">Search employee</label><input id="payroll-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, employee ID or email" /></div>
      </section>

      {error && <div className="payroll-error" role="alert"><strong>Payroll load error</strong><span>{error}</span><p>Backend mein GET /api/v1/payroll/monthly route aur Admin/HR permission enabled honi chahiye.</p></div>}

      <section className="payroll-summary-grid">
        <article className="payroll-summary-card"><span>Employees</span><strong>{filteredRows.length}</strong><small>Selected period</small></article>
        <article className="payroll-summary-card"><span>Gross monthly salary</span><strong>{money(totals.salary)}</strong><small>Configured employee salaries</small></article>
        <article className="payroll-summary-card deduction"><span>Total deductions</span><strong>{money(totals.deduction)}</strong><small>{totals.absent} absent days in filtered records</small></article>
        <article className="payroll-summary-card payable"><span>Net payable</span><strong>{money(totals.payable)}</strong><small>After attendance deductions</small></article>
      </section>

      <section className="payroll-table-card">
        <div className="payroll-table-heading"><div><h2>Monthly salary register</h2><p>{new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" })}</p></div><span className="payroll-record-count">{filteredRows.length} employees</span></div>
        {loading ? <div className="payroll-loading"><Loader /></div> : !filteredRows.length ? <div className="payroll-empty"><div className="payroll-empty-icon">₹</div><h3>{loaded ? "No payroll records found" : "Payroll load karein"}</h3><p>{error ? "API/permission fix karne ke baad Refresh karein." : "Employee salary configured ho aur selected month ke liye employee active ho to records yahan dikhenge."}</p></div> : (
          <div className="payroll-table-wrap"><table className="payroll-table"><thead><tr><th>Employee</th><th>Monthly salary</th><th>Working days (month)</th><th>Elapsed days</th><th>Present</th><th>Late</th><th>Half day</th><th>Absent</th><th>Unmarked</th><th>Absent deduction</th><th>Half-day deduction</th><th>Total deduction</th><th>Payable salary</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.employee?._id || row.employee?.employeeId}><td><strong>{row.employee?.name || "Unnamed employee"}</strong><small>{row.employee?.employeeId || row.employee?.email || "—"}</small></td><td>{money(row.monthlySalary)}</td><td>{row.workingDaysInMonth ?? 0}</td><td>{row.elapsedWorkingDays ?? 0}</td><td><span className="payroll-pill good">{row.presentDays ?? 0}</span></td><td>{row.lateDays ?? 0}</td><td><span className="payroll-pill warn">{row.halfDays ?? 0}</span></td><td><span className="payroll-pill bad">{row.absentDays ?? 0}</span></td><td>{row.unmarkedDays ?? 0}</td><td>{money(row.absentDeduction)}</td><td>{money(row.halfDayDeduction)}</td><td className="payroll-deduction">{money(row.totalDeduction)}</td><td className="payroll-payable">{money(row.payableSalary)}</td></tr>)}</tbody></table></div>
        )}
        <div className="payroll-note"><strong>Calculation rules:</strong> Sunday weekly-off hai. Daily rate poore selected month ke scheduled working days (Sunday exclude) par calculate hota hai; elapsed days alag dikhte hain. Late = full paid day, Half Day = 0.5 day deduction, aur sirf explicitly marked Absent = full-day deduction. Approved leave aur missing attendance records deduct nahi hote; missing records Unmarked mein dikhte hain.</div>
      </section>
    </main>
  );
}
