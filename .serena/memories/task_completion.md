# Task Completion Checklist

When finishing any coding task in Dayline:

## 1. Run verification
- Frontend change: `cd admin-panel && npm run lint && npm run test && npm run build`
- Backend change: `cd server && npm run lint && npm run test && npm run build`
- Run narrowest useful command first during dev; full set before finalizing

## 2. Report exactly
- Files changed (by path)
- Behavior changed (concrete description)
- Checks run (with output summary)
- Checks NOT run (with reason)
- Any real risk or follow-up

## 3. Product test (before shipping any feature)
Answer yes to all:
- Does it make the user's day clearer?
- Does it keep tasks/habits/events/calendars understandable together?
- Does it preserve minimal, calm UX?
- Can a first-time user understand it without docs?

## 4. Scope discipline
- Did not add features beyond what was requested
- Did not introduce new dependencies without justification
- Did not refactor unrelated code
- Did not expand API surface beyond what the task requires

## 5. Security check
- No secrets/tokens committed
- Calendar tokens remain backend-owned
- No raw provider payloads exposed to frontend
