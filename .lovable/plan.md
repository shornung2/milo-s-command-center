
# Prompt 12: Shared Components

## Overview
Create 10 reusable wrapper components in `src/components/` that provide simplified, domain-specific APIs on top of the existing shadcn/ui primitives.

## Important Note
The project already has low-level shadcn/ui components in `src/components/ui/` (badge, button, card, dialog, input, textarea, skeleton). These new components will wrap those primitives with opinionated props and styling for the application's domain needs (e.g., semantic status variants, loading states, error handling patterns). Existing pages already import from `ui/` directly and will continue to work -- these shared components are for convenience in future development.

## Files to Create

### 1. `src/components/Badge.tsx`
- Props: `variant` (`primary` | `success` | `warning` | `error` | `info`), `children`, `className`
- Maps each variant to a Tailwind color class (e.g., success = green, error = red, warning = amber, info = blue, primary = uses theme primary)
- Wraps the shadcn `Badge` component from `ui/badge`, applying variant-specific `className`

### 2. `src/components/Button.tsx`
- Props: `variant` (`primary` | `secondary` | `danger`), `size` (`sm` | `md` | `lg`), `disabled`, `loading`, `children`, `className`, plus standard button HTML attributes
- Maps variant/size to shadcn `Button` variant/size props
- When `loading` is true: disables the button and prepends a `Loader2` spinning icon
- Wraps shadcn `Button` from `ui/button`

### 3. `src/components/Card.tsx`
- Props: `children`, `className`
- Simple wrapper around shadcn `Card` from `ui/card` with default rounded + shadow styling
- Passes through className for customization

### 4. `src/components/Modal.tsx`
- Props: `open`, `onClose`, `title`, `children`, `footer`
- Wraps shadcn `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` + `DialogFooter`
- Maps `open` to Dialog's `open` prop, `onClose` to `onOpenChange`
- Renders `title` in `DialogHeader`, `children` as body, `footer` in `DialogFooter`

### 5. `src/components/Input.tsx`
- Props: `label`, `placeholder`, `value`, `onChange`, `error`, `disabled`, `className`, `id`
- Renders a `Label` (from `ui/label`) above the shadcn `Input` (from `ui/input`)
- Shows error message below in red text when `error` is provided
- Adds red border styling when in error state

### 6. `src/components/Textarea.tsx`
- Props: same as Input but for multiline content
- Wraps shadcn `Textarea` from `ui/textarea`
- Same label + error pattern as Input component

### 7. `src/components/Loading.tsx`
- Props: `lines` (number, default 3)
- Renders N `Skeleton` bars (from `ui/skeleton`) with varying widths for a natural look
- Animated placeholder for loading states

### 8. `src/components/ErrorState.tsx`
- Props: `title` (default "Something went wrong"), `message`, `onRetry`
- Centered card with `AlertTriangle` icon, title, message text
- "Try Again" `Button` that calls `onRetry` (only shown if `onRetry` provided)

### 9. `src/components/Timestamp.tsx`
- Props: `ts` (ISO date string), `className`
- Uses `formatDistanceToNow` from `date-fns` with `addSuffix: true` for relative time (e.g., "2 hours ago")
- Shows full formatted date as a `title` attribute tooltip
- Renders as a `<time>` element with the `dateTime` attribute set

### 10. `src/components/StatusBadge.tsx`
- Props: `status` (`active` | `idle` | `error` | `offline`), `className`
- Renders a small colored circle (dot) + capitalized status text
- Color mapping: active = green, idle = yellow, error = red, offline = gray
- Uses inline flex layout with gap

## Technical Details
- All components are typed with TypeScript interfaces
- No changes to existing pages or ui/ components -- these are additive
- Components use `cn()` from `@/lib/utils` for class merging
- date-fns is already installed for the Timestamp component
- Lucide `Loader2` and `AlertTriangle` icons are already available
