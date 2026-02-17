

# Prompt 3: Main Layout & Navigation

## Overview
Create the Milo dashboard shell: a fixed sidebar with branding/navigation, a responsive main content area with header, and placeholder page components for each route. Apply the Solutionment design system colors.

## Design System Integration
Update CSS variables to reflect the Solutionment palette:
- Primary dark: #35495e (sidebar background, headings)
- Mid grey: #6e7d89 (muted text, borders)
- Amber accent: #f4af40 (active states, status indicators)
- Light grey: #f1f1f2 (main content background)
- Font: Lato (via Google Fonts import)

## Files to Create/Modify

### 1. `index.html`
- Add Google Fonts link for Lato (400, 600, 700)

### 2. `src/index.css`
- Update CSS variables to match Solutionment palette (dark sidebar, light content area, amber accent)
- Set font-family to Lato

### 3. `tailwind.config.ts`
- Add `fontFamily: { sans: ['Lato', ...] }`

### 4. `src/components/layout/DashboardLayout.tsx`
The main layout wrapper:
- Uses the shadcn `SidebarProvider` + `Sidebar` components
- Fixed left sidebar (~250px / w-60)
- Main content area fills remaining width
- Header bar showing current page title (derived from route)
- Mobile: sidebar collapses, hamburger trigger in header

### 5. `src/components/layout/AppSidebar.tsx`
Sidebar content:
- **Top**: "MILO" branding text + system status badge (green dot, hardcoded for now)
- **Nav items** using `NavLink` for active highlighting:
  - Home (`Home` icon) - `/`
  - Tasks (`CheckSquare` icon) - `/tasks`
  - Sessions (`MessageSquare` icon) - `/sessions`
  - Notes (`StickyNote` icon) - `/notes`
  - Agents (`Bot` icon) - `/agents`
  - Cron Jobs (`Clock` icon) - `/cron`
  - Search (`Search` icon) - `/search`
- **Bottom**: Logout button (no-op for now)
- Active route highlighted with amber accent
- Smooth transitions on hover/active states

### 6. Placeholder page components
Create minimal placeholder pages so routes render:
- `src/pages/Index.tsx` (update existing - "Home" dashboard)
- `src/pages/Tasks.tsx`
- `src/pages/Sessions.tsx`
- `src/pages/Notes.tsx`
- `src/pages/Agents.tsx`
- `src/pages/CronJobs.tsx`
- `src/pages/Search.tsx`

Each just renders `<h1>Page Name</h1>` as placeholder.

### 7. `src/App.tsx`
- Wrap all routes in `DashboardLayout`
- Add routes for `/tasks`, `/sessions`, `/notes`, `/agents`, `/cron`, `/search`
- Keep the `NotFound` catch-all

### 8. `src/App.css`
- Remove default Vite boilerplate styles (no longer needed)

## Technical Details

```text
App.tsx
  BrowserRouter
    SidebarProvider
      DashboardLayout
        AppSidebar (fixed left)
        main (flex-1)
          Header (page title + SidebarTrigger on mobile)
          Outlet / Routes
```

- Uses shadcn `Sidebar`, `SidebarMenu`, `SidebarMenuButton` components already in the project
- `NavLink` component (already exists) for active route highlighting
- `useLocation` to derive current page title for the header
- Mobile breakpoint: sidebar hidden, `SidebarTrigger` hamburger shown in header
- Smooth transitions via Tailwind `transition-all duration-200`

