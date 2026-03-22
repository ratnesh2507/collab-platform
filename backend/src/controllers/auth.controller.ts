import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { AuthRequest } from "../middleware/auth.middleware";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export async function githubCallback(
  req: Request,
  res: Response,
): Promise<void> {
  // Narrow code to string
  const code = Array.isArray(req.query.code)
    ? req.query.code[0]
    : req.query.code;

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "No code provided" });
    return;
  }

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenRes.data.access_token;

    // GitHub returns an error field instead of throwing
    if (!accessToken) {
      console.error("GitHub OAuth token error:", tokenRes.data);
      res.redirect(`${FRONTEND_URL}?error=auth_failed`);
      return;
    }

    // Get GitHub user data
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userRes.data;

    // Upsert user — also update username in case it changed on GitHub
    const user = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        username: githubUser.login,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email ?? null,
      },
      create: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email ?? null,
      },
    });

    // Sign JWT
    const token = signToken({ userId: user.id, username: user.username });

    // Set httpOnly cookie
    // sameSite: "none" required for cross-origin (Vercel frontend + Railway backend)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    res.redirect(`${FRONTEND_URL}?error=auth_failed`);
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        githubId: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        // updatedAt intentionally omitted from API response
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
}
