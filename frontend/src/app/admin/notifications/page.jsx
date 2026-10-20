"use client";

import React, { useCallback, useEffect, useState } from "react";
import notificationService from "@/services/notification.service";
import "./notifications.css";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const response = await notificationService.getSentHistory({ page: 1, limit: 100 });
      setHistory(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Sent notification history load nahi hui.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSend = async (event) => {
    event.preventDefault();
    setError(""); setSuccess("");
    if (!title.trim() || !message.trim()) {
      setError("Title aur message dono bharna zaroori hai.");
      return;
    }
    try {
      setSending(true);
      const response = await notificationService.sendBroadcast({ title: title.trim(), message: message.trim(), audience });
      const sent = response?.data;
      setSuccess(`Notification successfully sent. ${sent?.recipientCount ?? 0} active recipients ko bheja gaya.`);
      setTitle(""); setMessage("");
      await loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Notification send nahi hui.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="admin-notification-page">
      <header className="admin-notification-header">
        <div><p className="admin-notification-eyebrow">SOLAR CRM · ADMIN</p><h1>Notifications</h1><p>Employees ko announcement bhejo aur sent history yahin dekho.</p></div>
        <button type="button" className="an-button an-button--secondary" onClick={loadHistory}>Refresh history</button>
      </header>

      {error && <div className="an-alert an-alert--error" role="alert">{error}</div>}
      {success && <div className="an-alert an-alert--success" role="status">{success}</div>}

      <section className="an-panel">
        <div className="an-panel-heading"><div><h2>Send a notification</h2><p>Message save hoga aur selected active users ke notification inbox mein show hoga.</p></div><span className="an-live-badge">In-app notification</span></div>
        <form className="an-form" onSubmit={handleSend}>
          <label>Send to
            <select value={audience} onChange={(event) => setAudience(event.target.value)}>
              <option value="ALL">All active employees</option>
                </select>
          </label>
          <label>Notification title
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="e.g. Important team announcement" required />
            <small>{title.length}/160 characters</small>
          </label>
          <label>Message
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={5000} rows={5} placeholder="Write the full notification message…" required />
            <small>{message.length}/5000 characters</small>
          </label>
          <div className="an-form-footer"><span>Sent date and time automatically record hoga.</span><button className="an-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send notification"}</button></div>
        </form>
      </section>

      <section className="an-panel an-history-panel">
        <div className="an-panel-heading"><div><h2>Messages you sent</h2><p>Har message ki sent date/time, recipient count aur read count yahan dikhte hain.</p></div><span className="an-history-total">{history.length} messages</span></div>
        {loadingHistory ? <div className="an-empty">Loading sent history…</div> : history.length === 0 ? <div className="an-empty"><strong>Abhi tak koi broadcast nahi bheja</strong><span>Jab aap notification send karoge, uska record yahan aa jayega.</span></div> : (
          <div className="an-history-list">
            {history.map((item) => (
              <article className="an-history-card" key={item._id || item.broadcastId}>
                <div className="an-history-card__top"><div><h3>{item.title}</h3><p className="an-sent-date">Sent on {formatDate(item.sentAt)}</p></div><span className="an-sent-badge">Sent</span></div>
                <p className="an-history-message">{item.message}</p>
                <div className="an-history-stats"><span><strong>{item.recipientCount || 0}</strong> recipients</span><span><strong>{item.readCount || 0}</strong> read</span><span><strong>{Math.max(0, (item.recipientCount || 0) - (item.readCount || 0))}</strong> unread</span><span>Audience: All active employees</span></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
