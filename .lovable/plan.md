
# Prompt 5: Home Page Component

## Overview
Replace the placeholder `src/pages/Index.tsx` with a full Home page dashboard that uses `useDashboardStatus` to display system status, quick actions, recent activity, and task overview.

## File to Modify

### `src/pages/Index.tsx`
Complete rewrite with the following sections:

### 1. Status Cards Row (3-column grid)
Three `Card` components in a responsive grid (`grid-cols-1 md:grid-cols-3`):

- **Gateway Status**: Shows `status` from the hook. Maps to a colored dot (green = "healthy", yellow = "degraded", red = "offline") with a `Wifi` icon. Displays the status text.
- **System Stats**: Shows placeholder CPU load and memory usage with a `Cpu` icon. (The dashboard API returns generic data; we'll extract what's available or show "--" if absent.)
- **Uptime**: Formats uptime from the dashboard data (or shows "--") with a `Clock` icon. If a numeric seconds/minutes value is available, format as "X days Y hours".

Each card uses `Skeleton` components while loading.

### 2. Quick Action Buttons Row
A flex row of three `Button` components:
- **"+ New Task"** -- navigates to `/tasks` (or opens a dialog in the future)
- **"+ New Note"** -- navigates to `/notes`
- **"Run Sync Now"** -- calls `api.getDashboard()` / `refetch()` to trigger a refresh

Uses `useNavigate` from React Router for navigation.

### 3. Active Work Section (2-column grid)

#### LEFT: Recent Activity
- `Card` with `ScrollArea` (max-height ~400px)
- Renders last 20 items from `activity` array
- Each item shows: timestamp (formatted with `date-fns`), level badge (`info` = default, `warning` = secondary/amber, `error` = destructive), and summary text
- Items are wrapped in `Collapsible` -- click to expand details
- The `useDashboardStatus` hook already polls every 5s, providing auto-updates

#### RIGHT: Task Overview
Three sub-cards stacked vertically:
- **In Progress**: Filters tasks where `column === 'doing'`, shows count + truncated list
- **Due Soon**: Filters tasks due within 48 hours (compares `dueDate` to now), shows count
- **High Priority**: Filters tasks where `priority === 'high'`, shows count

Each sub-card is clickable and navigates to `/tasks` using `useNavigate`.

### 4. Loading State
- When `loading` is true, render `Skeleton` placeholders matching the layout of each section
- Three skeleton cards at top, skeleton button row, two skeleton content areas below

### 5. Error State
- When `error` is truthy, show an error `Card` with `AlertCircle` icon, error message, and a "Retry" `Button` that calls `refetch()`

## Components Used (all existing)
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `Skeleton` from `@/components/ui/skeleton`
- `ScrollArea` from `@/components/ui/scroll-area`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Lucide icons: `Wifi`, `Cpu`, `Clock`, `Plus`, `RefreshCw`, `AlertCircle`, `ChevronDown`, `Activity`
- `useDashboardStatus` from `@/hooks/useDashboardStatus`
- `useNavigate` from `react-router-dom`
- `formatDistanceToNow` from `date-fns`

## Technical Notes
- The hook returns loosely typed `Record<string, unknown>` data. The component will safely access fields with optional chaining and fallbacks.
- No new files needed beyond modifying `Index.tsx`.
- No new dependencies required.
