import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getNotifications(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

export async function markAsRead(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    // Check it exists and belongs to this user first
    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(notification);
  } catch {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
}

export async function markAllAsRead(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
}

export async function getActivity(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const projectId = Array.isArray(req.params.projectId)
    ? req.params.projectId[0]
    : req.params.projectId;

  try {
    // Verify member
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    if (!member) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    const activity = await prisma.activityLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.json(activity);
  } catch {
    res.status(500).json({ error: "Failed to fetch activity" });
  }
}
