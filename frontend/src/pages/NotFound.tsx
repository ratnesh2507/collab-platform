import { useNavigate } from "react-router-dom";
import { GitBranch, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      {/* Subtle glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-5 rounded-full"
        style={{
          width: "500px",
          height: "250px",
          background: "var(--color-primary)",
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-primary to-accent-dim flex items-center justify-center shrink-0">
            <GitBranch size={13} color="white" />
          </div>
          <span className="font-semibold text-[15px] text-ink">
            BranchBoard
          </span>
        </div>

        {/* 404 */}
        <p className="text-[80px] font-bold leading-none text-transparent bg-clip-text bg-linear-to-br from-primary to-accent mb-4">
          404
        </p>

        <h1 className="font-semibold text-[18px] text-ink mb-3">
          Page not found
        </h1>
        <p className="text-[13px] text-ink-dim leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={14} />
            Go back
          </button>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/")}
            className="btn btn-primary btn-sm"
          >
            <Home size={14} />
            {user ? "Dashboard" : "Home"}
          </button>
        </div>
      </div>
    </div>
  );
}
