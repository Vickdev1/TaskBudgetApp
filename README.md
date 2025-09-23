# TaskBudgetPlanner

Full-stack Task & Budget planner with gamification (Vanilla JS frontend + Node.js backend + PostgreSQL). Includes Docker setup.

## Features
- Register / login (JWT)
- Tasks: add / edit / complete / delete / filter by category
- Budget: add income/expense entries, balance, category summaries, filters
- Gamification: streak counter, badges (e.g., "Productive Planner")
- Five frontend pages: index, tasks, budget, achievements, profile

## Run (Docker)
1. Copy `.env.example` to `.env` inside `backend/` and set `JWT_SECRET` and DB values.
2. From project root:
   ```bash
   docker compose up --build