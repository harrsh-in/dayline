import {
  Controller,
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
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

type CalendarEventMutationBody = {
  subject: string | undefined;
  body: string | undefined;
  startDateTime: string | undefined;
  endDateTime: string | undefined;
  timezone: string | undefined;
  location: string | undefined;
};

type TodoTaskMutationBody = {
  listId: string | undefined;
  title: string | undefined;
  body: string | undefined;
  status:
    | 'notStarted'
    | 'inProgress'
    | 'completed'
    | 'waitingOnOthers'
    | 'deferred'
    | undefined;
  dueDateTime: string | null | undefined;
  startDateTime: string | null | undefined;
  reminderDateTime: string | null | undefined;
  timezone: string | undefined;
  importance: 'low' | 'normal' | 'high' | undefined;
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

  @Post('events')
  async createEvent(
    @Req() req: SessionRequest,
    @Body() body: CalendarEventMutationBody,
  ) {
    if (!body.subject || !body.startDateTime || !body.endDateTime) {
      throw new HttpException(
        { error: 'subject_startDateTime_endDateTime_required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.microsoftCalendarService.createEvent({
      req,
      subject: body.subject,
      body: body.body,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      timezone: body.timezone,
      location: body.location,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return {
      event: result.event,
    };
  }

  @Patch('events/:eventId')
  async updateEvent(
    @Req() req: SessionRequest,
    @Param('eventId') eventId: string,
    @Body() body: CalendarEventMutationBody,
  ) {
    const result = await this.microsoftCalendarService.updateEvent({
      req,
      eventId,
      subject: body.subject,
      body: body.body,
      startDateTime: body.startDateTime,
      endDateTime: body.endDateTime,
      timezone: body.timezone,
      location: body.location,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return {
      event: result.event,
    };
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @Req() req: SessionRequest,
    @Param('eventId') eventId: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.microsoftCalendarService.deleteEvent({
      req,
      eventId,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    res.status(204).send();
  }

  @Get('tasks/lists')
  async todoTaskLists(@Req() req: SessionRequest) {
    const result = await this.microsoftCalendarService.getTodoTaskLists(req);

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return result;
  }

  @Get('tasks')
  async todoTasks(
    @Req() req: SessionRequest,
    @Query('listId') listId?: string,
  ) {
    const result = await this.microsoftCalendarService.getTodoTasks({
      req,
      listId,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return result;
  }

  @Post('tasks')
  async createTodoTask(
    @Req() req: SessionRequest,
    @Body() body: TodoTaskMutationBody,
  ) {
    if (!body.title) {
      throw new HttpException(
        { error: 'title_required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.microsoftCalendarService.createTodoTask({
      req,
      listId: body.listId,
      title: body.title,
      body: body.body,
      dueDateTime: body.dueDateTime ?? undefined,
      startDateTime: body.startDateTime ?? undefined,
      reminderDateTime: body.reminderDateTime ?? undefined,
      timezone: body.timezone,
      importance: body.importance,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return {
      listId: result.listId,
      task: result.task,
    };
  }

  @Patch('tasks/:taskId')
  async updateTodoTask(
    @Req() req: SessionRequest,
    @Param('taskId') taskId: string,
    @Query('listId') listId: string | undefined,
    @Body() body: TodoTaskMutationBody,
  ) {
    const result = await this.microsoftCalendarService.updateTodoTask({
      req,
      listId,
      taskId,
      title: body.title,
      body: body.body,
      status: body.status,
      dueDateTime: body.dueDateTime,
      startDateTime: body.startDateTime,
      reminderDateTime: body.reminderDateTime,
      timezone: body.timezone,
      importance: body.importance,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    return {
      listId: result.listId,
      task: result.task,
    };
  }

  @Delete('tasks/:taskId')
  async deleteTodoTask(
    @Req() req: SessionRequest,
    @Param('taskId') taskId: string,
    @Query('listId') listId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.microsoftCalendarService.deleteTodoTask({
      req,
      listId,
      taskId,
    });

    if (!result.connected) {
      throw new HttpException(result, HttpStatus.UNAUTHORIZED);
    }

    res.status(204).send();
  }

  @Post('disconnect')
  disconnect(@Req() req: SessionRequest) {
    return this.microsoftCalendarService.disconnect(req);
  }
}
