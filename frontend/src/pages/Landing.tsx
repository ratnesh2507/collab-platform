const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Landing() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-48px_48px" />

      {/* Glow blobs */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-dim rounded-full blur-[180px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[30%] w-100 h-100 bg-accent-dim rounded-full blur-[180px] opacity-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto fade-in">
        {/* Badge */}
        <div className="badge badge-primary mb-8">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
          BranchBoard
        </div>

        {/* Heading */}
        <h1 className="font-bold mb-6 leading-tight tracking-tight text-[clamp(2.8rem,8vw,5rem)] text-ink">
          Build together,{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-br from-primary to-accent">
            ship faster.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-[1.1rem] text-ink-mid mb-10 max-w-xl leading-relaxed">
          A real-time project management platform built for developers. Kanban
          boards, team collaboration, and live updates — all in one place.
        </p>

        {/* Sign in button */}
        <a
          href={`${BACKEND_URL}/api/auth/github`}
          className="btn btn-lg bg-ink text-bg font-semibold hover:scale-105 active:scale-100 hover:opacity-90 transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
          </svg>
          Continue with GitHub
        </a>

        {/* Features row */}
        <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            {
              label: "Kanban Boards",
              desc: "Drag & drop task management",
              dot: "bg-primary",
            },
            {
              label: "Real-time",
              desc: "Live updates for your team",
              dot: "bg-accent",
            },
            {
              label: "Team Collab",
              desc: "Invite & manage members",
              dot: "bg-success",
            },
          ].map((item) => (
            <div key={item.label} className="card-md p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                <span className="font-semibold text-[13px] text-ink">
                  {item.label}
                </span>
              </div>
              <span className="text-[12px] text-ink-dim">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
