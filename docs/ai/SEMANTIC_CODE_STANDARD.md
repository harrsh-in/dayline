# Semantic Code Standard

This document defines how code should be named, shaped, and organized across Dayline.

The goal is not aesthetic cleanliness. The goal is code that preserves domain meaning so agents and humans can safely extend the product without slowly turning it into generic CRUD.

## Core Domain Language

Use Dayline's domain vocabulary consistently.

### Primary Concepts

- `Task` — work the user intends to complete.
- `Habit` — a routine the user repeats and checks off.
- `PlannerEvent` — a scheduled Dayline-owned event.
- `ExternalCalendarEvent` — an event imported from Google or Microsoft.
- `CalendarConnection` — a user's connected provider account.
- `CalendarAccount` — a normalized connected calendar identity.
- `CalendarSource` — the origin of an item, such as `dayline`, `google`, or `microsoft`.
- `RecurringRule` — recurrence behavior in Dayline's normalized format.
- `TodayTimelineItem` — normalized item shown in the daily planning surface.
- `UpcomingTimelineItem` — normalized item shown in an upcoming/planning surface.

### Naming Rule

Names must explain what the thing means in Dayline, not how it happens to be implemented.

Good:

```ts
const visibleCalendarIds = selectedCalendars.map((calendar) => calendar.id)
const overdueTasks = tasks.filter((task) => task.status === 'overdue')
const externalEvents = events.filter((event) => event.source !== 'dayline')
```

Bad:

```ts
const ids = data.map((x) => x.id)
const filtered = list.filter((i) => i.status === 'overdue')
const result = payload.filter((e) => e.type !== 'local')
```

## Avoid Generic Buckets

Do not create generic buckets unless the domain truly needs them.

Avoid:

- `utils.ts`
- `helpers.ts`
- `common.ts`
- `manager.ts`
- `handler.ts`
- `service2.ts`
- `types.ts` containing unrelated global types

Prefer scoped files:

- `calendar-event-normalizer.ts`
- `task-schedule-label.ts`
- `habit-completion-state.ts`
- `microsoft-calendar.adapter.ts`
- `google-calendar.adapter.ts`
- `today-timeline.types.ts`

## TypeScript Standards

TypeScript must be strict and expressive.

Use:

- `type` for object shapes and unions unless class behavior is needed.
- `interface` for public extension points or Nest provider contracts.
- Discriminated unions when UI or API behavior depends on item kind.
- `readonly` for immutable DTO-like structures when useful.
- Narrow literal unions instead of free strings.

Avoid:

- `any`.
- Over-broad `unknown` that is never narrowed.
- Boolean prop soup like `isTask`, `isHabit`, `isCalendar`, `isExternal`.
- Nullable fields where a union would make state clearer.

Preferred pattern:

```ts
type TodayTimelineItem =
  | {
      readonly kind: 'task'
      readonly taskId: string
      readonly title: string
      readonly scheduledFor: string | null
      readonly completed: boolean
    }
  | {
      readonly kind: 'habit'
      readonly habitId: string
      readonly title: string
      readonly completedToday: boolean
    }
  | {
      readonly kind: 'external-calendar-event'
      readonly externalEventId: string
      readonly title: string
      readonly startsAt: string
      readonly endsAt: string
      readonly source: 'google' | 'microsoft'
    }
```

## Function Naming

Functions should describe intent.

Good:

- `normalizeMicrosoftEvent`
- `buildTodayTimeline`
- `markHabitCompleteForDate`
- `disconnectCalendarConnection`
- `resolveVisibleCalendarEvents`
- `createPlannerEvent`

Bad:

- `processData`
- `handleSubmit`
- `syncStuff`
- `mapResponse`
- `doCalendarThing`

`handleSubmit` is acceptable only as a local callback inside a small component. Exported functions and service methods must be domain-specific.

## Component Naming

Components must describe the product surface or UI role.

Good:

- `TodayTimeline`
- `TaskQuickCapture`
- `CalendarConnectionCard`
- `HabitCompletionButton`
- `ExternalEventRow`
- `ConnectedCalendarList`

Bad:

- `CardComponent`
- `MainView`
- `DataList`
- `ModalWrapper`
- `ItemRenderer`

## DTO Naming

Use explicit request/response names.

Good:

- `CreateTaskRequest`
- `CreateTaskResponse`
- `UpdatePlannerEventRequest`
- `CalendarConnectionResponse`
- `ListExternalEventsQuery`

Bad:

- `TaskDto` for every task shape.
- `CalendarDto` for unrelated provider shapes.
- `ResponseData`.

## API Shape Rule

Do not return raw persistence models or raw provider models directly from backend routes.

Backend routes should return Dayline-owned response shapes.

Provider data should pass through normalization before reaching the frontend.

## Error Naming

Errors should explain the failed domain operation.

Good:

- `CalendarConnectionNotFoundError`
- `CalendarProviderTokenExpiredError`
- `PlannerEventUpdateConflictError`
- `TaskScheduleInvalidError`

Bad:

- `BadRequestError` everywhere.
- `SomethingWentWrongError`.
- `ProviderError` with no context.

## Copy and UX Text

Product copy must be short, calm, and direct.

Good:

- `Connect calendar`
- `Disconnect calendar`
- `No events today`
- `Synced with Microsoft Calendar`
- `This task repeats every Monday`

Bad:

- `Optimize your productivity workflow`
- `Empower your planning ecosystem`
- `Unlock peak performance`

## Comment Policy

Code should be clear without comments most of the time.

Use comments only for:

- External API quirks.
- Calendar sync edge cases.
- Non-obvious security decisions.
- Intentional trade-offs.

Do not write comments that repeat the code.

## File Size and Shape

Prefer small cohesive files.

A file is probably too large if it contains:

- More than one domain concern.
- Multiple unrelated exported functions.
- A component plus fetching plus normalization plus business rules.
- Both provider-specific and Dayline-normalized logic.

Split by domain meaning, not by arbitrary line count.
