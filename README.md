# TaskFlow

Full-stack task manager built with Next.js 14, Node.js/Express, PostgreSQL and Docker. Features a clean UI with real-time filters, priority/status tracking, animated modals and toast notifications, zero local setup required.

## Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS |
| Backend  | Node.js · Express · REST API      |
| Database | PostgreSQL 16                     |
| Infra    | Docker · Docker Compose           |

## Features

- Create, edit and delete tasks
- Priority levels: Low, Medium, High
- Status tracking: Pending, In Progress, Done
- Real-time search and filters
- Grid / list view toggle
- Stats dashboard (total, pending, in progress, done)
- Due date with overdue warning
- Animated modal for create/edit
- Delete confirmation dialog
- Toast notifications
- Zero local setup — everything runs in Docker

## Getting Started

**Requirements:** Docker Desktop installed and running.

```bash
git clone <your-repo-url>
cd Proyecto
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

The first build takes 2–3 minutes. When you see `Local: http://localhost:3000` in the logs, the app is ready.

## Project Structure

```
Proyecto/
├── docker-compose.yml
├── db/
│   └── init.sql          # Schema + seed data
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── index.js
│       ├── db/           # PostgreSQL pool
│       ├── routes/       # Express routes
│       └── controllers/  # Request handlers
└── frontend/
    ├── Dockerfile
    └── src/
        ├── app/          # Next.js App Router
        ├── components/   # TaskCard, TaskModal, Toast
        ├── lib/          # API client
        └── types/        # TypeScript interfaces
```

## API Endpoints

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /api/tasks       | List tasks (filterable by status, priority, search) |
| GET    | /api/tasks/:id   | Get task by ID       |
| POST   | /api/tasks       | Create task          |
| PUT    | /api/tasks/:id   | Update task          |
| DELETE | /api/tasks/:id   | Delete task          |
| GET    | /api/health      | Health check         |

## Useful Commands

```bash
# Start without rebuilding
docker compose up

# Stop containers
docker compose down

# Stop and delete the database volume
docker compose down -v

# View backend logs live
docker compose logs -f backend
```

## Ports

| Service  | Port |
|----------|------|
| Frontend | 3000 |
| Backend  | 4000 |
| Database | 5432 |
