"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiHome,
  FiSearch,
} from "react-icons/fi";

import "./not-found.css";

export default function NotFoundPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <main className="not-found-page">
      <div className="background-circle circle-one" />
      <div className="background-circle circle-two" />

      <section className="not-found-card">
        {/* Error Number */}
        <div className="error-number">
          <span>4</span>

          <div className="solar-icon">
            <span />
          </div>

          <span>4</span>
        </div>

        {/* Status */}
        <div className="status-badge">
          <FiSearch size={13} />
          PAGE NOT FOUND
        </div>

        {/* Content */}
        <h1>This page doesn&apos;t exist</h1>

        <p>
          The page you are looking for may have been moved, deleted, or
          the address may be incorrect.
        </p>

        {/* Actions */}
        <div className="actions">
          <Link href="/" className="home-button">
            <FiHome size={17} />
            Back to Dashboard
          </Link>

          <button
            type="button"
            className="back-button"
            onClick={handleGoBack}
          >
            <FiArrowLeft size={17} />
            Go Back
          </button>
        </div>

        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-sun" />
          </div>

          <div>
            <strong>GUJRAT SOLAR ENERGY</strong>
            <span>Solar Company Management System</span>
          </div>
        </div>
      </section>
    </main>
  );
}