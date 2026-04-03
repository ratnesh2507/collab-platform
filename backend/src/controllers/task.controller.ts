import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  assigneeId: z.string().optional().nullable(),
  columnId: z.string().min(1),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  assigneeId: z.string().optional().nullable(),
});

const moveTaskSchema = z.object({
  columnId: z.string().min(1),
  order: z.number().int().min(0),
});

const batchDeleteSchema = z.object({
  taskIds: z.array(z.string()).min(1).max(50),
});

// Reusable user select
const userSelect = {
  id: true,
  githubId: true,
  username: true,
  name: true,
  email: true,
  avatar: true,
  createdAt: true,
};

// Helper to verify user is a member of the project
async function verifyProjectMember(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return !!member;
}

export async function createTask(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const projectId = req.params.projectId as string;

  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, description, priority, assigneeId, columnId } = parsed.data;

  try {
    const isMember = await verifyProjectMember(userId, projectId);
    if (!isMember) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    // Get the highest order in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
    });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        priority,
        order,
        columnId,
        assigneeId: assigneeId ?? null,
        creatorId: userId,
      },
      include: {
        assignee: { select: userSelect },
        creator: { select: userSelect },
      },
    });

    await prisma.activityLog.create({
      data: { userId, projectId, action: `created task "${title}"` },
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: "Failed to create task" });
  }
}

export async function updateTask(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { title, description, priority, assigneeId } = parsed.data;

  try {
    const isMember = await verifyProjectMember(userId, projectId);
    if (!isMember) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    // Check task exists
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description ?? null }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ?? null }),
      },
      include: {
        assignee: { select: userSelect },
        creator: { select: userSelect },
      },
    });

    await prisma.activityLog.create({
      data: { userId, projectId, action: `updated task "${task.title}"` },
    });

    res.json(task);
  } catch {
    res.status(500).json({ error: "Failed to update task" });
  }
}

export async function deleteTask(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const projectId = req.params.projectId as string;
  const taskId = req.params.taskId as string;

  try {
    const isMember = await verifyProjectMember(userId, projectId);
    if (!isMember) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    // Check task exists
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    await prisma.activityLog.create({
      data: { userId, projectId, action: `deleted task "${existing.title}"` },
    });

    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete task" });
  }
}

export async function moveTask(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.userId as string;
  const { projectId, taskId } = req.params as {
    projectId: string;
    taskId: string;
  };

  const parsed = moveTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { columnId, order } = parsed.data;

  try {
    const isMember = await verifyProjectMember(userId, projectId);
    if (!isMember) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { columnId, order },
      include: {
        assignee: { select: userSelect },
        creator: { select: userSelect },
        column: { select: { name: true } }, // get column name in same query
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action: `moved task "${task.title}" to ${task.column.name}`,
      },
    });

    res.json(task);
  } catch {
    res.status(500).json({ error: "Failed to move task" });
  }
}

export async function batchDeleteTasks(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const projectId = req.params.projectId as string;

  const parsed = batchDeleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { taskIds } = parsed.data;

  try {
    const isMember = await verifyProjectMember(userId, projectId);
    if (!isMember) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }

    await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action: `deleted ${taskIds.length} task${taskIds.length !== 1 ? "s" : ""}`,
      },
    });

    res.json({ message: "Tasks deleted", count: taskIds.length });
  } catch {
    res.status(500).json({ error: "Failed to delete tasks" });
  }
}
