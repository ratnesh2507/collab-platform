import request from "supertest";
import app from "../app";
import { prisma } from "../lib/prisma";

// Mock the prisma module
jest.mock("../lib/prisma", () => require("../__mocks__/prisma"));

// Mock auth middleware — inject a fake userId for all requests
jest.mock("../middleware/auth.middleware", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.userId = "user-123";
    next();
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/projects/:projectId/tasks", () => {
  it("returns 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/projects/proj-1/tasks")
      .send({ columnId: "col-1" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 403 if user is not a project member", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/projects/proj-1/tasks")
      .send({ title: "New task", columnId: "col-1" });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Not a member of this project");
  });

  it("creates a task and returns 201", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-123",
      projectId: "proj-1",
    });
    (mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.task.create as jest.Mock).mockResolvedValue({
      id: "task-1",
      title: "New task",
      priority: "MEDIUM",
      order: 0,
      columnId: "col-1",
      assignee: null,
      creator: { id: "user-123", username: "testuser" },
    });
    (mockPrisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post("/api/projects/proj-1/tasks")
      .send({ title: "New task", columnId: "col-1" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New task");
    expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
  });
});

describe("DELETE /api/projects/:projectId/tasks/:taskId", () => {
  it("returns 403 if user is not a member", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete("/api/projects/proj-1/tasks/task-1");

    expect(res.status).toBe(403);
  });

  it("returns 404 if task does not exist", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-123",
    });
    (mockPrisma.task.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(
      "/api/projects/proj-1/tasks/task-999",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });

  it("deletes task and returns 200", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-123",
    });
    (mockPrisma.task.findUnique as jest.Mock).mockResolvedValue({
      id: "task-1",
      title: "Old task",
    });
    (mockPrisma.task.delete as jest.Mock).mockResolvedValue({});
    (mockPrisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const res = await request(app).delete("/api/projects/proj-1/tasks/task-1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Task deleted");
  });
});

describe("PATCH /api/projects/:projectId/tasks/:taskId/move", () => {
  it("returns 400 if columnId is missing", async () => {
    const res = await request(app)
      .patch("/api/projects/proj-1/tasks/task-1/move")
      .send({ order: 0 });

    expect(res.status).toBe(400);
  });

  it("moves task to new column", async () => {
    (mockPrisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
      userId: "user-123",
    });
    (mockPrisma.task.update as jest.Mock).mockResolvedValue({
      id: "task-1",
      title: "Task",
      columnId: "col-2",
      order: 1,
      column: { name: "In Progress" },
      assignee: null,
      creator: { id: "user-123" },
    });
    (mockPrisma.activityLog.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .patch("/api/projects/proj-1/tasks/task-1/move")
      .send({ columnId: "col-2", order: 1 });

    expect(res.status).toBe(200);
    expect(res.body.columnId).toBe("col-2");
  });
});
