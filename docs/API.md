# BranchBoard API Reference

Base URL: `https://branchboard.onrender.com`

All protected routes require a valid JWT stored in an httpOnly cookie named `token`.

---

## Authentication

### `GET /api/auth/github`

Redirects to GitHub OAuth.

### `GET /api/auth/github/callback`

Handles GitHub OAuth callback. Sets JWT cookie, redirects to dashboard.

### `GET /api/auth/me` 🔒

Returns the current authenticated user.

### `POST /api/auth/logout`

Clears the JWT cookie.

---

## Projects 🔒

### `POST /api/projects`

Create a new project. Auto-creates 4 columns, adds creator as OWNER.

**Body:**

```json
{ "name": "string", "description": "string?", "tags": "string[]?" }
```

### `GET /api/projects`

Get all projects the user is a member of.

### `GET /api/projects/:projectId`

Get a project with all columns and tasks (including assignee + creator on each task).

### `POST /api/projects/join/:inviteToken`

Join a project via invite link.

---

## Tasks 🔒

Base: `/api/projects/:projectId/tasks`

### `POST /`

Create a task. Auto-assigns order within the column.

**Body:**

```json
{
  "title": "string",
  "description": "string?",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "columnId": "string",
  "assigneeId": "string?"
}
```

### `PATCH /:taskId`

Update title, description, priority, or assignee.

### `DELETE /:taskId`

Delete a task.

### `PATCH /:taskId/move`

Move a task to a column at a specific order position.

**Body:**

```json
{ "columnId": "string", "order": 0 }
```

---

## Socket.IO Events

### Client → Server

| Event           | Payload                                  |
| --------------- | ---------------------------------------- |
| `join-project`  | `projectId`                              |
| `leave-project` | `projectId`                              |
| `task-created`  | `{ projectId, task }`                    |
| `task-updated`  | `{ projectId, task }`                    |
| `task-deleted`  | `{ projectId, taskId }`                  |
| `task-moved`    | `{ projectId, taskId, columnId, order }` |

### Server → Client

| Event          | Payload                       |
| -------------- | ----------------------------- |
| `task-created` | `task`                        |
| `task-updated` | `task`                        |
| `task-deleted` | `taskId`                      |
| `task-moved`   | `{ taskId, columnId, order }` |
| `user-joined`  | `{ socketId }`                |
| `user-left`    | `{ socketId }`                |

---

## Error Format

```json
{ "error": "Error message" }
```

| Status | Meaning              |
| ------ | -------------------- |
| 400    | Validation error     |
| 401    | Unauthorized         |
| 403    | Not a project member |
| 404    | Not found            |
| 500    | Server error         |
