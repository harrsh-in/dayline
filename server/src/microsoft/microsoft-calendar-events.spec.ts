import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  createMicrosoftCalendarEvent,
  deleteMicrosoftCalendarEvent,
  normalizeMicrosoftCalendarEvent,
  updateMicrosoftCalendarEvent,
} from './microsoft-calendar-events';

describe('microsoft calendar event mutations', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('creates calendar events with the expected Graph payload', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValueOnce(
      Response.json({
        id: 'event-1',
        subject: 'Client call',
        start: {
          dateTime: '2026-05-02T15:00:00',
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: '2026-05-02T15:30:00',
          timeZone: 'Asia/Kolkata',
        },
      }),
    );
    global.fetch = fetchMock;

    const event = await createMicrosoftCalendarEvent({
      accessToken: 'token',
      subject: 'Client call',
      body: 'Agenda',
      startDateTime: '2026-05-02T15:00:00',
      endDateTime: '2026-05-02T15:30:00',
      timezone: 'Asia/Kolkata',
      location: 'Zoom',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(init.body as string) as Record<string, unknown>;

    expect(url).toBe('https://graph.microsoft.com/v1.0/me/calendar/events');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      authorization: 'Bearer token',
      'content-type': 'application/json',
    });
    expect(payload).toMatchObject({
      subject: 'Client call',
      body: {
        contentType: 'HTML',
        content: 'Agenda',
      },
      start: {
        dateTime: '2026-05-02T15:00:00',
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: '2026-05-02T15:30:00',
        timeZone: 'Asia/Kolkata',
      },
      location: {
        displayName: 'Zoom',
      },
    });
    expect(event.id).toBe('event-1');
  });

  it('patches calendar events by encoded event id', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValueOnce(
      Response.json({
        id: 'event/1',
        subject: 'Updated call',
        start: {
          dateTime: '2026-05-02T16:00:00',
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: '2026-05-02T16:30:00',
          timeZone: 'Asia/Kolkata',
        },
      }),
    );
    global.fetch = fetchMock;

    await updateMicrosoftCalendarEvent({
      accessToken: 'token',
      eventId: 'event/1',
      subject: 'Updated call',
      startDateTime: '2026-05-02T16:00:00',
      endDateTime: '2026-05-02T16:30:00',
      timezone: 'Asia/Kolkata',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(init.body as string) as Record<string, unknown>;

    expect(url).toBe('https://graph.microsoft.com/v1.0/me/events/event%2F1');
    expect(init.method).toBe('PATCH');
    expect(payload).toMatchObject({
      subject: 'Updated call',
      start: {
        dateTime: '2026-05-02T16:00:00',
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: '2026-05-02T16:30:00',
        timeZone: 'Asia/Kolkata',
      },
    });
  });

  it('treats deleted or missing calendar events as deleted', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    global.fetch = fetchMock;

    await expect(
      deleteMicrosoftCalendarEvent({
        accessToken: 'token',
        eventId: 'event-1',
      }),
    ).resolves.toBeUndefined();
  });

  it('normalizes calendar events with the microsoft calendar source', () => {
    expect(
      normalizeMicrosoftCalendarEvent({
        id: 'event-1',
        subject: undefined,
        bodyPreview: 'Preview',
        start: {
          dateTime: '2026-05-02T15:00:00',
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: '2026-05-02T15:30:00',
          timeZone: 'Asia/Kolkata',
        },
      }),
    ).toEqual({
      id: 'event-1',
      title: '(No title)',
      bodyPreview: 'Preview',
      startsAt: '2026-05-02T15:00:00',
      endsAt: '2026-05-02T15:30:00',
      timezone: 'Asia/Kolkata',
      isAllDay: false,
      showAs: undefined,
      webLink: undefined,
      source: 'microsoft_calendar',
    });
  });
});
