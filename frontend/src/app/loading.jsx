export default function Loading() {
  return (
    <>
      <div className="loading-page">
        <div className="loading-card">
          <div className="loading-logo">
            <span className="sun-core" />
            <span className="sun-ray ray-1" />
            <span className="sun-ray ray-2" />
            <span className="sun-ray ray-3" />
            <span className="sun-ray ray-4" />
            <span className="sun-ray ray-5" />
            <span className="sun-ray ray-6" />
          </div>

          <div className="loading-content">
            <h2>GUJRAT SOLAR ENERGY</h2>
            <p>Loading your workspace...</p>
          </div>

          <div className="loading-progress">
            <span />
          </div>
        </div>
      </div>

      <style>{`
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(34, 197, 94, 0.08),
              transparent 32%
            ),
            #f8fafc;
        }

        .loading-card {
          width: min(100%, 390px);
          padding: 42px 32px 34px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
          text-align: center;
        }

        .loading-logo {
          position: relative;
          width: 58px;
          height: 58px;
          margin: 0 auto 24px;
          display: grid;
          place-items: center;
          animation: loading-pulse 1.8s ease-in-out infinite;
        }

        .sun-core {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 7px #dcfce7;
        }

        .sun-ray {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 4px;
          height: 9px;
          border-radius: 999px;
          background: #22c55e;
          transform-origin: 50% 22px;
        }

        .ray-1 {
          transform: translate(-50%, -50%) rotate(0deg) translateY(-22px);
        }

        .ray-2 {
          transform: translate(-50%, -50%) rotate(60deg) translateY(-22px);
        }

        .ray-3 {
          transform: translate(-50%, -50%) rotate(120deg) translateY(-22px);
        }

        .ray-4 {
          transform: translate(-50%, -50%) rotate(180deg) translateY(-22px);
        }

        .ray-5 {
          transform: translate(-50%, -50%) rotate(240deg) translateY(-22px);
        }

        .ray-6 {
          transform: translate(-50%, -50%) rotate(300deg) translateY(-22px);
        }

        .loading-content h2 {
          margin: 0;
          color: #0f172a;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .loading-content p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .loading-progress {
          width: 100%;
          height: 4px;
          margin-top: 26px;
          overflow: hidden;
          border-radius: 999px;
          background: #e2e8f0;
        }

        .loading-progress span {
          display: block;
          width: 35%;
          height: 100%;
          border-radius: inherit;
          background: #16a34a;
          animation: loading-progress 1.3s ease-in-out infinite;
        }

        @keyframes loading-progress {
          0% {
            transform: translateX(-130%);
          }

          50% {
            transform: translateX(110%);
          }

          100% {
            transform: translateX(300%);
          }
        }

        @keyframes loading-pulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @media (max-width: 480px) {
          .loading-card {
            padding: 36px 24px 30px;
          }

          .loading-content h2 {
            font-size: 15px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-logo,
          .loading-progress span {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}