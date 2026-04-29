# Security Rules

This document defines security constraints for Dayline agentic development.

## Secret Handling

Never commit secrets.

Never include real values for:

- OAuth client secrets.
- Access tokens.
- Refresh tokens.
- Cookie/session secrets.
- API keys.
- Private keys.
- Database credentials.

Use `.env.example` with placeholder names only.

## OAuth Rules

OAuth token exchange must happen on the backend.

The frontend must never receive:

- Provider access tokens.
- Provider refresh tokens.
- Client secrets.
- Raw OAuth authorization codes after callback handling.

Browser storage must not contain secrets.

## Session Rules

Use secure session settings in production:

- `httpOnly` cookies.
- `secure` cookies over HTTPS.
- Appropriate `sameSite` policy.
- Non-default session secret from environment.

Do not log session IDs or secrets.

## Calendar Data Privacy

Calendar events may contain sensitive personal data.

Avoid logging:

- Full event descriptions.
- Attendee lists.
- Meeting links.
- Provider raw payloads.
- User emails beyond operationally necessary context.

When logging is needed, log IDs and operation state, not private event content.

## API Response Safety

Responses must not include:

- Tokens.
- Provider secrets.
- Raw provider auth responses.
- Stack traces.
- Internal config.

Error messages should be useful but not revealing.

## Dependency Safety

Before adding dependencies, check:

- Maintenance status.
- Package purpose.
- Whether the same result can be achieved with current dependencies.
- Whether it affects auth, crypto, parsing, or network behavior.

Do not add obscure packages for simple tasks.

## Destructive Actions

Disconnect, delete, and revoke actions must be explicit and scoped.

Frontend copy should clearly say what is being disconnected or deleted.

Backend handlers should verify ownership before mutation.

## Local Development

Use `.env.example` for required variable names.

Do not document real credentials in markdown files.

Do not paste secrets into agent prompts.
