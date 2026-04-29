import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ExternalLink, RefreshCcw, Unplug } from 'lucide-react';
import { api } from '../../lib/api';

type MicrosoftStatus =
  | {
      connected: false;
      account: null;
    }
  | {
      connected: true;
      account: {
        id: string;
        displayName?: string;
        email?: string;
      };
    };

type MicrosoftCalendarEvent = {
  id: string;
  title: string;
  bodyPreview?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isAllDay: boolean;
  showAs?: string;
  webLink?: string;
  source: 'microsoft';
};

type MicrosoftEventsResponse =
  | {
      connected: true;
      events: MicrosoftCalendarEvent[];
    }
  | {
      connected: false;
      reauthRequired?: boolean;
      events: [];
    };

function getDefaultRange(): { from: string; to: string } {
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

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getAccountLabel(status: MicrosoftStatus): string {
  if (!status.connected) {
    return '';
  }

  return status.account.email ?? status.account.displayName ?? 'Microsoft account';
}

export function MicrosoftCalendarIntegration() {
  const [status, setStatus] = useState<MicrosoftStatus | null>(null);
  const [events, setEvents] = useState<MicrosoftCalendarEvent[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => getDefaultRange(), []);

  const connect = useCallback(() => {
    window.location.href = `${api.baseUrl}/api/integrations/microsoft/connect`;
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        timezone: 'Asia/Kolkata',
      });

      const response = await fetch(
        `${api.baseUrl}/api/integrations/microsoft/events?${params.toString()}`,
        {
          credentials: 'include',
        },
      );

      if (response.status === 401) {
        setStatus({
          connected: false,
          account: null,
        });
        setEvents([]);
        setError('Microsoft Calendar is disconnected. Connect again.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = (await response.json()) as MicrosoftEventsResponse;

      if (!data.connected) {
        setStatus({
          connected: false,
          account: null,
        });
        setEvents([]);
        return;
      }

      setEvents(data.events);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch Microsoft Calendar events',
      );
    } finally {
      setIsLoadingEvents(false);
    }
  }, [range.from, range.to]);

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setError(null);

    try {
      const data = await api.get<MicrosoftStatus>(
        '/api/integrations/microsoft/status',
      );
      setStatus(data);

      if (data.connected) {
        await loadEvents();
      } else {
        setEvents([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to check Microsoft Calendar status',
      );
    } finally {
      setIsLoadingStatus(false);
    }
  }, [loadEvents]);

  const disconnect = useCallback(async () => {
    setError(null);

    try {
      await api.post<{ connected: false }>(
        '/api/integrations/microsoft/disconnect',
      );
      setStatus({
        connected: false,
        account: null,
      });
      setEvents([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to disconnect Microsoft Calendar',
      );
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const isConnected = status?.connected === true;

  return (
    <main className="min-h-screen bg-ui-surface px-6 py-8 text-ui-text">
      <section className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-ui-border pb-6">
          <div>
            <p className="mb-2 text-sm font-medium text-ui-text-muted">
              Settings
            </p>
            <h1 className="text-3xl font-semibold tracking-normal">
              Calendar integrations
            </h1>
          </div>
          <CalendarDays aria-hidden="true" className="mt-1 size-6" />
        </header>

        {error ? (
          <div
            role="alert"
            className="mb-5 border border-status-error/30 bg-status-error/5 px-4 py-3 text-sm text-status-error"
          >
            {error}
          </div>
        ) : null}

        {isLoadingStatus ? (
          <p className="text-sm text-ui-text-muted">
            Checking Microsoft Calendar connection...
          </p>
        ) : null}

        {!isLoadingStatus && !isConnected ? (
          <div className="border border-ui-border p-5">
            <div className="mb-5">
              <h2 className="text-lg font-medium">Microsoft Calendar</h2>
              <p className="mt-1 text-sm text-ui-text-muted">
                Connect Outlook events to your Dayline schedule.
              </p>
            </div>

            <button className="btn-primary" type="button" onClick={connect}>
              Connect Microsoft Calendar
            </button>
          </div>
        ) : null}

        {!isLoadingStatus && isConnected ? (
          <div className="space-y-8">
            <section className="border border-ui-border p-5">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-medium">Microsoft Calendar</h2>
                  <p className="mt-1 text-sm text-ui-text-muted">
                    Connected as{' '}
                    <span className="font-medium text-ui-text">
                      {getAccountLabel(status)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-secondary gap-2"
                    type="button"
                    onClick={() => void loadEvents()}
                    disabled={isLoadingEvents}
                  >
                    <RefreshCcw aria-hidden="true" className="size-4" />
                    {isLoadingEvents ? 'Fetching' : 'Refresh'}
                  </button>

                  <button
                    className="btn-ghost gap-2"
                    type="button"
                    onClick={() => void disconnect()}
                  >
                    <Unplug aria-hidden="true" className="size-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">Events</h2>
                  <p className="mt-1 text-sm text-ui-text-muted">
                    Last 7 days through the next 30 days.
                  </p>
                </div>
                <span className="text-sm text-ui-text-muted">
                  {events.length} {events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {events.length === 0 ? (
                <div className="border border-ui-border p-5 text-sm text-ui-text-muted">
                  No Microsoft Calendar events found for this date range.
                </div>
              ) : (
                <ul className="divide-y divide-ui-border border-y border-ui-border">
                  {events.map((event) => (
                    <li key={event.id} className="py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{event.title}</h3>
                            {event.isAllDay ? (
                              <span className="text-xs text-ui-text-muted">
                                All day
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-ui-text-muted">
                            {formatDateTime(event.startsAt)} to{' '}
                            {formatDateTime(event.endsAt)}
                          </p>
                        </div>

                        {event.webLink ? (
                          <a
                            className="btn-ghost gap-2 self-start"
                            href={event.webLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink aria-hidden="true" className="size-4" />
                            Open
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
