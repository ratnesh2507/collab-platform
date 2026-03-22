import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GitBranch, CheckCircle, AlertCircle } from "lucide-react";
import api from "../lib/api";
import axios from "axios";

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    let timer: ReturnType<typeof setTimeout>;

    const join = async () => {
      try {
        const res = await api.post(`/api/projects/join/${token}`);
        const { projectId } = res.data;
        setStatus("success");
        timer = setTimeout(() => navigate(`/projects/${projectId}`), 1500);
      } catch (err: unknown) {
        // Handle 401 — user not logged in
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate(`/?invite=${token}`);
          return;
        }
        setStatus("error");
        setMessage(
          axios.isAxiosError(err)
            ? (err.response?.data?.error ?? "Invalid or expired invite link.")
            : "Something went wrong. Please try again.",
        );
      }
    };

    join();

    return () => clearTimeout(timer);
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="card p-8 flex flex-col items-center text-center max-w-sm w-full fade-in-scale">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          {status === "success" ? (
            <CheckCircle size={22} className="text-success" />
          ) : status === "error" ? (
            <AlertCircle size={22} className="text-danger" />
          ) : (
            <GitBranch size={22} className="text-primary" />
          )}
        </div>

        {/* Loading */}
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

        {/* Success */}
        {status === "success" && (
          <>
            <h2 className="font-semibold text-[16px] text-ink mb-2">
              You're in! 🎉
            </h2>
            <p className="text-[13px] text-ink-dim mb-1">
              Successfully joined the project.
            </p>
            <p className="text-[12px] text-ink-ghost">Redirecting you now...</p>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <h2 className="font-semibold text-[16px] text-ink mb-2">
              Invite failed
            </h2>
            <p className="text-[13px] text-ink-dim mb-6">{message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/")}
                className="btn btn-secondary btn-sm"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary btn-sm"
              >
                Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
