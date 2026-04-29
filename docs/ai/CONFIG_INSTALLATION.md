# Config Installation Notes

This suite is intentionally conservative. It avoids replacing unknown existing ESLint configs because the uploaded packages already include lint scripts and dependency choices.

## Recommended Copy Plan

Copy these files to the repository root:

```txt
AGENTS.md
CLAUDE.md
CODEX.md
ai.rules.json
.editorconfig
.prettierrc.json
.prettierignore
.gitignore
.env.example
.github/pull_request_template.md
.vscode/settings.json
docs/ai/*
```

Copy these files to the frontend package:

```txt
admin-panel/AGENTS.md
admin-panel/CLAUDE.md
admin-panel/tsconfig.agentic.json
```

Copy these files to the backend package:

```txt
server/AGENTS.md
server/CLAUDE.md
server/tsconfig.agentic.json
```

## Existing File Warning

If the repository already has `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.prettierrc`, or `.editorconfig`, merge manually instead of blindly overwriting.

The root `AGENTS.md` in this suite is designed as a stronger replacement for generic project instructions, but preserve any project-specific setup commands already present in your existing file.

## Optional Strict TypeScript Check

The `tsconfig.agentic.json` files are opt-in. They do not affect builds unless you wire them into scripts.

Optional scripts:

Frontend:

```json
{
  "scripts": {
    "typecheck:strict": "tsc -p tsconfig.agentic.json --noEmit"
  }
}
```

Backend:

```json
{
  "scripts": {
    "typecheck:strict": "tsc -p tsconfig.agentic.json --noEmit"
  }
}
```

Add these only after confirming the existing codebase is ready for strict checks. If the current project is early and noisy, keep them as reference contracts first.

## ESLint Config Note

Do not replace existing ESLint config blindly.

The frontend package uses TanStack ESLint tooling. The backend package uses Nest/TypeScript ESLint tooling. Because generated starter configs vary, prefer updating the existing configs in-place using the rules in:

- `docs/ai/SEMANTIC_CODE_STANDARD.md`
- `docs/ai/FRONTEND_RULES.md`
- `docs/ai/BACKEND_RULES.md`

The most useful enforcement in this project is not only syntactic linting. It is product and domain discipline, which is why the agent-facing markdown contracts matter more than adding brittle lint rules immediately.
