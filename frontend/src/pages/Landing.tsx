import { GitBranch, ArrowRight, Zap, Users, LayoutGrid } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
);

const features = [
  {
    icon: LayoutGrid,
    label: "Kanban Boards",
    desc: "Drag & drop tasks across workflow stages with real-time visual feedback.",
    accent: "var(--color-primary)",
    glow: "var(--color-primary-ghost)",
    border: "var(--color-primary-border)",
    topLine: "var(--color-primary)",
  },
  {
    icon: Zap,
    label: "Real-time Sync",
    desc: "Live updates propagate instantly — every teammate sees changes as they happen.",
    accent: "var(--color-accent)",
    glow: "var(--color-accent-ghost)",
    border: "rgba(34, 211, 238, 0.2)",
    topLine: "var(--color-accent)",
  },
  {
    icon: Users,
    label: "Team Collaboration",
    desc: "Invite teammates via shareable links. No account setup friction.",
    accent: "var(--color-success)",
    glow: "var(--color-success-ghost)",
    border: "rgba(52, 211, 153, 0.2)",
    topLine: "var(--color-success)",
  },
];

const KanbanPreview = () => {
  const columns = [
    {
      label: "Backlog",
      dot: "var(--color-ink-ghost)",
      tasks: ["Auth flow", "DB schema"],
    },
    {
      label: "In Progress",
      dot: "var(--color-primary)",
      tasks: ["API routes", "Dashboard UI"],
    },
    { label: "Done", dot: "var(--color-success)", tasks: ["CI pipeline"] },
  ];

  return (
    <div
      className="card fade-in"
      style={{
        padding: "16px",
        display: "flex",
        gap: "10px",
        overflow: "hidden",
        position: "relative",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "300px",
          height: "200px",
          background: "var(--color-primary-ghost)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      {columns.map((col) => (
        <div key={col.label} style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
              padding: "0 2px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "9999px",
                background: col.dot,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--color-ink-dim)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {col.label}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {col.tasks.map((t) => (
              <div
                key={t}
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 10px",
                  fontSize: "11px",
                  color: "var(--color-ink-mid)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Landing() {
  return (
    <main
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Ambient top glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse at top, rgba(104,117,245,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          opacity: 0.35,
          pointerEvents: "none",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
        }}
      />

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-dim))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            <GitBranch size={14} color="white" />
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--color-ink)",
            }}
          >
            BranchBoard
          </span>
        </div>

        <a
          href={`${BACKEND_URL}/api/auth/github`}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <GitHubIcon />
          Sign in
        </a>
      </nav>

      {/* Hero */}
      <section
        className="fade-in"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px 60px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          maxWidth: "720px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <div className="badge badge-primary" style={{ marginBottom: "28px" }}>
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "9999px",
              background: "var(--color-primary)",
              display: "inline-block",
            }}
          />
          Open Beta · Free to use
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(2.4rem, 6vw, 3.8rem)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--color-ink)",
            marginBottom: "20px",
          }}
        >
          Where dev teams
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary-hover), var(--color-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ship together.
          </span>
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: "16px",
            color: "var(--color-ink-dim)",
            lineHeight: 1.75,
            marginBottom: "40px",
            maxWidth: "440px",
          }}
        >
          Real-time Kanban boards, team collaboration, and activity tracking —
          built for developers who care about their workflow.
        </p>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            maxWidth: "340px",
          }}
        >
          <a
            href={`${BACKEND_URL}/api/auth/github`}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <GitHubIcon />
            Continue with GitHub
            <ArrowRight size={15} style={{ marginLeft: "2px" }} />
          </a>
          <span style={{ fontSize: "12px", color: "var(--color-ink-ghost)" }}>
            No credit card · Takes 30 seconds
          </span>
        </div>

        {/* Kanban preview */}
        <div style={{ width: "100%", maxWidth: "500px", marginTop: "56px" }}>
          <KanbanPreview />
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 24px 80px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="divider-solid" style={{ marginBottom: "48px" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="card"
                style={{
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, transparent, ${f.topLine}, transparent)`,
                    opacity: 0.6,
                  }}
                />
                {/* Icon */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: f.glow,
                    border: `1px solid ${f.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={17} color={f.accent} />
                </div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    marginBottom: "8px",
                  }}
                >
                  {f.label}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-ink-dim)",
                    lineHeight: 1.7,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
