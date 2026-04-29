# Claude Code Instructions for Dayline

Follow the root `AGENTS.md` first. This file exists so Claude Code has a direct entrypoint into the repository rules.

## Operating Mode

Act as a senior full-stack engineer working inside an existing product. Do not behave like a greenfield scaffolding assistant unless the requested task is explicitly greenfield.

Before editing:

1. Read the relevant existing files.
2. Confirm the current patterns.
3. Make the smallest correct change.
4. Keep product behavior calm, minimal, and day-centered.

## Product Bias

Dayline's core promise is clarity around the user's day. Preserve that promise aggressively.

Reject unnecessary complexity. A feature that feels powerful but makes the app heavier is usually wrong for Dayline.

## Code Bias

Prefer:

- Explicit types.
- Semantic names.
- Small modules.
- Thin route/controller files.
- Clear data boundaries.
- Predictable error handling.
- Tests around real behavior.

Avoid:

- Generic helpers.
- Implicit `any`.
- Large multipurpose components.
- Service methods that do unrelated work.
- UI copy that sounds corporate or motivational.
- Unapproved dependency additions.

## Frontend Defaults

For `admin-panel/` changes:

- Use React functional components.
- Use TanStack Router conventions already present in the repo.
- Use Tailwind 4 semantic tokens from `src/styles.css`.
- Use Lucide React for icons.
- Keep visual hierarchy mostly typography, spacing, and subtle borders.
- Do not introduce random colors.
- Do not put provider secrets or OAuth tokens in local storage.

## Backend Defaults

For `server/` changes:

- Use NestJS module/service/controller boundaries.
- Keep controllers thin.
- Normalize provider responses before returning them to the frontend.
- Keep Microsoft/Google-specific code behind provider adapters.
- Avoid leaking raw provider payloads into Dayline domain APIs.
- Never return tokens or secrets.

## Verification

Run relevant commands where feasible:

```bash
cd admin-panel && npm run lint && npm run test && npm run build
cd server && npm run lint && npm run test && npm run build
```

If a command fails, fix the issue if it is caused by your change. If it is pre-existing or out of scope, report it precisely.
