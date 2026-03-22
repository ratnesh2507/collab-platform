import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client";

const createProjectSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).max(5).optional().default([]),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).max(5).optional(),
});

// Reusable user select — never expose updatedAt or sensitive fields
const userSelect = {
  id: true,
  githubId: true,
  username: true,
  name: true,
  email: true,
  avatar: true,
  createdAt: true,
};

export async function createProject(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, description, tags } = parsed.data;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        tags: { set: tags },
        ownerId: req.userId!,
        members: {
          create: {
            userId: req.userId!,
            role: "OWNER",
          },
        },
        columns: {
          create: [
            { name: "Backlog", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "In Review", order: 2 },
            { name: "Done", order: 3 },
          ],
        },
      },
      include: {
        members: { include: { user: { select: userSelect } } },
        columns: true,
      },
    });

    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
}

export async function getProjects(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId: string = req.userId!;
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: { equals: userId },
          } satisfies Prisma.ProjectMemberWhereInput,
        },
      },
      include: {
        members: { include: { user: { select: userSelect } } },
        _count: { select: { columns: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
}

export async function getProject(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId: string = req.userId!;
  let { projectId } = req.params;
  if (Array.isArray(projectId)) projectId = projectId[0];

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: { equals: userId },
          } satisfies Prisma.ProjectMemberWhereInput,
        },
      },
      include: {
        members: { include: { user: { select: userSelect } } },
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                assignee: { select: userSelect },
                creator: { select: userSelect },
              },
            },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
}

export async function joinProject(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  let { inviteToken } = req.params;
  if (Array.isArray(inviteToken)) inviteToken = inviteToken[0];

  try {
    const project = await prisma.project.findUnique({
      where: { inviteToken },
    });

    if (!project) {
      res.status(404).json({ error: "Invalid invite link" });
      return;
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: project.id,
        },
      },
    });

    if (existing) {
      res.json({ message: "Already a member", projectId: project.id });
      return;
    }

    await prisma.projectMember.create({
      data: {
        userId: req.userId!,
        projectId: project.id,
        role: "MEMBER",
      },
    });

    // Log join activity
    await prisma.activityLog.create({
      data: {
        userId: req.userId!,
        projectId: project.id,
        action: "joined the project",
      },
    });

    res.json({ message: "Joined successfully", projectId: project.id });
  } catch {
    res.status(500).json({ error: "Failed to join project" });
  }
}

export async function updateProject(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  let { projectId } = req.params;
  if (Array.isArray(projectId)) projectId = projectId[0];

  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    // Only owner can update
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      res.status(403).json({ error: "Only the project owner can edit it" });
      return;
    }

    const { name, description, tags } = parsed.data;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description: description ?? null }),
        ...(tags && { tags: { set: tags } }),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action: `updated project details`,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update project" });
  }
}

export async function deleteProject(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  let { projectId } = req.params;
  if (Array.isArray(projectId)) projectId = projectId[0];

  try {
    // Only owner can delete
    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      res.status(403).json({ error: "Only the project owner can delete it" });
      return;
    }

    await prisma.project.delete({ where: { id: projectId } });

    res.json({ message: "Project deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
}
