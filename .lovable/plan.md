

# Prompt 9: Agents Dashboard

## Overview
Replace the placeholder `src/pages/Agents.tsx` with a full agent analytics dashboard featuring a responsive card grid, a detail modal with chart and task table, and auto-refreshing data.

## File to Modify

### `src/pages/Agents.tsx`
Complete rewrite with the following structure:

### 1. Data Fetching
- Define the agent list from the `AgentId` type: `['milo', 'analyst', 'author', 'comms', 'docs', 'researcher']`
- Use `useQueries` from `@tanstack/react-query` to call `api.getAgentAnalytics(agentId)` for each agent in parallel
- Set `refetchInterval: 10000` for auto-refresh every 10 seconds
- Derive loading/error states from the combined queries

### 2. Top Section -- Global Stats
- A row of summary cards showing:
  - **Total Tasks**: Sum of all completed + failed tasks across agents
  - **Global Success Rate**: Weighted average success rate, color-coded (green > 90%, yellow > 70%, red otherwise)
- Uses `Card` components, displayed while data is available

### 3. Agent Cards Grid
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Each card (`Card` component) shows:
  - **Agent name** as `CardTitle` (capitalized)
  - **Status badge**: `idle` (muted), `running` (green/default), `error` (destructive)
  - **Success rate**: Large text, color-coded with the same green/yellow/red thresholds
  - **Stats list**: Tasks completed, failures, average duration (formatted as minutes), last task time (relative via `formatDistanceToNow`)
  - **Error patterns**: If present, a small list of pattern + count (e.g., "timeout: 3x")
  - Card is clickable -- sets the selected agent to open the detail modal
- Loading state: Grid of `Skeleton` cards
- Error state: Error card with retry

### 4. Detail Modal (Dialog)
- Opens when an agent card is clicked, using the `Dialog` component
- **Header**: Agent name + status badge
- **Chart**: Task history over time using `recharts` (`BarChart` or `LineChart`)
  - X-axis: dates, Y-axis: count
  - Two series: successes (green) and failures (red)
  - Uses `ResponsiveContainer`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- **Task Table**: Last 10 tasks displayed in a `Table` with columns:
  - Task ID, Status (badge), Duration (formatted), Date (formatted)
- **Export button**: Downloads the agent's analytics data as a JSON file using `URL.createObjectURL` + `Blob`
- **Close button**: Closes the dialog

### 5. Helper Functions
- `getSuccessRateColor(rate: number)`: Returns tailwind text color class based on thresholds
- `formatDuration(ms: number)`: Converts milliseconds to "Xm Ys" format
- `exportAsJson(data, filename)`: Creates and triggers a JSON file download

## Components Used (all existing)
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Button` from `@/components/ui/button`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from `@/components/ui/dialog`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- `Skeleton` from `@/components/ui/skeleton`
- `ScrollArea` from `@/components/ui/scroll-area`
- Recharts: `ResponsiveContainer`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`
- Lucide icons: `Bot`, `Download`, `Activity`, `AlertTriangle`, `Loader2`
- `useQueries`, `useQueryClient` from `@tanstack/react-query`
- `formatDistanceToNow`, `format` from `date-fns`

## Technical Notes
- `useQueries` maps over the agent ID array, producing one query per agent -- all run in parallel and refresh independently
- The API returns loosely typed data; the component uses safe optional chaining and sensible fallbacks throughout
- The recharts library is already installed as a dependency
- No API changes needed -- `getAgentAnalytics(agentId)` already exists in `api.ts`
- The JSON export creates an object URL, triggers a click on a temporary anchor element, then revokes the URL

