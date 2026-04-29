# API Contract Rules

This document defines how frontend and backend should communicate.

Dayline APIs must be Dayline-shaped. They should not leak raw provider payloads, database records, or accidental implementation details.

## Contract Ownership

The backend owns API contracts.

The frontend consumes typed request/response shapes that mirror backend response DTOs.

When changing an API:

1. Update backend DTO/response shape.
2. Update frontend API type.
3. Update the consuming UI.
4. Update tests where behavior changed.

Do not update only one side.

## Route Naming

Use resource-oriented route names.

Good:

```txt
GET    /api/v1/tasks
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:taskId
DELETE /api/v1/tasks/:taskId

GET    /api/v1/habits
POST   /api/v1/habits
PATCH  /api/v1/habits/:habitId

GET    /api/v1/planner-events
POST   /api/v1/planner-events
PATCH  /api/v1/planner-events/:plannerEventId
DELETE /api/v1/planner-events/:plannerEventId

GET    /api/v1/calendar/connections
POST   /api/v1/calendar/microsoft/connect
POST   /api/v1/calendar/google/connect
DELETE /api/v1/calendar/connections/:connectionId
GET    /api/v1/calendar/events
```

Bad:

```txt
POST /api/do-task
POST /api/calendar-action
GET  /api/getData
POST /api/syncStuff
```

## Response Shape Rules

Responses should be explicit and predictable.

Prefer:

```ts
type CalendarConnectionResponse = {
  readonly id: string
  readonly provider: 'google' | 'microsoft'
  readonly accountEmail: string
  readonly displayName: string | null
  readonly connectedAt: string
  readonly status: 'connected' | 'reconnect-required'
}
```

Avoid:

```ts
type CalendarConnectionResponse = Record<string, unknown>
```

## ID Policy

Use Dayline-owned IDs at the frontend boundary by default.

Provider IDs should remain backend-owned unless the frontend has a clear, non-sensitive, read-only reason to display or pass them back.

Do not use provider IDs as primary application IDs in the frontend.

## Error Shape

Use a stable error response shape.

Recommended shape:

```ts
type ApiErrorResponse = {
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: Record<string, unknown>
  }
}
```

User-facing messages should be calm and direct. Internal/provider details should not be exposed.

## Date and Time Rules

Use ISO 8601 strings at the API boundary.

For all-day events, represent all-day semantics explicitly instead of relying on midnight timestamps alone.

Recommended fields:

```ts
type PlannerEventTime =
  | {
      readonly kind: 'timed'
      readonly startsAt: string
      readonly endsAt: string
      readonly timeZone: string
    }
  | {
      readonly kind: 'all-day'
      readonly date: string
      readonly timeZone: string
    }
```

Do not let frontend code guess whether a midnight timestamp means all-day.

## Calendar Source Rule

All event-like responses must make source clear.

Example:

```ts
type CalendarEventSource = 'dayline' | 'google' | 'microsoft'
```

A user must be able to understand what belongs to Dayline and what came from a connected calendar.

## Mutation Rules

Mutations should return the updated resource or a clear operation result.

Good:

```ts
type UpdatePlannerEventResponse = {
  readonly event: PlannerEventResponse
}
```

Avoid silent `200 OK` with no useful response unless the operation genuinely has no state to return.

For delete:

```ts
type DeletePlannerEventResponse = {
  readonly deleted: true
  readonly id: string
}
```

## Pagination and Ranges

Calendar/event lists should be range-based where possible.

Good:

```txt
GET /api/v1/calendar/events?from=2026-04-29T00:00:00.000Z&to=2026-05-06T00:00:00.000Z
```

Do not fetch unbounded provider calendars.

## Backward Compatibility

This is an early project, but still avoid careless breaking changes.

When changing an API contract, update all current consumers in the same change.

Do not leave dead compatibility branches unless there is a real deployed-client reason.
