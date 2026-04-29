# Dayline — Project Overview

## Purpose
Minimal daily planning app for tasks, habits, events, and calendar sync (Google + Microsoft). Core promise: clarity around the user's day. Not a productivity OS — avoid Jira/Notion/Linear patterns.

## Monorepo Structure
```
./
  admin-panel/   # React frontend (Vite, TanStack Router, Tailwind 4, Lucide)
  server/        # NestJS backend (calendar OAuth, provider adapters, API)
  docs/ai/       # Agentic coding contracts (read on demand, not upfront)
  AGENTS.md      # Root agent operating contract
  CLAUDE.md      # Claude Code entrypoint (references AGENTS.md)
```

## Frontend (`admin-panel/`)
- React + Vite + TypeScript
- TanStack Router (file-based routes in `src/routes/`)
- Tailwind CSS 4 — semantic tokens from `src/styles.css` only
- Lucide React for icons
- Testing: Vitest + @testing-library/react
- Entry: `src/main.tsx`, router: `src/router.tsx`, generated route tree: `src/routeTree.gen.ts`

## Backend (`server/`)
- NestJS + TypeScript
- Calendar OAuth flow, provider adapters, token storage (never exposed to frontend)
- Microsoft Graph + Google Calendar behind provider-specific adapters
- Normalized API responses before reaching frontend
- Entry: `src/main.ts`, root module: `src/app.module.ts`

## Current State
Early-stage. Frontend has 6 source files, backend has 5 source files. Core domain models not yet implemented.
