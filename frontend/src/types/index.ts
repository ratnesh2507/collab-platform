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
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  order: number;
  columnId: string;
  assigneeId: string | null;
  assignee: User | null;
  creatorId: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnWithTasks extends Column {
  tasks: Task[];
}

export interface ProjectWithColumns extends Project {
  columns: ColumnWithTasks[];
}
