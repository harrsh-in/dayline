# Backend Agent Contract

This file applies to `server/`.

Read root `../AGENTS.md`, `../docs/DESIGN_CONTRACT.md`, and `../docs/ai/BACKEND_RULES.md` before editing backend code.

## Stack

- NestJS
- TypeScript
- Jest
- Express platform
- `express-session` currently available for session-backed flows

## Rules

- Keep controllers thin.
- Put use-case logic in services.
- Keep provider-specific calendar code behind adapters and normalizers.
- Never return provider tokens or secrets.
- Normalize Microsoft/Google payloads before returning API responses.
- Use explicit request/response DTOs.
- Use Dayline-owned IDs at the frontend boundary where possible.
- Do not introduce persistence, ORM, queues, or new auth architecture unless the task requires it.

## Checks

```bash
npm run lint
npm run test
npm run build
```
