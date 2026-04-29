import { graphFetch } from './microsoft-graph';
import type {
  MicrosoftCalendarEvent,
  NormalizedMicrosoftCalendarEvent,
} from './microsoft-types';

export function normalizeMicrosoftCalendarEvent(
  event: MicrosoftCalendarEvent,
): NormalizedMicrosoftCalendarEvent {
  return {
    id: event.id,
    title: event.subject ?? '(No title)',
    bodyPreview: event.bodyPreview,
    startsAt: event.start.dateTime,
    endsAt: event.end.dateTime,
    timezone: event.start.timeZone,
    isAllDay: event.isAllDay ?? false,
    showAs: event.showAs,
    webLink: event.webLink,
    source: 'microsoft_calendar',
  };
}

export async function createMicrosoftCalendarEvent(input: {
  accessToken: string;
  subject: string;
  body?: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location?: string;
}): Promise<MicrosoftCalendarEvent> {
  const payload = {
    subject: input.subject,
    body: {
      contentType: 'HTML',
      content: input.body ?? '',
    },
    start: {
      dateTime: input.startDateTime,
      timeZone: input.timezone,
    },
    end: {
      dateTime: input.endDateTime,
      timeZone: input.timezone,
    },
    ...(input.location
      ? {
          location: {
            displayName: input.location,
          },
        }
      : {}),
  };

  const response = await graphFetch(
    'https://graph.microsoft.com/v1.0/me/calendar/events',
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Create Microsoft calendar event failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftCalendarEvent>;
}

export async function updateMicrosoftCalendarEvent(input: {
  accessToken: string;
  eventId: string;
  subject?: string;
  body?: string;
  startDateTime?: string;
  endDateTime?: string;
  timezone?: string;
  location?: string;
}): Promise<MicrosoftCalendarEvent> {
  const payload: Record<string, unknown> = {};

  if (input.subject !== undefined) {
    payload.subject = input.subject;
  }

  if (input.body !== undefined) {
    payload.body = {
      contentType: 'HTML',
      content: input.body,
    };
  }

  if (input.startDateTime !== undefined) {
    payload.start = {
      dateTime: input.startDateTime,
      timeZone: input.timezone ?? 'Asia/Kolkata',
    };
  }

  if (input.endDateTime !== undefined) {
    payload.end = {
      dateTime: input.endDateTime,
      timeZone: input.timezone ?? 'Asia/Kolkata',
    };
  }

  if (input.location !== undefined) {
    payload.location = {
      displayName: input.location,
    };
  }

  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(input.eventId)}`,
    {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Update Microsoft calendar event failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftCalendarEvent>;
}

export async function deleteMicrosoftCalendarEvent(input: {
  accessToken: string;
  eventId: string;
}): Promise<void> {
  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(input.eventId)}`,
    {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
    },
  );

  if (response.status === 204 || response.status === 404) {
    return;
  }

  const text = await response.text();
  throw new Error(
    `Delete Microsoft calendar event failed: ${response.status} ${text}`,
  );
}
