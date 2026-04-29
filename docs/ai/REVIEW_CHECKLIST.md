# Agentic Code Review Checklist

Use this before finalizing any non-trivial change.

## Product Fit

- Does this change help the user understand or manage their day?
- Does it preserve Dayline's minimal daily-planner feel?
- Does it avoid becoming a project-management/dashboard feature?
- Is ownership clear between tasks, habits, Dayline events, and external calendar events?

## Semantic Code

- Are names domain-specific and clear?
- Are exported functions and components named by intent?
- Are DTOs explicit?
- Are raw provider/database shapes kept out of UI code?
- Is there any generic `data`, `item`, `handler`, `manager`, or `utils` naming that should be improved?

## Frontend

- Are route files thin?
- Are components small and focused?
- Are API calls centralized and typed?
- Are loading, empty, error, and success states explicit?
- Does styling use Tailwind and semantic tokens?
- Is source labeling clear for Google/Microsoft/Dayline items?
- Are secrets absent from browser storage?

## Backend

- Are controllers thin?
- Is business logic in services?
- Are provider details isolated behind adapters/normalizers?
- Are tokens and secrets never returned to the frontend?
- Are errors mapped to stable API responses?
- Are mutations scoped and ownership-checked?

## Calendar

- Does the code distinguish Dayline-owned and provider-owned events?
- Does disconnect behavior avoid stale frontend truth?
- Are provider rate limits respected?
- Are provider payloads normalized before crossing API boundaries?
- Are recurrence/all-day semantics explicit?

## Testing

- Are behavior-changing paths tested?
- Are provider normalizers tested with realistic fixtures?
- Are empty/error states covered where useful?
- Were relevant commands run?

## Final Report

A good final report includes:

- Files changed.
- Behavior changed.
- Commands run.
- Commands not run and why.
- Material risks or follow-ups.
