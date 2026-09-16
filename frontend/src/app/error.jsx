"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiHome, FiRefreshCw } from "react-icons/fi";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-card">
        <div className="error-icon">
          <FiAlertTriangle size={30} />
        </div>

        <span className="error-label">SOMETHING WENT WRONG</span>

        <h1>We couldn&apos;t load this page</h1>

        <p>
          An unexpected error occurred while processing your request.
          Please try again. If the problem continues, contact your
          administrator.
        </p>

        <div className="error-actions">
          <button
            type="button"
            onClick={() => reset()}
            className="retry-btn"
          >
            <FiRefreshCw size={17} />
            Try Again
          </button>

          <Link href="/" className="home-btn">
            <FiHome size={17} />
            Go Home
          </Link>
        </div>

        <div className="error-brand">
          <span className="brand-dot" />
          GUJRAT SOLAR ENERGY
        </div>
      </div>

      <style>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(34, 197, 94, 0.08),
              transparent 30%
            ),
            #f8fafc;
        }

        .error-card {
          width: min(100%, 500px);
          padding: 44px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.09);
          text-align: center;
        }

        .error-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin: 0 auto 22px;
          border-radius: 16px;
          background: #fef2f2;
          color: #dc2626;
        }

        .error-label {
          color: #16a34a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .error-card h1 {
          margin-top: 10px;
          color: #0f172a;
          font-size: clamp(25px, 5vw, 32px);
          line-height: 1.2;
          letter-spacing: -0.025em;
        }

        .error-card p {
          max-width: 410px;
          margin: 13px auto 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .error-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
        }

        .retry-btn,
        .home-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .retry-btn {
          border: none;
          background: #16a34a;
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(22, 163, 74, 0.18);
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        .home-btn {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
        }

        .home-btn:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .error-brand {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 34px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .brand-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        @media (max-width: 480px) {
          .error-card {
            padding: 36px 22px;
          }

          .error-actions {
            flex-direction: column;
          }

          .retry-btn,
          .home-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}