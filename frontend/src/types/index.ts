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
