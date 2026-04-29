import session from 'express-session';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.frontendUrl,
    credentials: true,
  });

  app.use(
    session({
      name: 'dayline.sid',
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  await app.listen(env.port, '127.0.0.1');
  console.log(`API running on http://localhost:${env.port}`);
}
void bootstrap();
