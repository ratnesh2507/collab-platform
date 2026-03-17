import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GitBranch } from "lucide-react";
import api from "../lib/api";

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const join = async () => {
      try {
        const res = await api.post(`/api/projects/join/${token}`);
        const { projectId } = res.data;
        setStatus("success");
        setTimeout(() => navigate(`/projects/${projectId}`), 1500);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.error || "Invalid or expired invite link.",
        );
      }
    };
    if (token) join();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="card p-10 flex flex-col items-center text-center max-w-sm w-full fade-in-scale">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          <GitBranch size={22} className="text-primary" />
        </div>

        {status === "loading" && (
          <>
            <h2 className="font-semibold text-[16px] text-ink mb-2">
              Joining project...
            </h2>
            <p className="text-[13px] text-ink-dim mb-6">
              Verifying your invite link
            </p>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="loading-dot"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="font-semibold text-[16px] text-ink mb-2">
              You're in! 🎉
            </h2>
            <p className="text-[13px] text-ink-dim">
              Redirecting you to the project...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="font-semibold text-[16px] text-ink mb-2">
              Invalid invite
            </h2>
            <p className="text-[13px] text-ink-dim mb-6">{message}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-secondary btn-sm"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
