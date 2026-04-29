import type {
  MicrosoftCalendarEvent,
  MicrosoftCalendarViewResponse,
} from './microsoft-types';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function graphFetch(
  url: string,
  init: RequestInit,
  attempt = 0,
): Promise<Response> {
  const response = await fetch(url, init);
  const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);

  if (!retryableStatusCodes.has(response.status) || attempt >= 3) {
    return response;
  }

  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfterMs = retryAfterHeader
    ? Number(retryAfterHeader) * 1000
    : Math.min(1000 * 2 ** attempt, 4000);

  await sleep(retryAfterMs);

  return graphFetch(url, init, attempt + 1);
}

export async function listMicrosoftCalendarEvents(input: {
  accessToken: string;
  from: string;
  to: string;
  timezone: string;
}): Promise<MicrosoftCalendarEvent[]> {
  const select = [
    'id',
    'subject',
    'bodyPreview',
    'start',
    'end',
    'isAllDay',
    'showAs',
    'webLink',
    'createdDateTime',
    'lastModifiedDateTime',
  ].join(',');

  const params = new URLSearchParams({
    startDateTime: input.from,
    endDateTime: input.to,
    $select: select,
    $top: '50',
  });

  let url = `https://graph.microsoft.com/v1.0/me/calendarView?${params.toString()}`;
  const events: MicrosoftCalendarEvent[] = [];
  let page = 0;
  const maxPages = 5;

  while (url && page < maxPages) {
    page += 1;

    const response = await graphFetch(url, {
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        prefer: `outlook.timezone="${input.timezone}"`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Microsoft calendarView failed: ${response.status} ${text}`,
      );
    }

    const data = (await response.json()) as MicrosoftCalendarViewResponse;
    events.push(...data.value);
    url = data['@odata.nextLink'] ?? '';
  }

  return events;
}

export { normalizeMicrosoftCalendarEvent } from './microsoft-calendar-events';
