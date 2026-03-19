# BranchBoard

> A real-time developer collaboration platform. Kanban boards, team collaboration, and live updates — built for developers.

## ✨ Features

- **GitHub OAuth** — Sign in instantly with your GitHub account
- **Project Management** — Create projects, invite teammates via shareable links
- **Kanban Boards** — 4-column workflow: Backlog → In Progress → In Review → Done
- **Task Management** — Create, edit, delete, and assign tasks with priority labels
- **Drag & Drop** — Reorder and move tasks between columns with persistence
- **Real-time Sync** — All board changes sync instantly for every team member via Socket.IO
- **Online Presence** — See how many teammates are active on the board
- **Activity Logging** — Every action is logged automatically

## 🛠 Tech Stack

### Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React + Vite     | UI framework            |
| TypeScript       | Type safety             |
| Tailwind CSS v4  | Styling                 |
| TanStack Query   | Data fetching + caching |
| Zustand          | Auth state              |
| dnd-kit          | Drag and drop           |
| Socket.IO Client | Real-time updates       |
| React Router v7  | Routing                 |

### Backend

| Technology             | Purpose        |
| ---------------------- | -------------- |
| Node.js + Express      | Server         |
| TypeScript             | Type safety    |
| Prisma v7              | ORM            |
| PostgreSQL             | Database       |
| Socket.IO              | WebSockets     |
| JWT + httpOnly cookies | Authentication |
| Zod                    | Validation     |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A GitHub account (for OAuth)

### 1. Clone the repository

```bash
git clone https://github.com/ratnesh2507/collab-platform.git
cd collab-platform
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=YOUR_KEY"
DIRECT_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
JWT_SECRET=your_random_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
PORT=5000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173
```

### 4. Database setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 5. GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:5000/api/auth/github/callback`
3. Copy **Client ID** and **Client Secret** into `backend/.env`

### 6. Run the project

You need 3 terminals:

```bash
# Terminal 1 — Prisma DB (must start first)
cd backend && npx prisma dev

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173` and sign in with GitHub.

## 📁 Project Structure

```
collab-platform/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── board/         # Board, TaskCard, Modals, Panels
│       │   ├── projects/      # ProjectCard, CreateProjectModal
│       │   └── ui/
│       ├── hooks/             # useAuth, useProjects, useTasks
│       ├── lib/               # api.ts, socket.ts
│       ├── pages/             # Landing, Dashboard, Board, Invite
│       ├── store/             # authStore
│       └── types/             # TypeScript interfaces
└── backend/
    └── src/
        ├── controllers/       # auth, project, task
        ├── middleware/        # auth middleware
        ├── routes/            # auth, project, task routes
        ├── socket/            # Socket.IO event handlers
        └── lib/               # prisma.ts, jwt.ts
```

## 📄 License

MIT — Built by [ratnesh2507](https://github.com/ratnesh2507)
