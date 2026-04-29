import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  graphFetch,
  listMicrosoftCalendarEvents,
  normalizeMicrosoftCalendarEvent,
} from './microsoft-graph';

describe('microsoft graph helpers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('retries retryable Graph responses', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response('too many requests', {
          status: 429,
          headers: {
            'retry-after': '0',
          },
        }),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    global.fetch = fetchMock;

    const response = await graphFetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        authorization: 'Bearer token',
      },
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fetches bounded calendarView pages with the Outlook timezone preference', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          value: [
            {
              id: 'event-1',
              subject: 'Planning',
              start: {
                dateTime: '2026-04-29T10:00:00.0000000',
                timeZone: 'Asia/Kolkata',
              },
              end: {
                dateTime: '2026-04-29T10:30:00.0000000',
                timeZone: 'Asia/Kolkata',
              },
            },
          ],
          '@odata.nextLink': 'https://graph.microsoft.com/page-2',
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          value: [
            {
              id: 'event-2',
              subject: 'Review',
              start: {
                dateTime: '2026-04-30T12:00:00.0000000',
                timeZone: 'Asia/Kolkata',
              },
              end: {
                dateTime: '2026-04-30T12:30:00.0000000',
                timeZone: 'Asia/Kolkata',
              },
            },
          ],
        }),
      );

    global.fetch = fetchMock;

    const events = await listMicrosoftCalendarEvents({
      accessToken: 'token',
      from: '2026-04-22T00:00:00.000Z',
      to: '2026-05-29T00:00:00.000Z',
      timezone: 'Asia/Kolkata',
    });

    const firstUrl = new URL(fetchMock.mock.calls[0]?.[0] as string);
    const firstInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(firstUrl.pathname).toBe('/v1.0/me/calendarView');
    expect(firstUrl.searchParams.get('startDateTime')).toBe(
      '2026-04-22T00:00:00.000Z',
    );
    expect(firstUrl.searchParams.get('endDateTime')).toBe(
      '2026-05-29T00:00:00.000Z',
    );
    expect(firstUrl.searchParams.get('$top')).toBe('50');
    expect(firstUrl.searchParams.get('$select')).toContain('subject');
    expect(firstInit.headers).toMatchObject({
      authorization: 'Bearer token',
      prefer: 'outlook.timezone="Asia/Kolkata"',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(events).toHaveLength(2);
  });

  it('normalizes Microsoft events for the frontend without exposing tokens', () => {
    expect(
      normalizeMicrosoftCalendarEvent({
        id: 'event-1',
        subject: undefined,
        bodyPreview: 'Preview',
        start: {
          dateTime: '2026-04-29T10:00:00.0000000',
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: '2026-04-29T10:30:00.0000000',
          timeZone: 'Asia/Kolkata',
        },
        isAllDay: undefined,
        showAs: 'busy',
        webLink: 'https://outlook.office.com/event',
        createdDateTime: undefined,
        lastModifiedDateTime: undefined,
      }),
    ).toEqual({
      id: 'event-1',
      title: '(No title)',
      bodyPreview: 'Preview',
      startsAt: '2026-04-29T10:00:00.0000000',
      endsAt: '2026-04-29T10:30:00.0000000',
      timezone: 'Asia/Kolkata',
      isAllDay: false,
      showAs: 'busy',
      webLink: 'https://outlook.office.com/event',
      source: 'microsoft_calendar',
    });
  });
});
