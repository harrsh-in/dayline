# Calendar Sync Rules

Applies to all Google Calendar and Microsoft Calendar work.

Calendar sync is a core Dayline feature, but it must feel safe, predictable, and simple. Users should never wonder whether an item is a Dayline task, a Dayline event, or an external calendar event.

## Core Rule

Calendar integration must not leak provider complexity into the product UX.

The user should see clear calendar state, not Graph API or Google API concepts.

## Ownership Model

Represent ownership explicitly:

- `dayline` — created and owned by Dayline.
- `google` — sourced from a connected Google Calendar account.
- `microsoft` — sourced from a connected Microsoft Calendar account.

External events should be visible in Dayline. They should not automatically become tasks.

## Connection Model

A user may connect multiple calendar accounts.

A connection should include:

- Dayline connection ID.
- Provider: `google` or `microsoft`.
- Account email/display name.
- Connection status.
- Connected timestamp.
- Visible calendar settings.

Provider access/refresh tokens belong to the backend only.

## Disconnect Behavior

Disconnect must be predictable.

On disconnect:

- Delete or invalidate backend-owned provider credentials.
- Stop using that connection for future sync.
- Remove or hide provider events associated with that connection from normal views.
- Keep Dayline-owned tasks/events intact.
- Make reconnect possible without stale frontend state fighting the backend.

The browser may clear related safe UI preferences, but backend state is the source of truth.

## Event Source Labeling

The frontend must clearly distinguish:

- Dayline event.
- Google Calendar event.
- Microsoft Calendar event.

This can be text, a subtle source label, or a restrained icon treatment. Do not rely on color alone.

## Read Behavior

Early versions may use time-windowed fetches.

Prefer fetching by visible range:

- Today.
- Current week.
- Upcoming range.

Avoid fetching entire calendars.

## Write Behavior

When creating a Dayline event:

- Create the Dayline event first or create through a transaction-like service boundary if persistence exists.
- If mirroring to a provider, store a mapping between Dayline event ID and provider event ID in the backend.
- Return a Dayline-owned response shape.

When updating an event:

- Determine ownership first.
- Dayline-owned event update should update Dayline state and optionally provider mirror.
- External provider event update should route through the owning provider connection.
- If the current product does not support editing external events, return a clear unsupported/conflict response.

When deleting an event:

- Distinguish deleting a Dayline event from deleting an external provider event.
- Do not silently delete provider events unless the user action clearly targets the provider-backed event.

## Task and Calendar Relationship

Tasks are not calendar events by default.

A scheduled task can appear in the daily plan without becoming a provider calendar event.

If a task is explicitly added to a connected calendar, track that relationship explicitly in the backend.

## Recurrence Rules

Do not expose complex provider recurrence builders early.

Support common recurrence first:

- Daily.
- Weekly on selected weekdays.
- Monthly by date if needed.
- No recurrence.

Normalize provider recurrence rules into Dayline-owned recurrence labels/shapes for the frontend.

## Rate Limits and Provider Safety

Do not refetch provider calendars aggressively.

Use:

- Time-windowed reads.
- Incremental sync tokens where implemented.
- ETags/change keys where provider supports them.
- Backoff for throttling.
- Explicit reconnect-required states for auth failures.

Do not build UI that causes provider fetches on every render.

## Token Handling

Never send provider tokens to the frontend.

Never store provider tokens in local storage, session storage, IndexedDB, or frontend state intended for persistence.

OAuth authorization codes should be exchanged by the backend.

Refresh tokens must be protected as long-lived secrets.

## Provider Normalization

Provider adapters should normalize events into Dayline-owned types.

Minimum normalized event fields:

```ts
type ExternalCalendarEvent = {
  readonly id: string
  readonly connectionId: string
  readonly provider: 'google' | 'microsoft'
  readonly calendarId: string
  readonly title: string
  readonly startsAt: string
  readonly endsAt: string
  readonly timeZone: string | null
  readonly isAllDay: boolean
  readonly location: string | null
  readonly descriptionPreview: string | null
  readonly sourceUpdatedAt: string | null
}
```

The `id` should be Dayline-owned or safely normalized. Raw provider IDs should remain backend-owned unless intentionally exposed.

## UI Failure States

Calendar failures should be calm and actionable.

Good:

- `Reconnect Microsoft Calendar`
- `Calendar sync paused`
- `Could not load events. Try again.`

Bad:

- `AADSTS error: invalid_grant`
- `Graph API failure`
- `Something went wrong`

Provider diagnostics can be logged server-side.
