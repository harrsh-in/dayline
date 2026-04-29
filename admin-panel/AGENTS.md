# Frontend Agent Contract

This file applies to `admin-panel/`.

Read root `../AGENTS.md`, `../docs/DESIGN_CONTRACT.md`, and `../docs/ai/FRONTEND_RULES.md` before editing frontend code.

## Stack

- React 19
- Vite
- TypeScript
- TanStack Router
- Tailwind CSS 4
- Lucide React
- Vitest

## Rules

- Keep route files thin.
- Keep components small and semantic.
- Use Tailwind utility classes and semantic tokens from `src/styles.css`.
- Use Lucide React for icons.
- Do not add another UI kit without approval.
- Do not scatter raw `fetch()` calls through components.
- Do not store OAuth tokens, refresh tokens, authorization codes, or provider secrets in browser storage.
- Use browser storage only for safe UI preferences when necessary.
- Make calendar source clear: Dayline, Google, or Microsoft.
- Keep UI copy short, calm, and direct.

## Checks

```bash
npm run lint
npm run test
npm run build
npm run check
```
