import Link from "next/link";
import {
  FiArrowRight as ArrowRight,
  FiBarChart2 as BarChart3,
  FiFileText as FileText,
  FiGrid as LayoutDashboard,
  FiSun as Sun,
  FiUsers as Users,
  FiZap as Zap,
} from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="home-container">
          <div className="hero-content">
            <div className="brand-mark">
              <Sun size={20} />
              <span>GUJRAT SOLAR ENERGY</span>
            </div>

            <div className="hero-badge">
              <span className="badge-dot" />
              Solar Company Management System
            </div>

            <h1>
              Manage Your Solar Business
              <span> Smarter & Faster.</span>
            </h1>

            <p>
              A centralized platform to manage leads, solar requirements,
              system configurations, quotations, customers, invoices,
              tasks, employees and business operations.
            </p>

            <div className="hero-actions">
              <Link href="/login" className="primary-button">
                Go to Login
                <ArrowRight size={18} />
              </Link>

              <div className="secure-badge">
                <Zap size={16} />
                Secure Business Platform
              </div>
            </div>
          </div>

          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-brand">
                <div className="preview-logo">
                  <Sun size={19} />
                </div>
                <div>
                  <strong>GUJRAT SOLAR ENERGY</strong>
                  <span>Management System</span>
                </div>
              </div>

              <div className="preview-user">
                <div className="user-avatar">A</div>
              </div>
            </div>

            <div className="preview-body">
              <div className="preview-sidebar">
                <div className="sidebar-line active" />
                <div className="sidebar-line" />
                <div className="sidebar-line" />
                <div className="sidebar-line" />
                <div className="sidebar-line" />
              </div>

              <div className="preview-content">
                <div className="preview-title">
                  <div>
                    <span>Welcome back</span>
                    <h3>Business Dashboard</h3>
                  </div>

                  <div className="preview-date">Today</div>
                </div>

                <div className="stat-grid">
                  <PreviewStat
                    icon={<Users />}
                    label="Total Leads"
                    value="248"
                  />
                  <PreviewStat
                    icon={<Sun />}
                    label="Solar Projects"
                    value="126"
                  />
                  <PreviewStat
                    icon={<FileText />}
                    label="Quotations"
                    value="89"
                  />
                  <PreviewStat
                    icon={<BarChart3 />}
                    label="Conversions"
                    value="64%"
                  />
                </div>

                <div className="preview-chart">
                  <div className="chart-heading">
                    <strong>Sales Overview</strong>
                    <span>Monthly</span>
                  </div>

                  <div className="chart-area">
                    <div className="chart-bars">
                      <span style={{ height: "35%" }} />
                      <span style={{ height: "52%" }} />
                      <span style={{ height: "43%" }} />
                      <span style={{ height: "68%" }} />
                      <span style={{ height: "58%" }} />
                      <span style={{ height: "82%" }} />
                      <span style={{ height: "74%" }} />
                      <span style={{ height: "92%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="home-container">
          <div className="section-heading">
            <span>ONE PLATFORM</span>
            <h2>Everything your solar business needs</h2>
            <p>
              Manage your complete business workflow from one professional
              management system.
            </p>
          </div>

          <div className="feature-grid">
            <Feature
              icon={<LayoutDashboard />}
              title="Business Dashboard"
              text="Get a clear overview of your sales, leads and daily operations."
            />

            <Feature
              icon={<Users />}
              title="Lead Management"
              text="Capture, organize and follow up with potential solar customers."
            />

            <Feature
              icon={<Sun />}
              title="Solar Management"
              text="Handle requirements, system configurations and project details."
            />

            <Feature
              icon={<FileText />}
              title="Quotations & Invoices"
              text="Create professional quotations, proposals and invoices."
            />

            <Feature
              icon={<BarChart3 />}
              title="Reports & Analytics"
              text="Track business performance with meaningful reports."
            />

            <Feature
              icon={<Zap />}
              title="Team Operations"
              text="Manage employees, tasks, attendance and day-to-day operations."
            />
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container footer-inner">
          <div>
            <strong>GUJRAT SOLAR ENERGY</strong>
            <span>Solar Company Management System</span>
          </div>

          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>

    <style>{`
        .home-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .home-container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 720px;
          display: flex;
          align-items: center;
          padding: 90px 0;
          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(34, 197, 94, 0.14),
              transparent 28%
            ),
            linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .hero-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .hero-glow-one {
          top: -180px;
          right: -100px;
          background: rgba(34, 197, 94, 0.12);
        }

        .hero-glow-two {
          bottom: -220px;
          left: -150px;
          background: rgba(22, 163, 74, 0.08);
        }

        .hero .home-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 70px;
          align-items: center;
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 22px;
          color: #15803d;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          margin-bottom: 20px;
          border: 1px solid #bbf7d0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.8);
          color: #166534;
          font-size: 12px;
          font-weight: 700;
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

        .hero h1 {
          max-width: 600px;
          margin: 0;
          color: #0f172a;
          font-size: clamp(42px, 5vw, 66px);
          line-height: 1.03;
          letter-spacing: -0.045em;
        }

        .hero h1 span {
          display: block;
          color: #16a34a;
        }

        .hero p {
          max-width: 570px;
          margin: 24px 0 30px;
          color: #475569;
          font-size: 16px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 19px;
          border-radius: 10px;
          background: #16a34a;
          color: white;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.2);
          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        .primary-button:hover {
          background: #15803d;
          transform: translateY(-2px);
        }

        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .secure-badge svg {
          color: #16a34a;
        }

        .dashboard-preview {
          overflow: hidden;
          border: 1px solid #dbe5df;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 30px 70px rgba(15, 23, 42, 0.13);
          transform: perspective(1200px) rotateY(-3deg) rotateX(2deg);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preview-logo {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #dcfce7;
          color: #16a34a;
        }

        .preview-brand strong,
        .preview-brand span {
          display: block;
        }

        .preview-brand strong {
          color: #0f172a;
          font-size: 10px;
        }

        .preview-brand span {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 8px;
        }

        .preview-user {
          padding-left: 12px;
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #16a34a;
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .preview-body {
          display: grid;
          grid-template-columns: 70px 1fr;
          min-height: 385px;
        }

        .preview-sidebar {
          padding: 24px 14px;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .sidebar-line {
          width: 100%;
          height: 8px;
          margin-bottom: 22px;
          border-radius: 5px;
          background: #dbe4df;
        }

        .sidebar-line.active {
          background: #86efac;
        }

        .preview-content {
          padding: 24px;
        }

        .preview-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .preview-title span {
          color: #94a3b8;
          font-size: 9px;
        }

        .preview-title h3 {
          margin-top: 2px;
          color: #0f172a;
          font-size: 18px;
        }

        .preview-date {
          padding: 6px 9px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          color: #64748b;
          font-size: 8px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .preview-stat {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: white;
        }

        .preview-stat-icon {
          width: 25px;
          height: 25px;
          display: grid;
          place-items: center;
          margin-bottom: 9px;
          border-radius: 7px;
          background: #dcfce7;
          color: #16a34a;
        }

        .preview-stat-label {
          display: block;
          color: #94a3b8;
          font-size: 7px;
        }

        .preview-stat-value {
          display: block;
          margin-top: 2px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
        }

        .preview-chart {
          margin-top: 14px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
        }

        .chart-heading {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .chart-heading strong {
          color: #0f172a;
          font-size: 10px;
        }

        .chart-heading span {
          color: #94a3b8;
          font-size: 8px;
        }

        .chart-area {
          height: 120px;
          display: flex;
          align-items: end;
          padding: 10px 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .chart-bars {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 10px;
        }

        .chart-bars span {
          width: 7%;
          min-height: 15px;
          border-radius: 5px 5px 0 0;
          background: linear-gradient(to top, #16a34a, #86efac);
        }

        .features {
          padding: 100px 0;
          background: white;
        }

        .section-heading {
          max-width: 620px;
          margin: 0 auto 50px;
          text-align: center;
        }

        .section-heading > span {
          color: #16a34a;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }

        .section-heading h2 {
          margin-top: 9px;
          color: #0f172a;
          font-size: clamp(28px, 4vw, 40px);
          letter-spacing: -0.03em;
        }

        .section-heading p {
          margin-top: 12px;
          color: #64748b;
          font-size: 14px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .feature-card {
          padding: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: white;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .feature-card:hover {
          border-color: #bbf7d0;
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.07);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 11px;
          background: #dcfce7;
          color: #16a34a;
        }

        .feature-card h3 {
          margin-bottom: 7px;
          color: #0f172a;
          font-size: 15px;
        }

        .feature-card p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .home-footer {
          padding: 25px 0;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          color: #94a3b8;
          font-size: 11px;
        }

        .footer-inner strong,
        .footer-inner span {
          display: block;
        }

        .footer-inner strong {
          color: #334155;
          font-size: 11px;
        }

        .footer-inner span {
          margin-top: 2px;
        }

        @media (max-width: 1000px) {
          .hero .home-container {
            grid-template-columns: 1fr;
            gap: 55px;
          }

          .hero {
            padding: 70px 0;
          }

          .dashboard-preview {
            max-width: 760px;
            width: 100%;
            margin: 0 auto;
            transform: none;
          }
        }

        @media (max-width: 700px) {
          .home-container {
            width: min(100% - 28px, 1180px);
          }

          .hero {
            min-height: auto;
            padding: 55px 0;
          }

          .hero h1 {
            font-size: 42px;
          }

          .hero p {
            font-size: 14px;
          }

          .dashboard-preview {
            border-radius: 13px;
          }

          .preview-body {
            grid-template-columns: 48px 1fr;
          }

          .preview-content {
            padding: 14px;
          }

          .preview-sidebar {
            padding: 18px 10px;
          }

          .stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }

          .features {
            padding: 70px 0;
          }

          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .hero-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .preview-brand strong {
            font-size: 8px;
          }

          .preview-chart {
            padding: 10px;
          }
        }
      `}</style>
    </main>
  );
}

function PreviewStat({ icon, label, value }) {
  return (
    <div className="preview-stat">
      <div className="preview-stat-icon">{icon}</div>
      <span className="preview-stat-label">{label}</span>
      <strong className="preview-stat-value">{value}</strong>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}