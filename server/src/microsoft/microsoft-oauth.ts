import crypto from 'node:crypto';
import { env } from '../env';
import { graphFetch } from './microsoft-graph';
import type {
  MicrosoftMeResponse,
  MicrosoftTokenResponse,
} from './microsoft-types';

export const MICROSOFT_SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'User.Read',
  'Calendars.ReadWrite',
  'Tasks.ReadWrite',
] as const;

export function createMicrosoftOAuthState(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function buildMicrosoftAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.microsoftClientId,
    response_type: 'code',
    redirect_uri: env.microsoftRedirectUri,
    response_mode: 'query',
    scope: MICROSOFT_SCOPES.join(' '),
    state,
    prompt: 'select_account',
  });

  return `https://login.microsoftonline.com/${env.microsoftTenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeMicrosoftCodeForTokens(
  code: string,
): Promise<MicrosoftTokenResponse> {
  const body = new URLSearchParams({
    client_id: env.microsoftClientId,
    client_secret: env.microsoftClientSecret,
    code,
    redirect_uri: env.microsoftRedirectUri,
    grant_type: 'authorization_code',
    scope: MICROSOFT_SCOPES.join(' '),
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${env.microsoftTenant}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Microsoft token exchange failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftTokenResponse>;
}

export async function refreshMicrosoftAccessToken(
  refreshToken: string,
): Promise<MicrosoftTokenResponse> {
  const body = new URLSearchParams({
    client_id: env.microsoftClientId,
    client_secret: env.microsoftClientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: MICROSOFT_SCOPES.join(' '),
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${env.microsoftTenant}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Microsoft token refresh failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftTokenResponse>;
}

export async function getMicrosoftMe(
  accessToken: string,
): Promise<MicrosoftMeResponse> {
  const response = await graphFetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Microsoft /me failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<MicrosoftMeResponse>;
}
