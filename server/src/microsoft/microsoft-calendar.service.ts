import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import {
  buildMicrosoftAuthorizationUrl,
  createMicrosoftOAuthState,
  exchangeMicrosoftCodeForTokens,
  getMicrosoftMe,
  refreshMicrosoftAccessToken,
} from './microsoft-oauth';
import {
  listMicrosoftCalendarEvents,
  normalizeMicrosoftCalendarEvent,
} from './microsoft-graph';

type SessionRequest = Request & {
  session: Request['session'];
};

function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);

  const to = new Date(now);
  to.setDate(to.getDate() + 30);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

@Injectable()
export class MicrosoftCalendarService {
  createAuthorizationRedirect(req: SessionRequest): string {
    const state = createMicrosoftOAuthState();
    req.session.microsoftOAuthState = state;

    return buildMicrosoftAuthorizationUrl(state);
  }

  async completeOAuthCallback(input: {
    req: SessionRequest;
    code: string;
    state: string;
  }): Promise<void> {
    const expectedState = input.req.session.microsoftOAuthState;

    if (!expectedState || expectedState !== input.state) {
      throw new Error('invalid_oauth_state');
    }

    delete input.req.session.microsoftOAuthState;

    const tokens = await exchangeMicrosoftCodeForTokens(input.code);
    const me = await getMicrosoftMe(tokens.access_token);

    input.req.session.microsoftCalendar = {
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      account: {
        id: me.id,
        displayName: me.displayName,
        email: me.mail ?? me.userPrincipalName,
      },
    };
  }

  getStatus(req: SessionRequest) {
    const connection = req.session.microsoftCalendar;

    if (!connection) {
      return {
        connected: false as const,
        account: null,
      };
    }

    return {
      connected: true as const,
      account: connection.account,
    };
  }

  async getEvents(input: {
    req: SessionRequest;
    from?: string;
    to?: string;
    timezone?: string;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
        events: [],
      };
    }

    const defaults = getDefaultDateRange();
    const events = await listMicrosoftCalendarEvents({
      accessToken,
      from: input.from ?? defaults.from,
      to: input.to ?? defaults.to,
      timezone: input.timezone ?? 'Asia/Kolkata',
    });

    return {
      connected: true as const,
      events: events.map(normalizeMicrosoftCalendarEvent),
    };
  }

  disconnect(req: SessionRequest) {
    delete req.session.microsoftCalendar;
    delete req.session.microsoftOAuthState;

    return {
      connected: false as const,
    };
  }

  private async getValidMicrosoftAccessToken(
    req: SessionRequest,
  ): Promise<string | null> {
    const connection = req.session.microsoftCalendar;

    if (!connection) {
      return null;
    }

    const refreshBufferMs = 5 * 60 * 1000;

    if (connection.expiresAt - Date.now() > refreshBufferMs) {
      return connection.accessToken;
    }

    if (!connection.refreshToken) {
      delete req.session.microsoftCalendar;
      return null;
    }

    try {
      const refreshed = await refreshMicrosoftAccessToken(
        connection.refreshToken,
      );

      req.session.microsoftCalendar = {
        ...connection,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? connection.refreshToken,
        expiresAt: Date.now() + refreshed.expires_in * 1000,
      };

      return refreshed.access_token;
    } catch {
      delete req.session.microsoftCalendar;
      return null;
    }
  }
}
