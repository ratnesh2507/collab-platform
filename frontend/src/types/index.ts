export interface User {
  id: string;
  githubId: string;
  username: string;
  name: string;
  email: string | null;
  avatar: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  inviteToken: string;
  ownerId: string;
  createdAt: string;
}
