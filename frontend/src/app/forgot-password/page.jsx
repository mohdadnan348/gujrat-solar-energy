"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiShield,
  FiSun,
} from "react-icons/fi";
import "./forgot-password.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    setLoading(true);

    // Authentication API will be connected in the API/Auth integration phase.
    console.log("Forgot password request:", {
      email: email.trim(),
    });

    await new Promise((resolve) => setTimeout(resolve, 700));

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="forgot-password-page">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <section className="forgot-password-card">
        {/* Brand */}
        <div className="brand-header">
          <div className="brand-logo">
            <FiSun size={22} />
          </div>

          <div>
            <strong>GUJRAT SOLAR ENERGY</strong>
            <span>Solar Company Management System</span>
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Icon */}
            <div className="page-icon">
              <FiLock size={25} />
            </div>

            {/* Heading */}
            <div className="forgot-heading">
              <span className="eyebrow">ACCOUNT RECOVERY</span>

              <h1>Forgot your password?</h1>

              <p>
                Enter your registered email address and we will send you
                instructions to reset your password.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="forgot-password-form"
            >
              <div className="field-group">
                <label htmlFor="email">Email Address</label>

                <div className="input-wrapper">
                  <FiMail size={17} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Instructions
                    <FiArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security */}
            <div className="security-message">
              <div className="security-icon">
                <FiShield size={14} />
              </div>

              <div>
                <strong>Secure Account Recovery</strong>

                <span>
                  For your security, password reset instructions are sent
                  only to registered email addresses.
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="success-state">
            <div className="success-icon">
              <FiCheckCircle size={34} />
            </div>

            <span className="eyebrow">REQUEST RECEIVED</span>

            <h1>Check your email</h1>

            <p>
              If an account exists for{" "}
              <strong>{email}</strong>, password reset
              instructions have been sent to that address.
            </p>

            <div className="success-note">
              <FiMail size={16} />

              <span>
                Please check your inbox and spam folder for the
                password reset email.
              </span>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
            >
              Try another email
            </button>
          </div>
        )}

        {/* Back to Login */}
        <Link href="/login" className="back-login">
          <FiArrowLeft size={16} />
          Back to Sign In
        </Link>

        {/* Footer */}
        <div className="page-footer">
          <span>
            <FiLock size={11} />
            Secure internal business platform
          </span>

          <span>
            © {new Date().getFullYear()} GUJRAT SOLAR ENERGY
          </span>
        </div>
      </section>

      
    </main>
  );
}