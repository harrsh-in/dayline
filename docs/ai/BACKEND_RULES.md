# Backend Agent Rules

Applies to `server/`.

The backend is a NestJS application. It should expose Dayline-owned APIs and keep external provider details behind clear service/adaptor boundaries.

## Backend Design Rule

The backend owns truth, integration state, and provider credentials.

The frontend owns interaction and display.

Do not push backend concerns into the browser.

## Recommended Module Shape

Use existing structure if already present. If adding new domains, prefer this shape:

```txt
server/src/
  modules/
    tasks/
      tasks.controller.ts
      tasks.service.ts
      dto/
      types/
    habits/
      habits.controller.ts
      habits.service.ts
      dto/
      types/
    planner-events/
      planner-events.controller.ts
      planner-events.service.ts
      dto/
      types/
    calendar/
      calendar.controller.ts
      calendar.service.ts
      dto/
      types/
      providers/
        calendar-provider.adapter.ts
        google-calendar.adapter.ts
        microsoft-calendar.adapter.ts
      normalizers/
        google-event.normalizer.ts
        microsoft-event.normalizer.ts
```

Do not create one large `calendar.service.ts` that handles OAuth, token storage, event CRUD, provider normalization, sync state, and frontend response shaping all in one place.

## Controller Rules

Controllers should:

- Parse route params and request body.
- Call services.
- Return response DTOs.
- Choose appropriate status codes.

Controllers should not:

- Contain business rules.
- Normalize provider payloads.
- Build complex queries.
- Manage OAuth token refresh logic.

## Service Rules

Services should contain use-case logic.

Good service methods:

- `createTask`
- `completeTask`
- `connectCalendarAccount`
- `disconnectCalendarConnection`
- `listVisibleCalendarEvents`
- `createPlannerEvent`
- `updatePlannerEvent`
- `deletePlannerEvent`

Bad service methods:

- `handleCalendar`
- `processPayload`
- `doSync`
- `updateData`

## Provider Adapter Rules

Calendar providers must sit behind an adapter interface.

A provider adapter should own provider-specific details:

- Microsoft Graph endpoint shapes.
- Google Calendar endpoint shapes.
- Provider event IDs.
- Provider recurrence formats.
- Provider-specific pagination.
- Provider-specific rate-limit headers.
- Token refresh behavior for that provider.

The rest of the backend should work with normalized Dayline types.

Example interface shape:

```ts
export interface CalendarProviderAdapter {
  readonly provider: 'google' | 'microsoft'

  listEvents(input: ListProviderEventsInput): Promise<ProviderEventPage>
  createEvent(input: CreateProviderEventInput): Promise<ProviderEvent>
  updateEvent(input: UpdateProviderEventInput): Promise<ProviderEvent>
  deleteEvent(input: DeleteProviderEventInput): Promise<void>
}
```

## API Versioning

Prefer `/api/v1` for application routes.

Examples:

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:taskId`
- `GET /api/v1/calendar/connections`
- `POST /api/v1/calendar/microsoft/connect`
- `DELETE /api/v1/calendar/connections/:connectionId`
- `GET /api/v1/calendar/events`
- `POST /api/v1/planner-events`

## DTO Rules

Use explicit request and response DTOs.

Do not expose internal persistence records or raw provider payloads.

Request DTOs should model what the client is allowed to send.

Response DTOs should model what the client is allowed to know.

## Error Handling Rules

Errors should preserve domain meaning.

Use clear application-level errors before mapping them to HTTP responses.

Examples:

- Calendar connection not found → `404`.
- User attempts to mutate an external read-only calendar event → `409` or `403` depending on policy.
- Provider rate limit reached → `429` if exposed to client, otherwise retry/defer internally.
- Provider token expired and refresh failed → `401` or a reconnect-required response.

Never return raw provider errors to the frontend.

## Session and Auth Rules

The package currently includes `express-session`, so session-backed flows are acceptable.

Do not store OAuth credentials in the session if they must survive browser restart or be used for sync. Use durable encrypted storage when persistence is introduced.

Do not expose session internals to frontend APIs.

## Environment Rules

Use environment variables for secrets and provider configuration.

Never hard-code:

- OAuth client IDs/secrets.
- Redirect URIs.
- Token endpoints.
- Tenant-specific secrets.
- Cookie secrets.

Provider public client IDs may appear in config only if they are intentionally public and still not secret. Prefer backend-provided config when unsure.

## Calendar Mutation Rules

Calendar create/update/delete must be idempotent where practical.

Store or return Dayline-owned identifiers to the frontend. Provider IDs should be backend-owned unless there is a specific non-sensitive UI reason to expose them.

For external calendar events:

- If the event was imported from Google/Microsoft, mutation should go through the owning provider connection.
- If the event was created in Dayline and mirrored to a provider, Dayline must track the provider mapping.
- Delete should clearly distinguish deleting a Dayline event from deleting an external provider event.

## Rate-Limit and Sync Rules

Do not poll provider APIs aggressively.

Prefer:

- Incremental sync when available.
- Time-windowed fetches for visible ranges.
- Cached normalized results.
- Explicit refresh actions for early versions.
- Backoff on provider throttling.

## Testing Rules

Use Jest for service and controller behavior.

Test:

- DTO-level request handling where meaningful.
- Service behavior around calendar connection/disconnection.
- Provider adapter normalization.
- Error mapping.
- Event create/update/delete semantics.

Avoid tests that only assert Nest can instantiate a module unless that is the only meaningful behavior available.
