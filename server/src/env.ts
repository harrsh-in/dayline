import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  port: Number(process.env.PORT ?? 8000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  microsoftTenant: process.env.MICROSOFT_TENANT ?? 'common',
  microsoftClientId: process.env.MICROSOFT_CLIENT_ID ?? '',
  microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
  microsoftRedirectUri:
    process.env.MICROSOFT_REDIRECT_URI ??
    'http://localhost:8000/api/integrations/microsoft/callback',

  sessionSecret: process.env.SESSION_SECRET ?? '',
};

const requiredEnvVars: Array<[string, string]> = [
  ['MICROSOFT_CLIENT_ID', env.microsoftClientId],
  ['MICROSOFT_CLIENT_SECRET', env.microsoftClientSecret],
  ['SESSION_SECRET', env.sessionSecret],
];

for (const [name, value] of requiredEnvVars) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}
