# BranchBoard

> A real-time developer collaboration platform. Kanban boards, team collaboration, and live updates — built for developers.

## 🌐 Live Demo

- Frontend: https://collab-platform-beta.vercel.app/
- Backend API: https://branchboard.onrender.com/

## 📸 Screenshots

| Dashboard                            | Board                            |
| ------------------------------------ | -------------------------------- |
| ![](./frontend/public/dashboard.png) | ![](./frontend/public/board.png) |

| New Project                            | Task                                |
| -------------------------------------- | ----------------------------------- |
| ![](./frontend/public/new_project.png) | ![](./frontend/public/new_task.png) |

| Edit Task                            | Activity Feed                            |
| ------------------------------------ | ---------------------------------------- |
| ![](./frontend/public/edit_task.png) | ![](./frontend/public/activity_feed.png) |

| Notifications                            |
| ---------------------------------------- |
| ![](./frontend/public/notifications.png) |

## ✨ Features

### 🔐 Authentication & Access

- GitHub OAuth — Sign in instantly with your GitHub account
- Secure auth using JWT + httpOnly cookies
- Role-based access for project collaboration

### 📋 Project & Task Management

- Create projects and invite teammates via shareable links
- Kanban boards — Backlog → In Progress → In Review → Done
- Full task lifecycle — create, edit, delete, assign, prioritize
- Drag & drop with persistent ordering

### ⚡ Real-Time Collaboration

- Live updates on task changes (create/edit/delete/move)
- Real-time sync powered by Socket.IO
- Online presence indicators
- Activity feed with granular tracking

### 💬 Collaboration Enhancements

- @mentions — Tag teammates in task descriptions/comments
- Rich text descriptions — Format tasks with enhanced editing support
- Notifications system for mentions and activity

### 🧪 Testing & Quality

- Backend testing with Jest + Supertest
- API endpoint coverage for reliability
- Input validation using Zod

### 🔄 CI/CD

- Continuous Integration setup for automated checks
- Linting & test runs on pull requests
- Ensures stability before merges

## 🚀 Highlights

- Real-time collaboration using WebSockets
- Scalable architecture with separated frontend/backend
- Cloud deployment with connection pooling
- Secure authentication using httpOnly cookies

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
| Jest + Supertest       | Validation     |

## 🏗 Architecture

```
Frontend (Vercel)
↓
Backend (Render)
↓
Supabase (PostgreSQL)
```

- Backend handles authentication and authorization
- Supabase is used as a managed PostgreSQL database (no direct client access)
- Socket.IO enables real-time collaboration

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
DATABASE_URL=your_supabase_pooled_url
DIRECT_URL=your_supabase_direct_url
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
PORT=5000
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
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
npx prisma db push
npx prisma generate
```

### 5. GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set **Authorization callback URL** to `http://localhost:5000/api/auth/github/callback`
3. Copy **Client ID** and **Client Secret** into `backend/.env`

### 6. Run the project

You need 2 terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
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
