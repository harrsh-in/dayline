# Codex Instructions for Dayline

Codex must follow `AGENTS.md`. This file is a short reference for Codex sessions that explicitly load `CODEX.md`.

## Non-Negotiables

- Preserve Dayline's calm, minimal, day-centered product shape.
- Do not turn the app into a project management dashboard.
- Keep code semantic and domain-driven.
- Do not add dependencies without strong justification.
- Do not store OAuth tokens or provider secrets in browser storage.
- Do not expose raw Google/Microsoft calendar payloads through normal frontend APIs.
- Keep frontend and backend contracts explicit.

## Before Editing

Inspect files first. Do not guess the repo shape.

For frontend work, read:

- `admin-panel/package.json`
- `admin-panel/src/styles.css`
- nearby route/component files
- `docs/ai/FRONTEND_RULES.md`

For backend work, read:

- `server/package.json`
- nearby module/controller/service files
- `docs/ai/BACKEND_RULES.md`
- `docs/ai/API_CONTRACT_RULES.md`

## After Editing

Run narrow checks first, then broader checks when feasible.

Report files changed, behavior changed, checks run, and checks skipped.
