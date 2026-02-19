

# Connection Status Indicator and Enhanced Error/Loading States

## Overview

Add a live connection status indicator to the dashboard header, wrap each route in its own ErrorBoundary, and ensure the Tasks page has proper loading and error states.

## Changes

### 1. New Hook: `src/hooks/useConnectionStatus.ts`

A lightweight hook that pings the backend every 10 seconds to determine connectivity:
- Calls `api.getDashboard()` (or a lightweight endpoint) on an interval
- Exposes `status: "connected" | "disconnected" | "checking"` and `lastChecked: Date | null`
- Uses React Query with a dedicated query key so it doesn't interfere with other data fetching

### 2. Update `src/components/layout/DashboardLayout.tsx`

Add a connection status indicator to the header bar (next to the page title):
- Small colored dot + text: green "Connected", red "Disconnected", gray "Checking..."
- Uses the `useConnectionStatus` hook
- Subtle -- does not take up much space, just a badge in the header

### 3. Update `src/components/layout/AppSidebar.tsx`

Replace the hardcoded "Online" badge with a live badge driven by `useConnectionStatus`:
- Green "Online" when connected
- Red "Offline" when disconnected
- Amber "Checking" during initial check

### 4. Update `src/App.tsx`

Wrap each route element in its own `ErrorBoundary` so a crash on one page doesn't take down the whole app:
```
<Route path="/tasks" element={<ErrorBoundary><Tasks /></ErrorBoundary>} />
```

### 5. Update `src/hooks/useTasks.ts`

Wire up to the real API with mock data fallback:
- Use `useQuery` to fetch from `api.getTasks()`
- If the API call succeeds, use real data; if it fails, fall back to mock data
- Use `useMutation` for create, update, delete, and move operations
- Expose `isLoading` and `error` alongside the existing return values

### 6. Update `src/pages/Tasks.tsx`

Add loading skeleton and error state:
- Show a 4-column skeleton grid while loading (matching column layout)
- Show an error card with retry button if API fails and mock fallback is in use
- A small "Using offline data" badge when running on mock data

## Files Summary

| File | Action |
|---|---|
| `src/hooks/useConnectionStatus.ts` | Create -- connection health hook |
| `src/components/layout/DashboardLayout.tsx` | Update -- add connection indicator to header |
| `src/components/layout/AppSidebar.tsx` | Update -- live Online/Offline badge |
| `src/App.tsx` | Update -- per-route ErrorBoundary wrapping |
| `src/hooks/useTasks.ts` | Update -- add React Query with mock fallback |
| `src/pages/Tasks.tsx` | Update -- add loading skeleton and error state |

## Technical Notes

- The connection check reuses the existing `api.getDashboard()` call so no new endpoint is needed
- React Query's `refetchInterval` handles the polling automatically
- The mock fallback in useTasks ensures the Kanban board always works even without a backend
- Per-route ErrorBoundaries prevent one crashing page from taking down the whole dashboard
