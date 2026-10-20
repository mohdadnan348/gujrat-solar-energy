"use client";

import React, { useCallback, useEffect, useState } from "react";
import notificationService from "@/services/notification.service";
import NotificationItem from "./NotificationItem";
import useNotification from "@/hooks/useNotification";
import "./NotificationInbox.css";

export default function NotificationInbox({ roleLabel = "Employee" }) {
  const { markAsRead, markAllAsRead, removeNotification, refreshNotifications } = useNotification();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const params = { page, limit: 20 };
      if (filter === "unread") params.isRead = false;
      if (filter === "read") params.isRead = true;
      if (search.trim()) params.search = search.trim();
      const response = await notificationService.getNotifications(params);
      setItems(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || { page, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || "Notifications load nahi ho paayi.");
      setItems([]);
    } finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(1); }, [load]);

  const handleMarkRead = async (notification) => {
    const id = notification?._id || notification?.id;
    if (!id || notification.isRead) return;
    try {
      await markAsRead(id);
      setItems((current) => current.map((item) => (item._id || item.id) === id ? { ...item, isRead: true } : item));
    } catch (err) { setError(err?.response?.data?.message || "Read status update nahi hua."); }
  };

  const handleMarkAll = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      await markAllAsRead();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      setNotice("Saari notifications read mark ho gayi hain.");
    } catch (err) { setError(err?.response?.data?.message || "Notifications update nahi hui."); }
    finally { setBusy(false); }
  };

  const handleDelete = async (notification) => {
    const id = notification?._id || notification?.id;
    if (!id) return;
    setBusy(true); setError("");
    try {
      await removeNotification(id);
      setItems((current) => current.filter((item) => (item._id || item.id) !== id));
      setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
    } catch (err) { setError(err?.response?.data?.message || "Notification delete nahi hui."); }
    finally { setBusy(false); }
  };

  const handleClearRead = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      await notificationService.deleteReadNotifications();
      await load(1);
      await refreshNotifications();
      setNotice("Read notifications clear kar di gayi hain.");
    } catch (err) { setError(err?.response?.data?.message || "Read notifications clear nahi hui."); }
    finally { setBusy(false); }
  };

  return (
    <main className="notification-inbox-page">
      <header className="notification-inbox-header">
        <div>
          <p className="notification-inbox-eyebrow">GUJRAT SOLAR ENERGY · {String(roleLabel).toUpperCase()}</p>
          <h1>Notifications</h1>
          <p>Announcements, system updates aur important activity ek jagah.</p>
        </div>
        <button type="button" className="ni-refresh" onClick={() => { load(1); refreshNotifications(); }} disabled={loading}>↻ Refresh</button>
      </header>

      <section className="ni-toolbar">
        <div className="ni-tabs" role="group" aria-label="Filter notifications">
          {[["all", "All"], ["unread", "Unread"], ["read", "Read"]].map(([value, label]) => (
            <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications…" aria-label="Search notifications" />
        <div className="ni-toolbar-actions">
          <button type="button" onClick={handleMarkAll} disabled={busy || loading}>Mark all read</button>
          <button type="button" onClick={handleClearRead} disabled={busy || loading}>Clear read</button>
        </div>
      </section>

      {error && <div className="ni-alert ni-alert-error" role="alert">{error}</div>}
      {notice && <div className="ni-alert ni-alert-success" role="status">{notice}</div>}

      <section className="ni-list-card">
        <div className="ni-list-heading"><div><h2>Your inbox</h2><p>{pagination.total || 0} notifications</p></div><span>{loading ? "Loading…" : `${items.length} shown`}</span></div>
        {loading ? <div className="ni-empty"><span className="ni-spinner" />Loading notifications…</div>
          : items.length === 0 ? <div className="ni-empty"><span className="ni-empty-icon">♧</span><strong>No notifications found</strong><p>Try another filter or check back when there are new updates.</p></div>
          : <div className="ni-items">{items.map((item) => <NotificationItem key={item._id || item.id} notification={item} onMarkAsRead={handleMarkRead} onRemove={handleDelete} />)}</div>}
        <footer className="ni-pagination">
          <span>Page {pagination.page || 1} of {Math.max(1, pagination.totalPages || 1)}</span>
          <div>
            <button type="button" disabled={loading || (pagination.page || 1) <= 1} onClick={() => load((pagination.page || 1) - 1)}>Previous</button>
            <button type="button" disabled={loading || (pagination.page || 1) >= (pagination.totalPages || 1)} onClick={() => load((pagination.page || 1) + 1)}>Next</button>
          </div>
        </footer>
      </section>
    </main>
  );
}
