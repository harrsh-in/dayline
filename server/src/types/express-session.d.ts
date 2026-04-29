import 'express-session';

declare module 'express-session' {
  interface SessionData {
    microsoftOAuthState: string | undefined;
    microsoftCalendar:
      | {
          connected: true;
          accessToken: string;
          refreshToken: string | undefined;
          expiresAt: number;
          account: {
            id: string;
            displayName: string | undefined;
            email: string | undefined;
          };
        }
      | undefined;
  }
}
