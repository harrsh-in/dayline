# Testing Rules

Testing should protect Dayline behavior, not lock in incidental implementation details.

## Frontend Testing

Use Vitest and Testing Library.

Prioritize tests for:

- Timeline rendering by item kind.
- Empty, loading, and error states.
- Calendar source labeling.
- Form submission behavior.
- Connect/disconnect UI behavior.
- Pure normalization or formatting functions.

Avoid:

- Snapshot-heavy tests.
- Tests that only assert class names.
- Tests that duplicate implementation details.

Good frontend test names:

- `renders Microsoft events with a Microsoft source label`
- `does not show external events as Dayline tasks`
- `disables disconnect while the request is pending`
- `shows a calm empty state when today has no events`

## Backend Testing

Use Jest.

Prioritize tests for:

- Service behavior.
- Provider adapter normalization.
- Calendar connect/disconnect semantics.
- Event create/update/delete semantics.
- Error mapping.
- DTO validation once validation is introduced.

Avoid:

- Tests that only assert Nest module creation.
- Tests coupled to raw provider payloads outside provider adapter fixtures.

Good backend test names:

- `disconnectCalendarConnection removes the connection from visible calendars`
- `normalizes Microsoft all-day events without losing date semantics`
- `does not expose provider access tokens in connection responses`
- `rejects updates to external events when the connection is missing`

## Fixture Policy

Fixtures should be small and realistic.

Provider fixtures belong near provider adapter tests.

Do not reuse huge raw provider payloads unless testing provider normalization specifically.

## Required Checks

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

Run what is relevant. Report what was not run.
