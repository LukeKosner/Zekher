# Classroom UI Standards

Use these standards for all classroom routes and components.

## Header and Breadcrumb Standard

- Classroom uses the global app header (`PageHeader`) only.
- Do not add a second in-page header for classroom routes.
- Classroom context is shown through breadcrumb updates in the global header.
- `/classroom` redirects to the student join flow (`/classroom/join`).
- Keep classroom page titles in content areas (forms/landing blocks) at `text-2xl font-semibold`.

## Visual Style Standard

- Prefer `Card` surfaces for entry forms, dashboard modules, and overlays.
- Use `bg-muted/20` for classroom workspace backgrounds and `bg-card` for primary content panes.
- Keep key page content in centered containers:
  - `max-w-md` for auth/join forms
  - `max-w-6xl` to `max-w-7xl` for teacher dashboards and live/history workspaces
- Use `Badge` for compact class/session status signals (live, ended, counts).
- For lists and feeds, use rounded bordered rows (`rounded-lg border`) instead of plain text blocks.

## Height and `min-h` Standard

- Top-level classroom route container must be:
  - `flex h-full min-h-0 flex-col`
- Do not use viewport-height classes (`h-[100dvh]`, `min-h-screen`) inside classroom routes.
- For flexible content areas, use:
  - `flex-1 min-h-0`
- For scroll regions inside flex layouts, use:
  - `overflow-auto` on the scrolling pane
  - `min-h-0` on parent flex containers to prevent overflow bugs

## Common Page Structure

```tsx
<div className="flex h-full min-h-0 flex-col">
  <div className="flex-1 min-h-0 ...">...</div>
</div>
```

## Rationale

- Matches existing app behavior where shell/layout controls viewport sizing.
- Prevents nested viewport-height conflicts and clipped/overflowing content.
- Keeps classroom aligned with one shared header pattern and route-driven breadcrumbs.
