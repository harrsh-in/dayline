# Dayline Agent Operating Contract

This file is the root instruction set for Codex, Claude, and any other agentic coding assistant working in this repository.

Dayline is a calm daily planning product. The codebase must protect that product shape: tasks, habits, events, and connected calendars should help the user understand their day without turning the app into a heavy productivity operating system.

## Required Reading Before Any Code Change

Before modifying code, read these files in this order:

1. `README.md` — product overview and scope.
2. `AGENTS.md` — root product guidance and agent rules.
3. `docs/DESIGN_CONTRACT.md` — visual and engineering contract.
4. `docs/ai/SEMANTIC_CODE_STANDARD.md` — naming, structure, and domain language.
5. One of:
   - `docs/ai/FRONTEND_RULES.md` for changes under `admin-panel/`.
   - `docs/ai/BACKEND_RULES.md` for changes under `server/`.
6. `docs/ai/API_CONTRACT_RULES.md` for frontend/backend boundary changes.
7. `docs/ai/CALENDAR_SYNC_RULES.md` for Google/Microsoft calendar changes.

If a file is missing, do not invent its contents. Inspect the current repository and proceed with the closest available contract.

## Product Guardrails

Dayline is not Jira, Notion, Linear, a CRM, or a team collaboration suite. Do not add project-management concepts unless explicitly requested.

Every change must pass this product test:

- Does it make the user's day clearer?
- Does it keep tasks, habits, events, and calendars understandable together?
- Does it preserve a minimal, calm UX?
- Does it avoid turning planning into another task?
- Can a first-time user understand the behavior without documentation?

If the answer is weak, implement the smaller simpler version or stop and explain the concern.

## Implementation Principles

Write semantic code. Names should describe domain intent, not implementation mechanics.

Prefer names like:

- `Task`
- `Habit`
- `PlannerEvent`
- `CalendarConnection`
- `CalendarAccount`
- `ExternalCalendarEvent`
- `RecurringRule`
- `TodayTimelineItem`

Avoid names like:

- `Data`
- `Item`
- `Thing`
- `Obj`
- `Handler`
- `Manager`
- `Helper`
- `Utils`
- `Temp`
- `NewComponent`

Implementation must be explicit, typed, and boring. Do not hide complexity inside vague abstractions.

## Agent Workflow

For every non-trivial task:

1. Inspect existing code before editing.
2. Identify the smallest correct change.
3. Preserve current architecture unless it is clearly broken.
4. Avoid unrelated refactors.
5. Avoid new dependencies unless they remove real complexity and are approved by the task.
6. Keep frontend and backend contracts aligned.
7. Run the relevant checks when possible.
8. Report exactly what changed and what could not be verified.

Do not modify generated files unless the project workflow requires it. If a router tree, build artifact, or generated type file exists, update it through the appropriate script when available.

## Scope Discipline

Do not expand scope silently.

If asked to add calendar event creation, do not also add reminders, tagging, color systems, analytics, sharing, templates, or import/export unless explicitly requested.

If asked to improve a screen, do not rewrite the entire app shell unless the change requires it.

If asked to fix a backend route, do not introduce a new persistence layer, auth system, or service boundary unless the route cannot be made correct without it.

## Frontend Rules Summary

The frontend lives in `admin-panel/` and uses React, Vite, TypeScript, TanStack Router, Tailwind CSS 4, and Lucide icons.

Follow `docs/ai/FRONTEND_RULES.md`.

Key constraints:

- Route files should stay thin.
- Components should be small and semantic.
- Styling must use existing semantic tokens from `admin-panel/src/styles.css`.
- Use Lucide React for icons.
- Do not use arbitrary decorative colors.
- Do not store OAuth tokens, refresh tokens, access tokens, provider secrets, or calendar write identifiers in browser storage.
- Use browser storage only for safe UI preferences when needed.

## Backend Rules Summary

The backend lives in `server/` and uses NestJS.

Follow `docs/ai/BACKEND_RULES.md`.

Key constraints:

- Keep controllers thin.
- Put business logic in services.
- Keep provider-specific calendar logic behind provider adapters.
- Never expose provider tokens to the frontend.
- Do not leak Microsoft/Google implementation details into generic Dayline APIs.
- Use clear DTO boundaries.
- Prefer explicit error handling over silent fallbacks.

## API Boundary Rules

Frontend models and backend models are not automatically the same thing.

Use explicit API response shapes. Calendar provider objects should be normalized before they reach the frontend.

The frontend should not need to know raw Microsoft Graph or Google Calendar payload structures except inside explicitly isolated debugging tools, and those should not be part of normal product UX.

## Design Contract

Dayline uses a modern monochrome aesthetic. The UI should be content-first, high-contrast, restrained, and surgical with color.

Do not introduce:

- Loud gradients.
- Overdesigned cards.
- Heavy borders.
- Dashboard clutter.
- Random color palettes.
- Decorative illustrations that compete with planning content.
- Gamified productivity patterns unless explicitly requested.

## Testing and Verification

Use the scripts already present in each package.

Frontend:

```bash
cd admin-panel
npm run lint
npm run test
npm run build
npm run check
```

Backend:

```bash
cd server
npm run lint
npm run test
npm run build
```

Run the narrowest useful command first while developing. Before finalizing a larger change, run the full relevant set when feasible.

If a command cannot be run, say why. Do not claim verification that did not happen.

## Dependency Policy

Do not add a dependency for code that can be written clearly in a few lines.

A new dependency is acceptable only when it is:

- Actively maintained.
- Commonly used in production.
- Compatible with the current stack.
- Smaller than the complexity it removes.
- Justified in the final response.

Do not add UI libraries beyond the current Tailwind/Lucide direction unless explicitly approved.

## Security Rules

Never commit secrets, tokens, `.env` values, client secrets, OAuth refresh tokens, private keys, or real provider credentials.

Calendar tokens must be backend-owned. The browser may hold session state and safe UI preferences, not provider credentials.

Disconnect flows must invalidate or delete backend-owned provider credentials and make reconnect behavior predictable.

## Final Response Requirements for Agents

When finishing a coding task, report:

- Files changed.
- Behavior changed.
- Checks run.
- Checks not run, with the reason.
- Any risk or follow-up that actually matters.

Do not produce vague summaries like “made improvements.” Name the concrete change.
