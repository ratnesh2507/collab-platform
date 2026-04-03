import { GitBranch } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const features = [
  {
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    name: "Real-time sync",
    desc: "Every task move, edit, and comment appears instantly for your whole team. No refresh needed, ever.",
    tag: null,
    accent: true,
  },
  {
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    name: "Live editing presence",
    desc: "See who's viewing or editing a task right now — no more stepping on each other's work.",
    tag: null,
    accent: false,
  },
  {
    colorClass: "text-[#a78bfa]",
    bgClass: "bg-[#a78bfa]/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    name: "AI task suggestions",
    desc: "Get instant subtask breakdowns and priority recommendations powered by Groq's LLaMA 3.3 model.",
    tag: {
      label: "Groq · LLaMA 3.3",
      color: "text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20",
    },
    accent: false,
  },
  {
    colorClass: "text-success",
    bgClass: "bg-success/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    name: "Rich text descriptions",
    desc: "Write task descriptions with formatting, code blocks with syntax highlighting, and @mention teammates.",
    tag: null,
    accent: false,
  },
  {
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    name: "Kanban that just works",
    desc: "Drag tasks across Backlog, In Progress, In Review, and Done. Changes persist instantly with optimistic updates.",
    tag: null,
    accent: false,
  },
  {
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    name: "Invite & collaborate",
    desc: "Share a link, teammates join instantly. Activity feed tracks every action across your project.",
    tag: null,
    accent: false,
  },
];

const stats = [
  { value: "< 100ms", label: "Average real-time sync latency" },
  { value: "1 click", label: "To sign in — no forms, no passwords" },
  { value: "AI-first", label: "Task breakdowns in under a second" },
];

const stackPills = [
  { label: "React 19", color: "#6875f5" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "Socket.IO", color: "#22d3ee" },
  { label: "Prisma", color: "#34d399" },
  { label: "TanStack Query", color: "#fbbf24" },
  { label: "Tailwind v4", color: "#38bdf8" },
  { label: "Groq AI", color: "#a78bfa" },
  { label: "Express v5", color: "#f87171" },
  { label: "PostgreSQL", color: "#60a5fa" },
  { label: "Tiptap", color: "#fb923c" },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-bg flex flex-col overflow-x-hidden">
      {/* Nav */}
      <nav className="navbar shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-primary to-accent-dim flex items-center justify-center shrink-0">
            <GitBranch size={13} color="white" />
          </div>
          <span className="font-semibold text-[15px] text-ink tracking-[-0.01em]">
            BranchBoard
          </span>
        </div>
        <a
          href={`${BACKEND_URL}/api/auth/github`}
          className="btn btn-primary btn-sm"
        >
          <GitHubIcon />
          Sign in with GitHub
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20 max-w-3xl mx-auto w-full fade-in">
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[12px] text-primary font-medium mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
          Built for developer teams
        </div>

        {/* Headline */}
        <h1 className="font-semibold leading-[1.1] tracking-[-0.03em] text-[clamp(2.8rem,6vw,3.5rem)] text-ink mb-5">
          Ship faster,{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
            together
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-[17px] text-ink-dim leading-[1.7] max-w-lg mb-10">
          Real-time Kanban boards with live presence, AI-assisted task planning,
          and rich collaboration tools — built by developers, for developers.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <a
            href={`${BACKEND_URL}/api/auth/github`}
            className="btn btn-primary btn-lg"
          >
            <GitHubIcon />
            Continue with GitHub
          </a>
          <a
            href="https://github.com/ratnesh2507/collab-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-lg"
          >
            View source
          </a>
        </div>
        <p className="text-[12px] text-ink-ghost mt-4">
          GitHub account required · Free to use
        </p>
      </section>

      {/* Divider */}
      <div
        className="h-px mx-12"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-border) 20%, var(--color-border-2) 50%, var(--color-border) 80%, transparent)",
        }}
      />

      {/* Features */}
      <section className="px-12 py-20 max-w-6xl mx-auto w-full">
        <p className="text-[11px] font-semibold text-primary tracking-[0.08em] uppercase text-center mb-3">
          Features
        </p>
        <h2 className="text-[32px] font-semibold text-ink text-center tracking-[-0.02em] mb-2">
          Everything your team needs
        </h2>
        <p className="text-[15px] text-ink-dim text-center mb-14">
          No bloat. Just the tools that actually move work forward.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.name}
              className={`flex flex-col p-7 rounded-lg border transition-colors duration-200 ${
                f.accent
                  ? "border-primary/25 bg-linear-to-br from-surface to-surface-2"
                  : "border-border bg-surface hover:border-border-2 hover:bg-surface-2"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center mb-4 ${f.bgClass} ${f.colorClass}`}
              >
                {f.icon}
              </div>
              <p className="text-[15px] font-semibold text-ink mb-2 tracking-[-0.01em]">
                {f.name}
              </p>
              <p className="text-[13px] text-ink-dim leading-[1.65] flex-1">
                {f.desc}
              </p>
              {f.tag && (
                <span
                  className={`mt-3 self-start text-[11px] font-medium px-2.5 py-1 rounded-full border ${f.tag.color}`}
                >
                  {f.tag.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-12 pb-20 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-lg p-7 text-center"
            >
              <p className="text-[36px] font-semibold tracking-[-0.03em] text-transparent bg-clip-text bg-linear-to-r from-primary to-accent mb-1">
                {s.value}
              </p>
              <p className="text-[13px] text-ink-dim">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="px-12 pb-20 max-w-6xl mx-auto w-full">
        <p className="text-[20px] font-semibold text-ink-mid text-center tracking-[-0.01em] mb-8">
          Built with a modern, production-grade stack
        </p>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {stackPills.map((p) => (
            <span
              key={p.label}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface border border-border rounded-full text-[13px] text-ink-mid font-medium"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: p.color }}
              />
              {p.label}
            </span>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-12 py-20 text-center border-t border-border">
        <h2 className="text-[36px] font-semibold text-ink tracking-[-0.02em] mb-3">
          Ready to ship faster?
        </h2>
        <p className="text-[15px] text-ink-dim mb-8">
          Sign in with GitHub and have your first project running in under a
          minute.
        </p>
        <a
          href={`${BACKEND_URL}/api/auth/github`}
          className="btn btn-primary btn-lg"
        >
          <GitHubIcon />
          Get started free
        </a>
      </section>

      {/* Footer */}
      <footer className="px-12 py-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-linear-to-br from-primary to-accent-dim flex items-center justify-center shrink-0">
            <GitBranch size={11} color="white" />
          </div>
          <span className="text-[13px] text-ink-ghost">
            BranchBoard · MIT · Built by ratnesh2507
          </span>
        </div>
        <div className="flex gap-6">
          <a
            href="https://github.com/ratnesh2507/collab-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ink-ghost hover:text-ink-dim transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://branchboard.onrender.com/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-ink-ghost hover:text-ink-dim transition-colors"
          >
            API status
          </a>
        </div>
      </footer>
    </main>
  );
}
