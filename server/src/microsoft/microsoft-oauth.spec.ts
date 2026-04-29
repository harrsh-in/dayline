import { describe, expect, it } from '@jest/globals';

process.env.MICROSOFT_TENANT = 'common';
process.env.MICROSOFT_CLIENT_ID = 'client-id';
process.env.MICROSOFT_CLIENT_SECRET = 'client-secret';
process.env.MICROSOFT_REDIRECT_URI =
  'http://localhost:8000/api/integrations/microsoft/callback';
process.env.SESSION_SECRET = 'session-secret';

import {
  MICROSOFT_SCOPES,
  buildMicrosoftAuthorizationUrl,
  createMicrosoftOAuthState,
} from './microsoft-oauth';

describe('microsoft oauth helpers', () => {
  it('generates an opaque oauth state', () => {
    const state = createMicrosoftOAuthState();

    expect(state).toHaveLength(43);
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('builds the Microsoft authorization URL with the POC scopes', () => {
    const url = new URL(buildMicrosoftAuthorizationUrl('state-123'));

    expect(url.origin).toBe('https://login.microsoftonline.com');
    expect(url.pathname).toBe('/common/oauth2/v2.0/authorize');
    expect(url.searchParams.get('client_id')).toBe('client-id');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:8000/api/integrations/microsoft/callback',
    );
    expect(url.searchParams.get('response_mode')).toBe('query');
    expect(url.searchParams.get('scope')).toBe(MICROSOFT_SCOPES.join(' '));
    expect(url.searchParams.get('state')).toBe('state-123');
    expect(url.searchParams.get('prompt')).toBe('select_account');
  });

  it('requests read-write Microsoft Calendar and To Do scopes only', () => {
    expect(MICROSOFT_SCOPES).toContain('Calendars.ReadWrite');
    expect(MICROSOFT_SCOPES).toContain('Tasks.ReadWrite');
    expect(MICROSOFT_SCOPES).not.toContain('Calendars.Read');
  });
});
