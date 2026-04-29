# Dayline Agentic Coding Suite

This suite gives Codex, Claude, and similar coding agents a concrete operating contract for Dayline.

It includes:

- Root agent instructions.
- Claude and Codex entrypoint files.
- Frontend-specific agent rules.
- Backend-specific agent rules.
- Semantic code standards.
- Calendar sync rules.
- API contract rules.
- Security and testing rules.
- Review checklist.
- Conservative formatting/editor configs.
- Optional strict TypeScript configs.

## Install

Copy the files into the matching paths in your repository.

Do not blindly overwrite existing files. Merge if the repo already has files with the same names.

Recommended first copy:

```txt
AGENTS.md
CLAUDE.md
CODEX.md
docs/ai/*
admin-panel/AGENTS.md
server/AGENTS.md
```

Then copy config files after checking for conflicts:

```txt
.editorconfig
.prettierrc.json
.prettierignore
.gitignore
.env.example
.vscode/settings.json
.github/pull_request_template.md
admin-panel/tsconfig.agentic.json
server/tsconfig.agentic.json
```

## Most Important Files

- `AGENTS.md` — root operating contract for Codex and agents.
- `CLAUDE.md` — Claude Code project memory entrypoint.
- `docs/ai/SEMANTIC_CODE_STANDARD.md` — code naming and domain discipline.
- `docs/ai/FRONTEND_RULES.md` — frontend implementation rules.
- `docs/ai/BACKEND_RULES.md` — backend implementation rules.
- `docs/ai/CALENDAR_SYNC_RULES.md` — provider sync and token safety rules.
- `docs/ai/REVIEW_CHECKLIST.md` — review contract for agentic changes.
