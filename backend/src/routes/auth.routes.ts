import { Router } from "express";
import { githubCallback, getMe, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Redirect to GitHub OAuth
router.get("/github", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user user:email",
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/github/callback`,
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
