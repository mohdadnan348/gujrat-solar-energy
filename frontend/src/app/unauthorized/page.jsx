import Link from "next/link";
import {
  FiArrowLeft,
  FiHome,
  FiLock,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

export const metadata = {
  title: "Unauthorized",
  description: "You do not have permission to access this page.",
};

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
          ACCESS RESTRICTED
        </div>

        <h1>Access Denied</h1>

        <p>
          You don&apos;t have permission to access this page. Please contact
          your administrator if you believe you should have access.
        </p>

        <div className="actions">
          <Link href="/" className="primary-button">
            <FiHome size={17} />
            Go to Dashboard
          </Link>

          <button
            type="button"
            className="secondary-button"
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

      <style jsx>{`
        .unauthorized-page {
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
              transparent 34%
            ),
            #f8fafc;
        }

        .background-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .glow-one {
          width: 350px;
          height: 350px;
          top: -210px;
          right: -120px;
          background: rgba(34, 197, 94, 0.06);
          filter: blur(10px);
        }

        .glow-two {
          width: 300px;
          height: 300px;
          bottom: -190px;
          left: -110px;
          background: rgba(22, 163, 74, 0.05);
          filter: blur(10px);
        }

        .unauthorized-card {
          position: relative;
          z-index: 1;
          width: min(100%, 510px);
          padding: 44px 38px 34px;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 25px 65px rgba(15, 23, 42, 0.09);
          text-align: center;
        }

        .lock-wrapper {
          position: relative;
          width: 70px;
          height: 70px;
          margin: 0 auto 24px;
          display: grid;
          place-items: center;
        }

        .lock-icon {
          position: relative;
          z-index: 2;
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #dcfce7;
          color: #15803d;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.12);
        }

        .lock-ring {
          position: absolute;
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 50%;
        }

        .ring-one {
          inset: 2px;
        }

        .ring-two {
          inset: -5px;
          border-color: rgba(34, 197, 94, 0.1);
        }

        .security-badge {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          background: #f0fdf4;
          color: #15803d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .unauthorized-card h1 {
          margin-top: 13px;
          color: #0f172a;
          font-size: clamp(28px, 5vw, 35px);
          line-height: 1.2;
          letter-spacing: -0.035em;
        }

        .unauthorized-card > p {
          max-width: 410px;
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

        .primary-button,
        .secondary-button {
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
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .primary-button {
          background: #16a34a;
          color: #ffffff;
          box-shadow: 0 7px 18px rgba(22, 163, 74, 0.18);
        }

        .primary-button:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        .secondary-button {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
        }

        .secondary-button:hover {
          background: #f8fafc;
          transform: translateY(-1px);
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 25px;
          color: #64748b;
          font-size: 11px;
        }

        .security-note svg {
          color: #16a34a;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 31px;
          text-align: left;
        }

        .brand-logo {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #dcfce7;
        }

        .brand-logo span {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
        }

        .brand-text strong,
        .brand-text small {
          display: block;
        }

        .brand-text strong {
          color: #334155;
          font-size: 10px;
          letter-spacing: 0.02em;
        }

        .brand-text small {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .logout-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 21px;
          color: #94a3b8;
          font-size: 10px;
        }

        @media (max-width: 480px) {
          .unauthorized-card {
            padding: 38px 22px 30px;
          }

          .actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }

          .logout-hint {
            line-height: 1.5;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .primary-button,
          .secondary-button {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}