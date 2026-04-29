# Claude Backend Instructions

Use root `CLAUDE.md` and `server/AGENTS.md`.

When editing the backend:

- Inspect nearby module/controller/service files first.
- Keep controller methods thin.
- Use service methods named after Dayline use cases.
- Keep Microsoft/Google-specific behavior isolated.
- Do not expose tokens, raw provider errors, or provider payloads to the frontend.
- Run relevant checks before finalizing when possible.
