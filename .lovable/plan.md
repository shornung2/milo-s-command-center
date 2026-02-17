

# Tasks Page: Full Kanban Board

## Overview
Build a fully-featured Kanban board for the Tasks page with four columns (To Do, In Progress, Complete, Blocked), drag-and-drop support, and click-to-edit task cards.

## Architecture

Since we cannot add external drag-and-drop libraries (like `react-beautiful-dnd` or `dnd-kit`), we will use the **HTML5 Drag and Drop API** directly. This is zero-dependency and works well for a column-based Kanban layout.

The backend API may not be connected yet, so we will use **local state with mock data** as the default, while wiring up the real API calls so they work seamlessly once the backend is available.

## Files to Create/Modify

### 1. `src/pages/Tasks.tsx` (rewrite)

The main page component that:
- Manages task state (local array of tasks)
- Renders a header row with page title and "New Task" button
- Renders four `KanbanColumn` components side by side
- Handles drag-and-drop state (which task is being dragged)
- Opens a modal for creating new tasks
- Responsive: columns stack vertically on mobile, horizontal scroll on tablet, grid on desktop

### 2. `src/components/tasks/KanbanColumn.tsx` (create)

A single column that:
- Accepts a column ID (`todo`, `in-progress`, `complete`, `blocked`), title, color accent, and array of tasks
- Acts as a drop target (onDragOver, onDrop)
- Highlights when a card is dragged over it (visual drop indicator)
- Renders task count in the header
- Maps tasks to `TaskCard` components
- Shows an empty state message when no tasks exist

### 3. `src/components/tasks/TaskCard.tsx` (create)

A draggable task card that:
- Displays title, truncated description, priority badge, and assignee
- Is draggable (draggable attribute + onDragStart)
- Visual feedback while dragging (reduced opacity)
- Clicking the card opens it in an expanded/edit modal
- Shows priority as a colored badge (high = red, medium = amber, low = green)
- Shows assignee avatar/name if assigned
- Responsive sizing

### 4. `src/components/tasks/TaskModal.tsx` (create)

A modal dialog (using existing `Modal` component) for viewing/editing a task:
- Opens when clicking a task card OR the "New Task" button
- **View mode**: shows all task details (title, description, priority, column, assignee, comments)
- **Edit mode**: inline editing -- click any field to edit it in place
- Fields: title (text input), description (textarea), priority (select: low/medium/high), assignee (select from agent IDs)
- Save and Cancel buttons in footer
- Delete button with confirmation
- Calls `api.updateTask` / `api.createTask` on save

### 5. `src/hooks/useTasks.ts` (create)

A custom hook that:
- Uses `useQuery` to fetch tasks from `api.getTasks()`
- Provides `useMutation` wrappers for create, update, and delete
- Falls back to mock seed data when the API is unreachable (so the board works without a backend)
- Exposes: `tasks`, `isLoading`, `createTask`, `updateTask`, `moveTask` (shortcut for updating column)

### 6. `src/types/task.ts` (create)

Shared TypeScript interfaces:
```
interface Task {
  id: string;
  title: string;
  description?: string;
  column: "todo" | "in-progress" | "complete" | "blocked";
  priority: "low" | "medium" | "high";
  assignedTo?: AgentId;
  createdAt: string;
  updatedAt?: string;
  comments?: TaskComment[];
}

interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
}
```

## Drag and Drop Implementation

Using HTML5 native drag-and-drop:

1. **TaskCard** sets `draggable="true"` and `onDragStart` stores the task ID in `dataTransfer`
2. **KanbanColumn** handles `onDragOver` (preventDefault to allow drop) and `onDrop` (reads task ID, calls `moveTask`)
3. Visual feedback: dragging card gets `opacity-50`, hovered column gets a highlighted border/background
4. On drop, the task's `column` field is updated (optimistic update in local state + API call)

## Responsive Layout

- **Desktop (>=1024px)**: 4-column grid, all columns visible
- **Tablet (>=768px)**: horizontal scroll with snap, columns are min-width cards
- **Mobile (<768px)**: columns stack vertically, each collapsible with task count header

## Mock Seed Data

6-8 sample tasks spread across the 4 columns so the board looks populated out of the box, with varied priorities and some with assignees.

## Visual Design

- Column headers: colored top border (blue for To Do, amber for In Progress, green for Complete, red for Blocked)
- Cards: white/card background, subtle shadow, rounded corners, hover lift effect
- Priority badges use the existing `Badge` component with variant mapping
- Drag ghost uses the browser's default drag image
- Drop zone highlight: dashed border + light background tint
- Uses existing `milo` color palette for accents

## Files Summary

| File | Action |
|---|---|
| `src/types/task.ts` | Create -- shared Task types |
| `src/hooks/useTasks.ts` | Create -- data fetching + mutations with mock fallback |
| `src/components/tasks/KanbanColumn.tsx` | Create -- droppable column |
| `src/components/tasks/TaskCard.tsx` | Create -- draggable card |
| `src/components/tasks/TaskModal.tsx` | Create -- view/edit modal |
| `src/pages/Tasks.tsx` | Rewrite -- full Kanban board page |

## Technical Notes
- HTML5 Drag and Drop API works in all modern browsers without dependencies
- Optimistic updates: move the card in local state immediately, then sync with API
- The `useTasks` hook uses React Query for caching and refetching
- Mock data uses `crypto.randomUUID()` for IDs
- Mobile touch drag-and-drop is limited with HTML5 DnD; as a fallback, task cards will have a "Move to..." dropdown menu for mobile users
- All components use existing shadcn/ui primitives and the project's design system

