"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiSun,
} from "react-icons/fi";

import { useAuth } from "@/hooks/useAuth";

import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const result = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const user = result?.user;

      const role =
        user?.role?.name ||
        user?.role ||
        result?.data?.user?.role?.name ||
        result?.data?.user?.role ||
        "";

      const normalizedRole = String(role).trim().toLowerCase();

      if (normalizedRole === "admin") {
        router.push("/admin/dashboard");
      } else if (normalizedRole === "manager") {
        router.push("/manager/dashboard");
      } else if (normalizedRole === "hr") {
        router.push("/hr/dashboard");
      } else if (normalizedRole === "employee") {
        router.push("/employee/dashboard");
      } else {
        setErrorMessage(
          `Login successful, but user role "${role}" is not configured.`
        );
      }
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        error?.message ||
        "Unable to login. Please check your email and password.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background login-background-one" />
      <div className="login-background login-background-two" />

      <section className="login-layout">
        {/* Brand Panel */}
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

            <span>
              © {new Date().getFullYear()} GUJRAT SOLAR ENERGY
            </span>
          </div>
        </div>

        {/* Login Panel */}
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
              <span className="login-eyebrow">
                WELCOME BACK
              </span>

              <h2>Sign in to your account</h2>

              <p>
                Enter your credentials to access your workspace.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#fff1f2",
                  color: "#be123c",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email */}
              <div className="field-group">
                <label htmlFor="email">
                  Email Address
                </label>

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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <div className="password-label">
                  <label htmlFor="password">
                    Password
                  </label>

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
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="remember-row">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <span className="custom-checkbox" />

                <span>Remember me</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Signing in..."
                  : "Sign In"}

                {!isSubmitting && (
                  <FiArrowRight size={18} />
                )}
              </button>
            </form>

            {/* Security Message */}
            <div className="security-message">
              <div className="security-icon">
                <FiLock size={13} />
              </div>

              <div>
                <strong>Secure Login</strong>

                <span>
                  Your account access is protected by
                  role-based permissions.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ number, title, text }) {
  return (
    <div className="feature-item">
      <div className="feature-number">
        {number}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}