

# Connect Dashboard to OpenClaw Backend

## What's Needed

The app is already fully wired up with proper API calls, loading states, error handling, and retry logic on every page. The **only real blocker** is that the API URL defaults to `http://localhost:3000`, which is unreachable from the cloud preview.

## Changes

### 1. Update `src/lib/api.ts` (1 line change)

Change the default `BASE_URL` from `http://localhost:3000` to `http://187.77.27.177:3002`:

```ts
const BASE_URL = import.meta.env.VITE_DASHBOARD_API_URL || 'http://187.77.27.177:3002';
```

This is a public API URL so it's safe to hardcode as a fallback. The env var override still works if set.

### What's Already in Place (no changes needed)

| Requirement | Status |
|---|---|
| Loading states for data fetching | Already implemented on all pages (skeletons) |
| Error handling for failed API calls | Already implemented (`ApiResponse` type, error UI on every page) |
| Retry logic | Already configured via React Query (`retry: 3` on dashboard, default retry on others) |
| User feedback for connection states | Already shows error cards with "Retry" buttons |
| Dashboard endpoint `/api/dashboard` | Already wired in `useDashboardStatus` hook |
| Tasks endpoint `/api/tasks` | Already wired in `api.getTasks/createTask/updateTask` |
| Notes endpoint `/api/notes` | Already wired in Notes page with React Query |
| Activity endpoint `/api/activity` | Already wired in `api.getActivity` |
| Agent analytics `/api/agents` | Already wired per-agent in Agents page |
| Search endpoint `/api/search` | Already wired in Search page |
| TypeScript types for API responses | Already defined (`ApiResponse`, `TaskData`, `NoteData`, etc.) |

### 2. Potential CORS Issue

The backend at `http://187.77.27.177:3002` must allow requests from the Lovable preview origin. If it doesn't, requests will still fail. This is a backend configuration -- not something fixable in the frontend.

## Files Summary

| File | Action |
|---|---|
| `src/lib/api.ts` | Edit line 4 -- update default URL to `http://187.77.27.177:3002` |

