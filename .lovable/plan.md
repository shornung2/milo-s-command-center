

# Prompt 11: Search Page

## Overview
Replace the placeholder `src/pages/Search.tsx` with a cross-source search interface featuring a large search input, source filters, and a results list with navigation.

## File to Modify

### `src/pages/Search.tsx`
Complete rewrite:

### 1. Search Input
- Large, centered `Input` with `Search` icon
- Placeholder: "Search notes, tasks, sessions..."
- 300ms debounced search using `useEffect` + `setTimeout`

### 2. Source Filters
- Row of `Checkbox` + label pairs for: Notes, Tasks, Sessions
- All checked by default
- Changing filters re-triggers search
- At least one source must be selected

### 3. Results Section
- Heading: "X results for 'query'"
- Each result rendered as a clickable card/row showing:
  - **Source badge** (`Badge` with variant per source type)
  - **Title** (bold)
  - **Snippet/preview** (truncated text, muted color)
  - **Relevance score** (small percentage or dot indicator, if present in data)
- Click navigates to the relevant page using `useNavigate`:
  - notes -> `/notes` (with query param or state for the note ID)
  - tasks -> `/tasks`
  - sessions -> `/sessions`
- Loading state: `Skeleton` result cards
- Empty state (no query): Centered "Start typing to search" with search icon
- No results state: "No results for 'query'"

### 4. Data Fetching
- `useQuery` calling `api.search(debouncedQuery, selectedSources, 50)`
- Enabled only when `debouncedQuery.length > 0` and at least one source selected
- Query key includes the debounced query and selected sources

### 5. Components Used (all existing)
- `Input` from `@/components/ui/input`
- `Checkbox` from `@/components/ui/checkbox`
- `Badge` from `@/components/ui/badge`
- `Card` from `@/components/ui/card`
- `Skeleton` from `@/components/ui/skeleton`
- `Label` from `@/components/ui/label`
- Lucide icons: `Search`, `FileText`, `CheckSquare`, `MessageSquare`
- `useQuery` from `@tanstack/react-query`
- `useNavigate` from `react-router-dom`

## Technical Details
- No API changes needed -- `api.search(query, sources, limit)` already exists in `api.ts`
- Source filter state is a `Record<string, boolean>` derived from the three source names
- The debounce clears its timeout on unmount and when the raw query changes
- Badge color per source: notes = default, tasks = secondary, sessions = outline
- Navigation on click uses `navigate('/notes')` etc. -- the destination pages can handle deep-linking later

