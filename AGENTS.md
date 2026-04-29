# Dayline — Agent Operating Contract

Single source of truth for Claude Code, Codex, OpenCode, and any agentic coding assistant.

## Project

Dayline: minimal daily planning app — tasks, habits, events, calendar sync (Google + Microsoft).  
Stack: `admin-panel/` (React 19 / Vite / TS / TanStack Router / Tailwind 4 / Lucide) + `server/` (NestJS / TS).

## Context Before Any Change

If Serena MCP is available, query memories `project_overview`, `code_style`, `task_completion` first — they summarize the rules and save file reads.

Read `docs/ai/` files only for the domain the task actually touches:

- Frontend (`admin-panel/`) → `docs/ai/FRONTEND_RULES.md`
- Backend (`server/`) → `docs/ai/BACKEND_RULES.md`
- Frontend↔backend boundary → `docs/ai/API_CONTRACT_RULES.md`
- Calendar / OAuth → `docs/ai/CALENDAR_SYNC_RULES.md`
- Naming / domain model → `docs/ai/SEMANTIC_CODE_STANDARD.md`
- Writing or modifying tests → `docs/ai/TESTING_RULES.md`
- Auth / OAuth / sessions / secrets / tokens → `docs/ai/SECURITY_RULES.md`
- Modifying `package.json` scripts → `docs/ai/PACKAGE_SCRIPT_RECOMMENDATIONS.md`
- Finishing any non-trivial change → `docs/ai/REVIEW_CHECKLIST.md`

Do not read all files for every task. Read only what the task domain requires.

## Product Rules

Dayline is not Jira, Notion, Linear, or a team suite. Protect that shape.

Every change must pass all four:

- Makes the user's day clearer?
- Keeps tasks, habits, events, and calendars understandable together?
- Preserves minimal, calm UX?
- Can a first-time user understand it without documentation?

If the answer is weak, implement the smaller version or stop and explain the concern.

## Domain Vocabulary

`Task` · `Habit` · `PlannerEvent` · `ExternalCalendarEvent` · `CalendarConnection` · `CalendarAccount`  
`CalendarSource` (`dayline` | `google` | `microsoft`) · `RecurringRule` · `TodayTimelineItem` · `UpcomingTimelineItem`

## Code Rules

- Explicit TypeScript types everywhere. No implicit `any`.
- Names must describe domain intent, not implementation mechanics.
- Avoid: `Data`, `Item`, `Helper`, `Manager`, `Utils`, `Handler`, `Temp`, `NewComponent`.
- Small modules. Thin controllers. Clear DTO boundaries.
- No comments unless the WHY is non-obvious (hidden constraint, subtle invariant, workaround).
- No new dependencies without justification. No unrelated refactors.

## Frontend (`admin-panel/`)

- React functional components. TanStack Router — route files stay thin.
- Tailwind 4 semantic tokens from `src/styles.css` only. No arbitrary colors. No other icon library than Lucide React.
- Typed API layer under `src/api/`. No raw `fetch()` scattered in components.
- Explicit UI states: `idle` · `loading` · `success` · `empty` · `error`. Do not overload `null`.
- No OAuth tokens, refresh tokens, authorization codes, or provider secrets in browser storage.

## Backend (`server/`)

- NestJS module / service / controller boundaries. Controllers stay thin — parse, call service, return DTO.
- Provider-specific calendar code stays behind adapters and normalizers. The rest of the backend uses normalized Dayline types.
- Explicit request/response DTOs. Never return tokens, secrets, or raw provider payloads.
- API prefix: `/api/v1`. Resource-oriented route names.
- Session-backed flows are acceptable (`express-session` is available). Do not store OAuth credentials in session if they must survive browser restart.

## Security

- Calendar tokens are backend-owned. Never expose to the frontend.
- No secrets, `.env` values, or provider credentials in browser storage or committed files.
- Disconnect flows must invalidate or delete backend-owned provider credentials.

## Scope Discipline

Inspect existing code before editing. Make the smallest correct change. Preserve current architecture unless it is clearly broken.

Do not add features, refactor unrelated code, or introduce dependencies beyond what the task explicitly requires.

## Verification

```bash
# Frontend
cd admin-panel && npm run lint && npm run test && npm run build

# Backend
cd server && npm run lint && npm run test && npm run build
```

Run the narrowest useful command first during development. Run the full set before finalizing any change.  
If a command cannot be run, say why. Do not claim verification that did not happen.

## Finish Every Task With

Files changed · Behavior changed · Checks run · Checks not run (reason) · Any real risk or follow-up  
Do not produce vague summaries. Name the concrete change.
