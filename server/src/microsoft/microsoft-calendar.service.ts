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
  createMicrosoftCalendarEvent,
  deleteMicrosoftCalendarEvent,
  normalizeMicrosoftCalendarEvent,
  updateMicrosoftCalendarEvent,
} from './microsoft-calendar-events';
import { listMicrosoftCalendarEvents } from './microsoft-graph';
import {
  createMicrosoftTodoTask,
  deleteMicrosoftTodoTask,
  getDefaultMicrosoftTodoListId,
  listMicrosoftTodoTaskLists,
  listMicrosoftTodoTasks,
  updateMicrosoftTodoTask,
} from './microsoft-todo-tasks';
import type {
  MicrosoftTodoTaskImportance,
  MicrosoftTodoTaskStatus,
} from './microsoft-types';

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
    from: string | undefined;
    to: string | undefined;
    timezone: string | undefined;
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

  async createEvent(input: {
    req: SessionRequest;
    subject: string;
    body: string | undefined;
    startDateTime: string;
    endDateTime: string;
    timezone: string | undefined;
    location: string | undefined;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    const event = await createMicrosoftCalendarEvent({
      accessToken,
      subject: input.subject,
      body: input.body,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      timezone: input.timezone ?? 'Asia/Kolkata',
      location: input.location,
    });

    return {
      connected: true as const,
      event: normalizeMicrosoftCalendarEvent(event),
    };
  }

  async updateEvent(input: {
    req: SessionRequest;
    eventId: string;
    subject: string | undefined;
    body: string | undefined;
    startDateTime: string | undefined;
    endDateTime: string | undefined;
    timezone: string | undefined;
    location: string | undefined;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    const event = await updateMicrosoftCalendarEvent({
      accessToken,
      eventId: input.eventId,
      subject: input.subject,
      body: input.body,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      timezone: input.timezone ?? 'Asia/Kolkata',
      location: input.location,
    });

    return {
      connected: true as const,
      event: normalizeMicrosoftCalendarEvent(event),
    };
  }

  async deleteEvent(input: { req: SessionRequest; eventId: string }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    await deleteMicrosoftCalendarEvent({
      accessToken,
      eventId: input.eventId,
    });

    return {
      connected: true as const,
    };
  }

  async getTodoTaskLists(req: SessionRequest) {
    const accessToken = await this.getValidMicrosoftAccessToken(req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
        lists: [],
      };
    }

    const lists = await listMicrosoftTodoTaskLists({ accessToken });

    return {
      connected: true as const,
      lists,
      defaultList:
        lists.find((list) => list.wellknownListName === 'defaultList') ?? null,
    };
  }

  async getTodoTasks(input: {
    req: SessionRequest;
    listId: string | undefined;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
        tasks: [],
      };
    }

    const listId =
      input.listId ?? (await getDefaultMicrosoftTodoListId({ accessToken }));
    const tasks = await listMicrosoftTodoTasks({ accessToken, listId });

    return {
      connected: true as const,
      listId,
      tasks,
    };
  }

  async createTodoTask(input: {
    req: SessionRequest;
    listId: string | undefined;
    title: string;
    body: string | undefined;
    dueDateTime: string | undefined;
    startDateTime: string | undefined;
    reminderDateTime: string | undefined;
    timezone: string | undefined;
    importance: MicrosoftTodoTaskImportance | undefined;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    const listId =
      input.listId ?? (await getDefaultMicrosoftTodoListId({ accessToken }));
    const task = await createMicrosoftTodoTask({
      accessToken,
      listId,
      title: input.title,
      body: input.body,
      dueDateTime: input.dueDateTime,
      startDateTime: input.startDateTime,
      reminderDateTime: input.reminderDateTime,
      timezone: input.timezone ?? 'Asia/Kolkata',
      importance: input.importance,
    });

    return {
      connected: true as const,
      listId,
      task,
    };
  }

  async updateTodoTask(input: {
    req: SessionRequest;
    listId: string | undefined;
    taskId: string;
    title: string | undefined;
    body: string | undefined;
    status: MicrosoftTodoTaskStatus | undefined;
    dueDateTime: string | null | undefined;
    startDateTime: string | null | undefined;
    reminderDateTime: string | null | undefined;
    timezone: string | undefined;
    importance: MicrosoftTodoTaskImportance | undefined;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    const listId =
      input.listId ?? (await getDefaultMicrosoftTodoListId({ accessToken }));
    const task = await updateMicrosoftTodoTask({
      accessToken,
      listId,
      taskId: input.taskId,
      title: input.title,
      body: input.body,
      status: input.status,
      dueDateTime: input.dueDateTime,
      startDateTime: input.startDateTime,
      reminderDateTime: input.reminderDateTime,
      timezone: input.timezone ?? 'Asia/Kolkata',
      importance: input.importance,
    });

    return {
      connected: true as const,
      listId,
      task,
    };
  }

  async deleteTodoTask(input: {
    req: SessionRequest;
    listId: string | undefined;
    taskId: string;
  }) {
    const accessToken = await this.getValidMicrosoftAccessToken(input.req);

    if (!accessToken) {
      return {
        connected: false as const,
        reauthRequired: true,
      };
    }

    const listId =
      input.listId ?? (await getDefaultMicrosoftTodoListId({ accessToken }));
    await deleteMicrosoftTodoTask({
      accessToken,
      listId,
      taskId: input.taskId,
    });

    return {
      connected: true as const,
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
