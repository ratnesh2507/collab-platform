# BranchBoard Architecture

## Overview

Monorepo with separate React frontend and Node.js backend.

```
collab-platform/
├── frontend/   → React + Vite (Vercel)
└── backend/    → Node + Express (Railway)
```

## Auth Flow

```
1. User clicks "Continue with GitHub"
2. GET /api/auth/github → redirects to GitHub OAuth
3. User approves → GitHub redirects to /api/auth/github/callback
4. Backend exchanges code for GitHub access token
5. Backend fetches GitHub user profile
6. Backend upserts User in DB
7. Backend signs JWT → stored in httpOnly cookie (7 days)
8. Redirects to /dashboard
9. Frontend calls GET /api/auth/me → gets user data
```

## Real-Time Flow

```
User A moves a task
  ├─ 1. dnd-kit fires onDragEnd
  ├─ 2. PATCH /api/.../tasks/:id/move (REST) → DB updated
  ├─ 3. Frontend emits: socket task-moved
  ├─ 4. Socket.IO broadcasts to project room
  └─ 5. User B receives task-moved → refetch() → board updates
```

## Database Schema

```
User          → id, githubId, username, name, email, avatar
Project       → id, name, description, tags[], inviteToken, ownerId
ProjectMember → userId, projectId, role (OWNER | MEMBER)
Column        → id, name, order, projectId
Task          → id, title, description, priority, order, columnId, assigneeId, creatorId
ActivityLog   → id, action, userId, projectId, createdAt
Notification  → id, message, read, userId, createdAt
```

## Key Decisions

**Separate frontend/backend** — Socket.IO needs a long-running server. Vercel serverless kills processes between requests.

**Prisma v7 + @prisma/adapter-pg** — v7 removed connection strings from schema. Runtime uses pg pool via adapter; CLI uses prisma.config.ts.

**httpOnly cookies for JWT** — XSS-safe. JavaScript cannot read the token. Combined with SameSite: lax for CSRF protection.

**TanStack Query for server state** — handles caching, background refetch, loading states. Zustand only for client auth state.
