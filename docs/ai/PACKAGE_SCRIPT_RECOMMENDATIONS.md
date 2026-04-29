# Package Script Recommendations

These are optional script additions. Do not add them blindly if the existing project setup differs.

## Frontend: `admin-panel/package.json`

Existing useful scripts:

```json
{
  "dev": "vite dev --port 5173",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "lint": "eslint",
  "format": "prettier --write . && eslint --fix",
  "check": "prettier --check ."
}
```

Recommended optional additions:

```json
{
  "typecheck": "tsc --noEmit",
  "typecheck:strict": "tsc -p tsconfig.agentic.json --noEmit",
  "verify": "npm run check && npm run lint && npm run typecheck && npm run test && npm run build"
}
```

## Backend: `server/package.json`

Existing useful scripts:

```json
{
  "build": "nest build",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

Recommended optional additions:

```json
{
  "typecheck": "tsc --noEmit",
  "typecheck:strict": "tsc -p tsconfig.agentic.json --noEmit",
  "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
}
```

## Important

The existing `lint` scripts auto-fix. That is fine locally, but in CI you may eventually want separate non-mutating lint scripts.

Recommended later:

```json
{
  "lint:check": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

Only add this once you align frontend/backend ESLint command shapes.
