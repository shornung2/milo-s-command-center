

# Milo Dashboard — Prompt 1 & 2: API Layer & Environment Setup

## Overview
Set up the foundational API client and environment configuration for communicating with the Openclaw backend.

## Step 1: Environment Variables
- Create `.env.local` with `VITE_DASHBOARD_API_URL` (defaulting to `http://localhost:3000`) and `VITE_DASHBOARD_TOKEN`
- Verify `vite.config.ts` properly exposes `VITE_` prefixed variables (Vite does this by default, but we'll confirm)

## Step 2: API Client (`src/lib/api.ts`)
A fully typed API module with the following endpoint methods:

**Dashboard**
- `getDashboard()` — fetch main dashboard overview data

**Tasks**
- `getTasks(column?, assignedTo?)` — list/filter tasks
- `createTask(taskData)` — create a new task
- `updateTask(taskId, updates)` — modify an existing task
- `assignTask(taskId, agentId, instructions?)` — assign task to a sub-agent
- `addTaskComment(taskId, text)` — add a comment to a task

**Notes**
- `getNotes(search?)` — list/search notes
- `createNote(noteData)` — create a note
- `updateNote(noteId, updates)` — update a note
- `deleteNote(noteId)` — delete a note

**Search & Analytics**
- `search(query, sources, limit)` — cross-source search
- `getAgentAnalytics(agentId)` — agent performance data
- `recordAgentTask(agentId, taskId, status, duration)` — log agent work

**Activity**
- `getSessions(limit)` — recent sessions
- `getActivity(limit)` — recent activity feed

## Design Decisions
- All methods return `{ ok: true, ...data }` on success or `{ ok: false, error: string }` on failure
- Every request includes `Authorization: Bearer <token>` header
- TypeScript interfaces for all request/response shapes
- Base URL defaults to `http://localhost:3000` if env var is unset
- Centralized fetch helper to reduce repetition across endpoints

