# Repository Map for Agents

This document helps agents understand where changes belong.

## Root

```txt
./
  AGENTS.md
  CLAUDE.md
  CODEX.md
  README.md
  docs/
  admin-panel/
  server/
```

## `admin-panel/`

Frontend application.

Expected responsibilities:

- User-facing Dayline UI.
- Today/upcoming planning surfaces.
- Task/habit/event forms.
- Calendar connection controls.
- Calendar event display.
- Safe UI preferences.

Should not own:

- OAuth token exchange.
- Provider refresh tokens.
- Raw provider sync logic.
- Persistent source of truth for calendar connections.

## `server/`

Backend application.

Expected responsibilities:

- API routes.
- Calendar OAuth flow handling.
- Calendar provider adapters.
- Token ownership/storage.
- Task/habit/event business logic.
- Normalized API responses.

Should not own:

- Product layout decisions.
- Tailwind classes.
- Frontend-only local UI state.

## `docs/ai/`

Agentic coding contracts.

These files explain how AI coding tools should reason about product scope, semantic naming, frontend/backend architecture, API contracts, calendar sync, security, testing, and review.

## File Placement Rules

Feature code belongs near the feature domain.

Cross-feature UI belongs in shared UI only if it is truly reusable.

Calendar provider code belongs behind provider-specific adapters and normalizers.

Do not create broad generic folders that become dumping grounds.
