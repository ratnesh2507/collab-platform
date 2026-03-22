import { Router } from "express";
import { githubCallback, getMe, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

// Fail fast at startup if required env vars are missing
if (!GITHUB_CLIENT_ID) {
  throw new Error("GITHUB_CLIENT_ID environment variable is required");
}
if (!BACKEND_URL) {
  throw new Error("BACKEND_URL environment variable is required");
}

const router = Router();

// Redirect to GitHub OAuth
router.get("/github", (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: "read:user user:email",
    redirect_uri: `${BACKEND_URL}/api/auth/github/callback`,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GitHub OAuth callback
router.get("/github/callback", githubCallback);

// Get current user
router.get("/me", authenticate, getMe);

// Logout
router.post("/logout", logout);

export default router;
