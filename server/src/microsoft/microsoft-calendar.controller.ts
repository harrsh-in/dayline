import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { env } from '../env';
import { MicrosoftCalendarService } from './microsoft-calendar.service';

type SessionRequest = Request & {
  session: Request['session'];
};

@Controller('api/integrations/microsoft')
export class MicrosoftCalendarController {
  constructor(
    private readonly microsoftCalendarService: MicrosoftCalendarService,
  ) {}

  @Get('connect')
  connect(@Req() req: SessionRequest, @Res() res: Response): void {
    res.redirect(
      this.microsoftCalendarService.createAuthorizationRedirect(req),
    );
  }

  @Get('callback')
  async callback(
    @Req() req: SessionRequest,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ): Promise<void> {
    if (error) {
      res.redirect(
        `${env.frontendUrl}/settings/integrations?microsoft_error=${encodeURIComponent(error)}`,
      );
      return;
    }

    if (!code || !state) {
      throw new HttpException(
        { error: 'missing_code_or_state' },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.microsoftCalendarService.completeOAuthCallback({
        req,
        code,
        state,
      });
    } catch (callbackError) {
      if (
        callbackError instanceof Error &&
        callbackError.message === 'invalid_oauth_state'
      ) {
        throw new HttpException(
          { error: 'invalid_oauth_state' },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw callbackError;
    }

    res.redirect(
      `${env.frontendUrl}/settings/integrations?microsoft=connected`,
    );
  }

  @Get('status')
  status(@Req() req: SessionRequest) {
    return this.microsoftCalendarService.getStatus(req);
  }

  @Get('events')
  async events(
    @Req() req: SessionRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('timezone') timezone?: string,
  ) {
    const result = await this.microsoftCalendarService.getEvents({
      req,
      from,
      to,
      timezone,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return result;
  }

  @Post('disconnect')
  disconnect(@Req() req: SessionRequest) {
    return this.microsoftCalendarService.disconnect(req);
  }
}
