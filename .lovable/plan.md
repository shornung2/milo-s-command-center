

# Prompt 13: Tailwind Setup

## Overview
Enhance the existing Tailwind configuration and global CSS to align with MILO branding (blues and purples), add custom animations, improve dark mode colors, switch the font to Inter, and add custom scrollbar styling.

## What Already Exists
- Dark mode is already enabled (`darkMode: ["class"]`)
- Light and dark CSS variables are defined in `src/index.css`
- Font is set to Lato
- Only accordion keyframes exist -- no fade, slide, or spin animations
- No scrollbar customization

## Changes

### 1. `tailwind.config.ts`

**Font**: Change from `Lato` to `Inter`.

**Colors**: Add a `milo` color scale for branding (blue-purple tones) as a new entry in `extend.colors`:
```
milo: {
  50:  "#eef2ff",
  100: "#e0e7ff",
  200: "#c7d2fe",
  300: "#a5b4fc",
  400: "#818cf8",
  500: "#6366f1",
  600: "#4f46e5",
  700: "#4338ca",
  800: "#3730a3",
  900: "#312e81",
  950: "#1e1b4b",
}
```

**Keyframes**: Add the following alongside the existing accordion ones:
- `fade-in`: opacity 0 + translateY(10px) to opacity 1 + translateY(0)
- `fade-out`: reverse of fade-in
- `scale-in`: scale(0.95) + opacity 0 to scale(1) + opacity 1
- `slide-in-right`: translateX(100%) to translateX(0)
- `slide-out-right`: translateX(0) to translateX(100%)
- `spin-slow`: rotate(0deg) to rotate(360deg) -- a slow continuous spin

**Animations**: Register each keyframe:
- `fade-in`: 0.3s ease-out
- `fade-out`: 0.3s ease-out
- `scale-in`: 0.2s ease-out
- `slide-in-right`: 0.3s ease-out
- `slide-out-right`: 0.3s ease-out
- `spin-slow`: 1.5s linear infinite

### 2. `src/index.css`

**Font import**: Replace Google Fonts link in `index.html` from Lato to Inter (weights 400, 500, 600, 700).

**Light mode CSS variables**: Shift primary toward blue-purple (MILO branding):
- `--primary`: change from `207 28% 29%` to `245 58% 51%` (indigo-purple)
- `--primary-foreground`: keep white
- `--accent`: shift from amber to a complementary purple-blue: `251 91% 65%`
- `--ring`: match new accent
- Update sidebar variables to use the new blue-purple tones

**Dark mode CSS variables**: Update to match:
- `--primary`: lighter indigo for dark backgrounds: `245 58% 65%`
- `--accent`: lighter purple: `251 91% 72%`
- `--ring`: match new accent
- Update sidebar variables for dark mode consistency

**Custom scrollbar styling**: Add in a new `@layer utilities` block:
```css
@layer utilities {
  /* Thin dark scrollbar */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.5);
  }
}
```

**Global scrollbar**: Apply thin scrollbar to body and all scrollable containers:
```css
@layer base {
  * {
    @apply border-border;
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}
```

Add base webkit scrollbar styles outside layers for global coverage.

### 3. `index.html`

Update the Google Fonts link from Lato to Inter:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

## Files Modified Summary
| File | Change |
|---|---|
| `tailwind.config.ts` | Add `milo` colors, new keyframes/animations, change font to Inter |
| `src/index.css` | Update color variables for blue-purple branding, add scrollbar styles |
| `index.html` | Switch font import from Lato to Inter |

## Technical Notes
- The `milo` color scale uses Tailwind's Indigo palette as a base, giving classes like `text-milo-500`, `bg-milo-100`
- Existing shadcn components will automatically pick up the new primary/accent colors via CSS variables
- The `tailwindcss-animate` plugin is already installed and handles the animation utility classes
- Dark mode toggle (if added later) will work via the existing `class` strategy
- No existing component files need changes -- they already reference CSS variable-based colors
