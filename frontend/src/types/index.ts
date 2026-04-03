// ── Shared primitive types ──────────────────────────────

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ── Entity interfaces ───────────────────────────────────

export interface User {
  id: string;
  githubId: string;
  username: string;
  name: string;
  email: string | null;
  avatar: string;
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  projectId: string;
}

export interface ProjectMember {
  id: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  inviteToken: string;
  ownerId: string;
  createdAt: string;
  members: ProjectMember[];
  columns?: Column[];
  _count?: { columns: number };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  order: number;
  columnId: string;
  assigneeId: string | null;
  assignee: User | null;
  creatorId: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

// ── Composed interfaces ─────────────────────────────────

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface ProjectWithColumns extends Project {
  columns: ColumnWithTasks[];
}

export interface AISuggestion {
  suggestedPriority: TaskPriority;
  priorityReason: string;
  subtasks: Array<{
    title: string;
    priority: TaskPriority;
  }>;
}
