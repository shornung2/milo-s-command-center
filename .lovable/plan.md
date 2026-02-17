
# Prompt 4: System Status Hook

## Overview
Create a custom hook `src/hooks/useDashboardStatus.ts` that polls the `/api/dashboard` endpoint every 5 seconds using TanStack React Query (already installed). This leverages the existing `api.getDashboard()` method.

## Why TanStack React Query
The project already has `@tanstack/react-query` installed and configured with a `QueryClient` in `App.tsx`. Using `useQuery` gives us polling (`refetchInterval`), caching, retry logic, and cleanup on unmount -- all out of the box. No need to reinvent these with raw `useEffect`/`setInterval`.

## File to Create

### `src/hooks/useDashboardStatus.ts`
- Calls `api.getDashboard()` via `useQuery` with:
  - `queryKey: ['dashboard-status']`
  - `refetchInterval: 5000` (poll every 5s)
  - `retry: 3` with exponential backoff
  - `staleTime: 4000` (avoid redundant fetches within the polling window)
- Returns a typed object: `{ loading, error, status, kanban, tasks, notes, activity, refetch }`
- Exports a `DashboardStatus` interface for the expected API response shape
- Handles the `ok: false` error case from the API client by throwing so React Query treats it as an error

## Technical Details

```text
useDashboardStatus()
  -> useQuery({ queryFn: api.getDashboard, refetchInterval: 5000 })
  -> returns { loading, error, status, kanban, tasks, notes, activity, refetch }
```

- **Caching**: React Query deduplicates concurrent calls and caches results automatically
- **Cleanup**: React Query handles interval cleanup on unmount
- **Retry**: Built-in retry with backoff (3 attempts)
- **Error handling**: If `api.getDashboard()` returns `{ ok: false, error }`, the query function throws so React Query surfaces it via the `error` field
