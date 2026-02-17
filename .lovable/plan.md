

# Prompt 7: Sessions List and Chat

## Overview
Replace the placeholder `src/pages/Sessions.tsx` with a two-panel chat interface: a session list on the left and a message thread on the right. Also add two missing API methods to `src/lib/api.ts`.

## Files to Modify

### 1. `src/lib/api.ts`
Add two new methods to the `api` object:

- **`getSessionHistory(sessionId: string)`** -- `GET /api/sessions/:id/history`
- **`sendToSession(sessionId: string, message: string)`** -- `POST /api/sessions/:id/messages` with `{ message }` body

### 2. `src/pages/Sessions.tsx`
Complete rewrite with the following structure:

#### Left Panel -- Session List (~300px, border-right)
- "Active Sessions" header
- Search `Input` at top that filters sessions by name/key client-side
- Scrollable list of session items fetched via `useQuery` calling `api.getSessions()`
  - `refetchInterval: 5000` for auto-refresh
  - Each item shows: session name/key, status badge (active = green, ended = muted), unread count badge (if > 0)
  - Clicking a session sets it as the selected session
  - Selected session highlighted with accent background
- Loading state: skeleton list items
- Empty state: "No sessions found"

#### Right Panel -- Chat View (flex-1, remaining width)
- **No session selected**: Centered placeholder text "Select a session to view messages"
- **Session selected**:
  - **Header**: Session key/name + status badge, top border-bottom
  - **Message thread**: `ScrollArea` filling available height
    - Fetched via `useQuery` calling `api.getSessionHistory(sessionId)`, enabled only when a session is selected
    - Messages displayed in alternating layout: user messages right-aligned (primary bg), assistant messages left-aligned (muted bg)
    - Each message shows timestamp (formatted with `date-fns`)
    - Auto-scroll to bottom on new messages using a `useEffect` + `useRef` on the scroll container
  - **Input area**: Fixed at bottom of the panel
    - `Input` component for text entry
    - `Send` button (with `Send` lucide icon)
    - Uses `useMutation` to call `api.sendToSession()`
    - Button shows `Loader2` spinner + "Sending..." while mutation is pending
    - On success, invalidate the session history query to show the new message
    - Enter key submits

#### Responsive Behavior
- On mobile (`< md`), show only the session list initially; selecting a session switches to the chat view with a back button to return to the list
- On desktop, both panels shown side by side

## Components Used (all existing)
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from `@/components/ui/card`
- `Button` from `@/components/ui/button`
- `Badge` from `@/components/ui/badge`
- `Input` from `@/components/ui/input`
- `ScrollArea` from `@/components/ui/scroll-area`
- `Skeleton` from `@/components/ui/skeleton`
- Lucide icons: `Search`, `Send`, `Loader2`, `MessageSquare`, `ArrowLeft`
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`
- `format` from `date-fns`

## Technical Notes
- Session list and history queries use the same `request()` helper pattern, returning loosely typed data with safe optional chaining
- The `useRef` + `scrollIntoView` pattern ensures auto-scroll to the latest message whenever the history data changes
- Mobile view toggle managed via a simple `boolean` state (`showChat`) rather than routes, keeping it on the same `/sessions` route
