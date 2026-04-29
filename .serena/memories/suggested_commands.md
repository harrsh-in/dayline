# Suggested Commands

## Frontend (admin-panel/)
```bash
cd admin-panel
npm run dev          # dev server on port 5173
npm run build        # production build
npm run test         # vitest run (one-shot)
npm run lint         # eslint
npm run format       # prettier --write + eslint --fix
npm run check        # prettier --check
```

## Backend (server/)
```bash
cd server
npm run start:dev    # nest start --watch (dev)
npm run start:prod   # node dist/main
npm run build        # nest build
npm run test         # jest
npm run test:cov     # jest --coverage
npm run test:e2e     # jest --config ./test/jest-e2e.json
npm run lint         # eslint with --fix
npm run typecheck    # tsc --noEmit
```

## Verification sequence (run before finalizing any change)
```bash
# Frontend change:
cd admin-panel && npm run lint && npm run test && npm run build

# Backend change:
cd server && npm run lint && npm run test && npm run build
```

## System utils (Darwin)
- File search: `find . -name "pattern"` or `grep -r "term" src/`
- List: `ls -la`
- Git: standard git commands
