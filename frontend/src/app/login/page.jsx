"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiSun } from "react-icons/fi";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Authentication API will be connected in the API/Auth integration phase.
    console.log("Login form submitted:", {
      email: form.email,
      rememberMe: form.rememberMe,
    });
  };

  return (
    <main className="login-page">
      <div className="login-background login-background-one" />
      <div className="login-background login-background-two" />

      <section className="login-layout">
        <div className="login-brand-panel">
          <div className="brand-header">
            <div className="brand-logo">
              <FiSun size={24} />
            </div>

            <div>
              <strong>GUJRAT SOLAR ENERGY</strong>
              <span>Solar Company Management System</span>
            </div>
          </div>

          <div className="brand-content">
            <span className="welcome-badge">
              <span />
              BUSINESS MANAGEMENT PLATFORM
            </span>

            <h1>
              Power your solar
              <strong> business with clarity.</strong>
            </h1>

            <p>
              Manage leads, solar projects, quotations, customers, invoices,
              tasks and your complete team from one secure platform.
            </p>

            <div className="brand-features">
              <Feature
                number="01"
                title="Complete Business Workflow"
                text="From lead generation to project operations."
              />

              <Feature
                number="02"
                title="Role-Based Access"
                text="Dedicated workspace for every team role."
              />

              <Feature
                number="03"
                title="Business Insights"
                text="Track performance with meaningful reports."
              />
            </div>
          </div>

          <div className="brand-footer">
            <span>Secure internal business platform</span>
            <span>© {new Date().getFullYear()} GUJRAT SOLAR ENERGY</span>
          </div>
        </div>

        <div className="login-panel">
          <div className="mobile-brand">
            <div className="brand-logo">
              <FiSun size={22} />
            </div>

            <div>
              <strong>GUJRAT SOLAR ENERGY</strong>
              <span>Management System</span>
            </div>
          </div>

          <div className="login-card">
            <div className="login-heading">
              <span className="login-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>
                Enter your credentials to access your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="field-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <FiMail size={17} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="password-label">
                  <label htmlFor="password">Password</label>

                  <Link href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="input-wrapper">
                  <FiLock size={17} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <label className="remember-row">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                />

                <span className="custom-checkbox" />

                <span>Remember me</span>
              </label>

              <button type="submit" className="login-button">
                Sign In
                <FiArrowRight size={18} />
              </button>
            </form>

            <div className="security-message">
              <div className="security-icon">
                <FiLock size={13} />
              </div>

              <div>
                <strong>Secure Login</strong>
                <span>
                  Your account access is protected by role-based permissions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .login-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #f8fafc;
        }

        .login-background {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .login-background-one {
          width: 520px;
          height: 520px;
          top: -280px;
          right: -160px;
          background: rgba(34, 197, 94, 0.07);
          filter: blur(8px);
        }

        .login-background-two {
          width: 420px;
          height: 420px;
          bottom: -280px;
          left: -180px;
          background: rgba(22, 163, 74, 0.05);
          filter: blur(8px);
        }

        .login-layout {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(400px, 0.95fr) minmax(450px, 1.05fr);
        }

        .login-brand-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px clamp(40px, 6vw, 90px);
          background:
            linear-gradient(
              145deg,
              rgba(240, 253, 244, 0.98),
              rgba(255, 255, 255, 0.98)
            );
          border-right: 1px solid #e2e8f0;
        }

        .brand-header,
        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-logo {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #16a34a;
          color: white;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.2);
        }

        .brand-header strong,
        .brand-header span {
          display: block;
        }

        .brand-header strong {
          color: #0f172a;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .brand-header span {
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
        }

        .brand-content {
          max-width: 580px;
          margin: auto 0;
          padding: 60px 0;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          color: #15803d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.09em;
        }

        .welcome-badge > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .brand-content h1 {
          margin-top: 22px;
          color: #0f172a;
          font-size: clamp(38px, 4vw, 57px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }

        .brand-content h1 strong {
          display: block;
          color: #16a34a;
          font-weight: 800;
        }

        .brand-content > p {
          max-width: 500px;
          margin-top: 22px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.85;
        }

        .brand-features {
          display: grid;
          gap: 14px;
          margin-top: 36px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .feature-number {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #16a34a;
          font-size: 9px;
          font-weight: 900;
        }

        .feature-item strong,
        .feature-item span {
          display: block;
        }

        .feature-item strong {
          color: #334155;
          font-size: 11px;
        }

        .feature-item span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 10px;
        }

        .brand-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          color: #94a3b8;
          font-size: 9px;
        }

        .login-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 40px;
          background: #ffffff;
        }

        .mobile-brand {
          display: none;
        }

        .login-card {
          width: min(100%, 450px);
        }

        .login-heading {
          margin-bottom: 30px;
        }

        .login-eyebrow {
          color: #16a34a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .login-heading h2 {
          margin-top: 8px;
          color: #0f172a;
          font-size: 31px;
          line-height: 1.2;
          letter-spacing: -0.035em;
        }

        .login-heading p {
          margin-top: 8px;
          color: #64748b;
          font-size: 13px;
        }

        .login-form {
          display: grid;
          gap: 20px;
        }

        .field-group {
          display: grid;
          gap: 8px;
        }

        .field-group label,
        .password-label label {
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .password-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .password-label a {
          color: #16a34a;
          font-size: 11px;
          font-weight: 700;
        }

        .password-label a:hover {
          color: #15803d;
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          min-height: 48px;
          border: 1px solid #dbe3ec;
          border-radius: 10px;
          background: #ffffff;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .input-wrapper > svg {
          margin-left: 15px;
          flex-shrink: 0;
          color: #94a3b8;
        }

        .input-wrapper input {
          width: 100%;
          min-width: 0;
          height: 46px;
          padding: 0 13px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0f172a;
          font-size: 13px;
        }

        .input-wrapper input::placeholder {
          color: #a8b2bf;
        }

        .password-toggle {
          display: grid;
          place-items: center;
          margin-right: 7px;
          padding: 7px;
          border-radius: 7px;
          background: transparent;
          color: #94a3b8;
        }

        .password-toggle:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .remember-row {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          color: #64748b;
          font-size: 11px;
          cursor: pointer;
        }

        .remember-row input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #ffffff;
          transition: 0.2s ease;
        }

        .remember-row input:checked + .custom-checkbox {
          border-color: #16a34a;
          background: #16a34a;
          box-shadow: inset 0 0 0 3px #ffffff;
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 49px;
          border-radius: 10px;
          background: #16a34a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 9px 22px rgba(22, 163, 74, 0.18);
          transition:
            background 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .login-button:hover {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 12px 25px rgba(22, 163, 74, 0.22);
        }

        .security-message {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 26px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
        }

        .security-icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 7px;
          background: #dcfce7;
          color: #16a34a;
        }

        .security-message strong,
        .security-message span {
          display: block;
        }

        .security-message strong {
          color: #334155;
          font-size: 10px;
        }

        .security-message span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.5;
        }

        @media (max-width: 1050px) {
          .login-layout {
            grid-template-columns: 0.8fr 1.2fr;
          }

          .login-brand-panel {
            padding-inline: 40px;
          }
        }

        @media (max-width: 800px) {
          .login-layout {
            display: block;
          }

          .login-brand-panel {
            display: none;
          }

          .login-panel {
            min-height: 100vh;
            align-items: flex-start;
            padding: 28px 20px;
          }

          .mobile-brand {
            display: flex;
            width: 100%;
            max-width: 450px;
            margin: 0 auto 55px;
          }

          .login-card {
            width: min(100%, 450px);
          }
        }

        @media (max-width: 480px) {
          .login-panel {
            padding: 22px 16px 35px;
          }

          .mobile-brand {
            margin-bottom: 45px;
          }

          .login-heading h2 {
            font-size: 27px;
          }

          .login-card {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .input-wrapper,
          .login-button,
          .password-toggle,
          .custom-checkbox {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}

function Feature({ number, title, text }) {
  return (
    <div className="feature-item">
      <div className="feature-number">{number}</div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}