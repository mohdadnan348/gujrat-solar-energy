"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiHome,
  FiLock,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

import "./unauthorized.css";

export default function UnauthorizedPage() {
  return (
    <main className="unauthorized-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section className="unauthorized-card">
        <div className="lock-wrapper">
          <div className="lock-icon">
            <FiLock size={29} />
          </div>

          <span className="lock-ring ring-one" />
          <span className="lock-ring ring-two" />
        </div>

        <div className="security-badge">
          <FiShield size={13} />
          <span>ACCESS RESTRICTED</span>
        </div>

        <h1>Access Denied</h1>

        <p>
          You don&apos;t have permission to access this page. Please contact
          your administrator if you believe you should have access.
        </p>

        <div className="unauthorized-actions">
          <Link href="/" className="unauthorized-primary">
            <FiHome size={17} />
            Go to Dashboard
          </Link>

          <button
            type="button"
            className="unauthorized-secondary"
            onClick={() => window.history.back()}
          >
            <FiArrowLeft size={17} />
            Go Back
          </button>
        </div>

        <div className="security-note">
          <FiShield size={14} />
          <span>Your account permissions are securely enforced.</span>
        </div>

        <div className="brand">
          <div className="brand-logo">
            <span />
          </div>

          <div className="brand-text">
            <strong>GUJRAT SOLAR ENERGY</strong>
            <small>Solar Company Management System</small>
          </div>
        </div>

        <div className="logout-hint">
          <FiLogOut size={12} />
          <span>Need different access? Contact your administrator.</span>
        </div>
      </section>
    </main>
  );
}