

# Prompt 14: App Router and Navigation

## Current State

Almost everything requested is already implemented:

- React Router v6 is in use with `BrowserRouter`, `Routes`, `Route`
- All 7 routes are defined (`/`, `/tasks`, `/sessions`, `/notes`, `/agents`, `/cron`, `/search`)
- `DashboardLayout` wraps all routes (provides header + sidebar)
- 404 catch-all route exists with `NotFound` page

The one missing piece is an **error boundary**.

## Changes

### 1. Create `src/components/ErrorBoundary.tsx`

A React class component (error boundaries require class components) that:
- Catches runtime errors in the component tree
- Displays a friendly error screen with the error message
- Provides a "Try Again" button that resets the error state
- Uses existing `ErrorState` component or a similar layout

### 2. Update `src/App.tsx`

- Wrap the route content with the new `ErrorBoundary` component (inside `BrowserRouter` so it can still use navigation)
- No other structural changes needed since routing, layout, and 404 are already correct

### 3. Update `src/pages/NotFound.tsx` (minor)

- Remove `min-h-screen` since it renders inside `DashboardLayout` which already handles full-height layout
- Use a `Link` component instead of a raw `<a>` tag for client-side navigation

## Files Summary

| File | Action |
|---|---|
| `src/components/ErrorBoundary.tsx` | Create -- class component error boundary |
| `src/App.tsx` | Edit -- wrap routes with `ErrorBoundary` |
| `src/pages/NotFound.tsx` | Edit -- minor layout and navigation fix |

## Technical Notes
- Error boundaries must be class components (React limitation)
- The boundary resets its state when the user clicks "Try Again", allowing re-render
- Placing the boundary inside `BrowserRouter` but outside `DashboardLayout` means navigation errors are also caught
- No new dependencies needed

