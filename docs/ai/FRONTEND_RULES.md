# Frontend Agent Rules

Applies to `admin-panel/`.

The frontend is a React 19 + Vite + TypeScript + TanStack Router + Tailwind CSS 4 application. It should feel minimal, fast, and precise.

## Product UX Rule

Every screen should have one primary job.

If a screen starts showing too many competing concepts, split the surface or reduce the feature.

The default product question is:

> What does my day look like?

UI work should make that answer easier, not more decorative.

## Directory Intent

Use the existing repo structure first. If structure is missing, prefer this shape:

```txt
admin-panel/src/
  api/
    http-client.ts
    calendar.api.ts
    tasks.api.ts
    habits.api.ts
    planner-events.api.ts
  components/
    ui/
    layout/
  features/
    calendar/
      components/
      hooks/
      calendar.types.ts
    tasks/
      components/
      hooks/
      task.types.ts
    habits/
      components/
      hooks/
      habit.types.ts
    today/
      components/
      today-timeline.types.ts
  routes/
  styles.css
```

Do not create a global dumping ground such as `components/common` unless the component is genuinely cross-feature UI.

## Component Rules

Components should be small and semantic.

A component may contain:

- Presentation logic.
- Local UI state.
- Event handlers scoped to that component.

A component should not contain:

- Provider payload normalization.
- Raw fetch calls scattered across JSX.
- Calendar OAuth details.
- Large business workflows.
- Hard-coded test data unless it is clearly local fixture code.

Prefer composition over configuration-heavy mega-components.

## Route Rules

TanStack Router route files should remain thin.

Allowed in route files:

- Route declaration.
- Loader wiring when needed.
- Search param parsing when needed.
- Composition of feature-level components.

Avoid in route files:

- Large JSX trees.
- API normalization.
- Business rules.
- Provider-specific logic.

## Data Fetching Rules

Use a small typed API layer under `src/api/` or feature-scoped API files.

Do not scatter `fetch()` calls through components.

All API calls must:

- Use typed request/response shapes.
- Use `credentials: 'include'` when the backend session requires cookies.
- Accept an optional `AbortSignal` for cancellable UI flows.
- Throw a typed or normalized error shape.
- Avoid returning raw `Response` objects to components.

Example shape:

```ts
export type CalendarConnectionResponse = {
  readonly id: string
  readonly provider: 'google' | 'microsoft'
  readonly email: string
  readonly connectedAt: string
}

export async function listCalendarConnections(signal?: AbortSignal): Promise<CalendarConnectionResponse[]> {
  return apiGet<CalendarConnectionResponse[]>('/api/v1/calendar/connections', { signal })
}
```

## Browser Storage Policy

Do not store secrets in browser storage.

Never store:

- Access tokens.
- Refresh tokens.
- OAuth authorization codes.
- Client secrets.
- Provider secrets.
- Raw provider payloads containing private metadata.
- Calendar write tokens.

Allowed only when needed:

- Safe UI preferences.
- Selected visible calendar IDs if they are Dayline-owned IDs and not provider secrets.
- Dismissed local UI notices.

Even safe browser storage should not be the source of truth for server-side operations.

## Styling Rules

Use Tailwind utilities and semantic tokens from `src/styles.css`.

Use color surgically:

- Neutral surfaces for normal UI.
- Success only for completion/connected states.
- Error only for destructive or failed states.
- Muted text for secondary information.

Avoid:

- Arbitrary color classes unless extending the design system intentionally.
- Loud gradients.
- Heavy shadows.
- Excessively rounded cards.
- Dashboard-style chart blocks.
- Decorative empty states that compete with content.

## UI State Rules

Represent UI states explicitly:

- `idle`
- `loading`
- `success`
- `empty`
- `error`

Do not overload `null` or empty arrays to mean multiple states.

## Form Rules

Forms should be direct.

- Use clear labels.
- Show validation near the field.
- Disable submit only when it prevents duplicate or invalid submissions.
- Keep destructive actions explicit.
- Confirmation copy must be short and specific.

## Calendar UX Rules

Calendar UX must make source and ownership clear.

The user should understand whether an item is:

- Dayline-created.
- Synced from Google Calendar.
- Synced from Microsoft Calendar.

External events are visible in Dayline but should not silently become Dayline tasks.

## Icon Rules

Use Lucide React.

Do not mix icon libraries.

Icons should clarify state or action, not decorate every label.

## Accessibility Rules

Implement normal accessibility, not performative accessibility.

- Buttons must be buttons.
- Interactive divs are not acceptable.
- Inputs need labels.
- Keyboard interaction should work for dialogs, menus, and destructive actions.
- Focus states must remain visible.
- Color must not be the only state indicator.

## Testing Rules

Use Vitest and Testing Library for behavior that matters.

Test:

- Data transformation.
- Conditional rendering states.
- Form behavior.
- Calendar connection/disconnection flows.
- Source-label rendering for Google/Microsoft/Dayline items.

Avoid snapshot-heavy tests that lock in meaningless markup.

## Performance Rules

Do not optimize prematurely, but avoid obvious waste.

- Do not refetch calendar events on every render.
- Debounce user-triggered search/filter input where needed.
- Use route loaders or scoped hooks thoughtfully.
- Keep expensive timeline transformations outside render when data is large.

## Anti-Patterns

Do not introduce:

- Global state for small local UI concerns.
- One huge `Dashboard` component.
- Components named after layout only when they actually own product behavior.
- CSS files per component unless Tailwind and semantic classes are insufficient.
- Raw provider payloads in JSX.
