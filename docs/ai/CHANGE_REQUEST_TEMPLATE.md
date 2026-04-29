# Change Request Template for Agents

Use this prompt when asking Codex or Claude to make a change.

```md
You are working in the Dayline repository.

Before editing, read:

- AGENTS.md
- docs/DESIGN_CONTRACT.md
- docs/ai/SEMANTIC_CODE_STANDARD.md
- docs/ai/FRONTEND_RULES.md if touching admin-panel
- docs/ai/BACKEND_RULES.md if touching server
- docs/ai/API_CONTRACT_RULES.md if touching API boundaries
- docs/ai/CALENDAR_SYNC_RULES.md if touching calendar behavior

Task:
[Describe the exact change.]

Scope:

- Allowed files/areas: [list]
- Do not touch: [list]

Behavior required:

- [Expected behavior]
- [Edge cases]

Constraints:

- Preserve Dayline's minimal day-planning UX.
- Use semantic domain names.
- Do not add dependencies unless strictly necessary and justified.
- Do not store OAuth tokens or provider secrets in browser storage.
- Do not expose raw provider payloads to frontend UI.

Verification:

- Run the relevant lint/test/build commands if possible.
- Report files changed, behavior changed, checks run, and checks skipped.
```
