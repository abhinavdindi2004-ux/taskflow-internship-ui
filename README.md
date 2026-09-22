# TaskFlow — Full-Stack Internship Project

TaskFlow is a responsive project-management dashboard backed by a small Express REST API. It implements the original user stories and now persists task creation and completion state in `data/tasks.json`.

## User stories

- As a team member, I want to see my open tasks, due-soon work, and completed work at a glance so I can prioritize my day.
- As a team member, I want to filter tasks by all, today, and upcoming so I can focus on the work that matters now.
- As a team member, I want to mark tasks complete so that my progress stays up to date.
- As a team member, I want to create a task with a name and project so I can capture new work without leaving my dashboard.
- As a team member, I want to see recent team activity so I can stay informed about project changes.
- As a project lead, I want to see project progress, team members, and due dates so I can understand delivery health quickly.
- As a mobile user, I want the dashboard to adapt to smaller screens and provide accessible navigation so I can work from anywhere.

## Backend functionality

- `GET /api/health` — service health check.
- `GET /api/tasks` — returns tasks, with optional `status` and `due` filters.
- `POST /api/tasks` — validates and persists a new task.
- `PATCH /api/tasks/:id` — validates and persists completion status.
- JSON file persistence in `data/tasks.json`, with generated IDs and timestamps.
- Static hosting serves the existing front-end from the same Express process.

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000. For development with automatic restarts, use `npm run dev` on Node 18+.

## Screenshots

The `screenshots/` directory contains desktop and mobile visual captures for the submitted application screens.

## Tech stack

HTML5 · CSS3 · Vanilla JavaScript · Node.js · Express
