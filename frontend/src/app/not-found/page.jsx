import Link from "next/link";
import {
  FiArrowLeft,
  FiHome,
  FiSearch,
} from "react-icons/fi";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="background-circle circle-one" />
      <div className="background-circle circle-two" />

      <section className="not-found-card">
        <div className="error-number">
          <span>4</span>
          <div className="solar-icon">
            <span />
          </div>
          <span>4</span>
        </div>

        <div className="status-badge">
          <FiSearch size={13} />
          PAGE NOT FOUND
        </div>

        <h1>This page doesn&apos;t exist</h1>

        <p>
          The page you are looking for may have been moved, deleted, or
          the address may be incorrect.
        </p>

        <div className="actions">
          <Link href="/" className="home-button">
            <FiHome size={17} />
            Back to Dashboard
          </Link>

          <button
            type="button"
            className="back-button"
            onClick={() => window.history.back()}
          >
            <FiArrowLeft size={17} />
            Go Back
          </button>
        </div>

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

      <style jsx>{`
        .not-found-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at 50% 35%,
              rgba(34, 197, 94, 0.08),
              transparent 32%
            ),
            #f8fafc;
        }

        .background-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .circle-one {
          width: 360px;
          height: 360px;
          top: -220px;
          right: -120px;
          background: rgba(34, 197, 94, 0.07);
          filter: blur(2px);
        }

        .circle-two {
          width: 300px;
          height: 300px;
          bottom: -190px;
          left: -120px;
          background: rgba(22, 163, 74, 0.05);
        }

        .not-found-card {
          position: relative;
          z-index: 1;
          width: min(100%, 520px);
          padding: 48px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 25px 65px rgba(15, 23, 42, 0.09);
          text-align: center;
        }

        .error-number {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #0f172a;
          font-size: 72px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.06em;
        }

        .solar-icon {
          position: relative;
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dcfce7;
          box-shadow:
            0 0 0 8px #f0fdf4,
            0 10px 30px rgba(22, 163, 74, 0.12);
        }

        .solar-icon span {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #16a34a;
        }

        .solar-icon::before,
        .solar-icon::after {
          content: "";
          position: absolute;
          inset: 9px;
          border: 2px dashed rgba(22, 163, 74, 0.45);
          border-radius: 50%;
        }

        .solar-icon::after {
          inset: 17px;
          border-style: solid;
          border-color: rgba(255, 255, 255, 0.8);
        }

        .status-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 28px;
          padding: 7px 11px;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          background: #f0fdf4;
          color: #15803d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .not-found-card h1 {
          margin-top: 13px;
          color: #0f172a;
          font-size: clamp(26px, 5vw, 34px);
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .not-found-card > p {
          max-width: 400px;
          margin: 12px auto 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.75;
        }

        .actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
        }

        .home-button,
        .back-button {
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

        .home-button {
          background: #16a34a;
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(22, 163, 74, 0.18);
        }

        .home-button:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        .back-button {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
        }

        .back-button:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 38px;
          text-align: left;
        }

        .brand-mark {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #dcfce7;
        }

        .brand-sun {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
        }

        .brand strong,
        .brand span {
          display: block;
        }

        .brand strong {
          color: #334155;
          font-size: 10px;
          letter-spacing: 0.02em;
        }

        .brand span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        @media (max-width: 480px) {
          .not-found-card {
            padding: 38px 22px;
          }

          .error-number {
            font-size: 58px;
          }

          .solar-icon {
            width: 55px;
            height: 55px;
          }

          .solar-icon span {
            width: 26px;
            height: 26px;
          }

          .actions {
            flex-direction: column;
          }

          .home-button,
          .back-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-button,
          .back-button {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}