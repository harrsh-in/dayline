# Code Style and Conventions

## Language
TypeScript throughout. Explicit types always. No implicit `any`.

## Domain Vocabulary (use exactly these names)
- `Task` — work the user intends to complete
- `Habit` — a routine the user repeats and checks off
- `PlannerEvent` — a scheduled Dayline-owned event
- `ExternalCalendarEvent` — event imported from Google or Microsoft
- `CalendarConnection` — a user's connected provider account
- `CalendarAccount` — normalized connected calendar identity
- `CalendarSource` — origin of an item: `dayline`, `google`, or `microsoft`
- `RecurringRule` — recurrence in Dayline's normalized format
- `TodayTimelineItem` — normalized item for the daily planning surface
- `UpcomingTimelineItem` — normalized item for upcoming/planning surface

## Naming Rules
- Names must explain domain intent, not implementation mechanics
- Good: `visibleCalendarIds`, `overdueTasks`, `externalEvents`
- Bad: `ids`, `filtered`, `result`, `data`, `payload`
- Avoid: `Utils`, `Helper`, `Manager`, `Handler`, `Service2`, `types.ts` (catch-all)
- Prefer scoped files: `calendar-event-normalizer.ts` over `utils.ts`

## Frontend Conventions
- React functional components only
- TanStack Router file-based routing — keep route files thin
- Tailwind 4 semantic tokens from `src/styles.css` — no arbitrary colors
- Lucide React for icons
- No OAuth tokens / provider secrets in browser storage

## Backend Conventions
- NestJS module/service/controller boundaries
- Controllers thin — business logic in services
- Provider-specific code behind adapters (never leak raw Graph/GCal payloads)
- Explicit DTO boundaries for all API shapes
- Never return tokens or secrets in API responses

## Comments
Default: no comments. Only add when the WHY is non-obvious (hidden constraint, subtle invariant, workaround). Never describe what the code does — names do that.
