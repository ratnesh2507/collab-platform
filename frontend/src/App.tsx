import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";
import Invite from "./pages/Invite";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

// Separate component so useNavigate works inside BrowserRouter
function AuthGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      // Clear all cached query data on unauthorized
      // so stale data doesn't show on next login
      queryClient.clear();
      navigate("/");
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGuard />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<Board />} />
          <Route path="/invite/:token" element={<Invite />} />
          {/* Catch-all — redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
