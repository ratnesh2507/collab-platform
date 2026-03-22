import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // verifyToken returns null on invalid/expired token instead of throwing
  const payload = verifyToken(token);

  if (!payload || !payload.userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.userId = payload.userId;
  req.username = payload.username;
  next();
}
