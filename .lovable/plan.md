

# Prompt 8: Notes Page

## Overview
Replace the placeholder `src/pages/Notes.tsx` with a two-panel notes interface following the same pattern as Sessions: a note list on the left and a note editor on the right, with responsive mobile stacking.

## File to Modify

### `src/pages/Notes.tsx`
Complete rewrite with the following structure:

### 1. Header Bar
- Search `Input` with magnifying glass icon (filters notes via `api.getNotes(search)` with debounced query)
- "+ New Note" `Button` that calls `api.createNote()` with a default title and selects the new note

### 2. Left Panel -- Note List (~300px, border-right)
- Fetched via `useQuery` calling `api.getNotes(debouncedSearch)`
- **Pinned notes first** (filtered by `pinned` flag), then remaining notes sorted by `updated_at` descending
- Each item shows: title (truncated), content snippet (first ~60 chars), timestamp (relative via `formatDistanceToNow`)
- Pin icon displayed on pinned notes
- Click to select and load into editor
- **Right-click context menu** using the existing `ContextMenu` component:
  - "Toggle Pin" -- calls `api.updateNote()` to flip the `pinned` flag
  - "Delete" -- calls `api.deleteNote()` with confirmation
- Selected note highlighted with accent background
- Loading state: skeleton items
- Empty state: "No notes yet" placeholder

### 3. Right Panel -- Note Editor (flex-1)
- **No note selected**: Centered placeholder "Select a note or create a new one"
- **Note selected**:
  - **Title**: Editable `Input` bound to local state
  - **Content**: `Textarea` (full height, monospace-optional) bound to local state
  - **Tags**: Row of `Badge` pills with an `Input` to add new tags and X buttons to remove
  - **Auto-save**: `useEffect` with 1-second debounce that calls `api.updateNote()` when title, content, or tags change (skip on initial load)
  - **Delete button**: Calls `api.deleteNote()`, clears selection
  - **Back button** (mobile only): Returns to list view

### 4. Responsive Behavior
- Mobile (`< md`): Toggle between list and editor using `showEditor` boolean state (same pattern as Sessions)
- Desktop: Side-by-side panels

### 5. State Management
- `useQuery` for notes list with search parameter
- `useMutation` for create, update, delete operations
- Local state for the editor fields (title, content, tags) synced from selected note
- Debounced search using a `useEffect` + `setTimeout` pattern (no new deps needed)
- Debounced auto-save using a similar `useEffect` + `setTimeout` pattern
- `useQueryClient` to invalidate notes list after mutations

## Components Used (all existing)
- `Input`, `Textarea` from `@/components/ui/`
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `ScrollArea` from `@/components/ui/scroll-area`
- `Skeleton` from `@/components/ui/skeleton`
- `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem` from `@/components/ui/context-menu`
- Lucide icons: `Search`, `Plus`, `Pin`, `Trash2`, `ArrowLeft`, `FileText`, `X`, `Loader2`
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`
- `formatDistanceToNow` from `date-fns`

## Technical Notes
- Auto-save skips firing on initial load by tracking a `dirty` flag or comparing against the original note data
- Debounce timeout is cleared on unmount and when note selection changes
- Delete mutation clears `selectedId` and invalidates the notes query
- The `NoteUpdate` type in `api.ts` already supports `title`, `content`, and `tags` -- no API changes needed
- Pin state is stored as a field on the note object; `updateNote` toggles it via `{ pinned: !current }`

