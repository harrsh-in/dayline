import 'express-session';

declare module 'express-session' {
  interface SessionData {
    microsoftOAuthState?: string;
    microsoftCalendar?: {
      connected: true;
      accessToken: string;
      refreshToken?: string;
      expiresAt: number;
      account: {
        id: string;
        displayName?: string;
        email?: string;
      };
    };
  }
}
