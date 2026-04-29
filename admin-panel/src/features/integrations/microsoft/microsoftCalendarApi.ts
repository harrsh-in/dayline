const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export type MicrosoftCalendarEvent = {
  id: string
  title: string
  bodyPreview?: string
  startsAt: string
  endsAt: string
  timezone: string
  isAllDay: boolean
  showAs?: string
  webLink?: string
  source: 'microsoft_calendar'
}

export type MicrosoftCalendarEventInput = {
  subject: string
  body: string | undefined
  startDateTime: string
  endDateTime: string
  timezone: string | undefined
  location: string | undefined
}

export async function createMicrosoftCalendarEvent(
  input: MicrosoftCalendarEventInput,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/events`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  if (!response.ok) {
    throw new Error(`Create Microsoft event failed: ${response.status}`)
  }

  return response.json() as Promise<{ event: MicrosoftCalendarEvent }>
}

export async function updateMicrosoftCalendarEvent(
  eventId: string,
  input: Partial<MicrosoftCalendarEventInput>,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  if (!response.ok) {
    throw new Error(`Update Microsoft event failed: ${response.status}`)
  }

  return response.json() as Promise<{ event: MicrosoftCalendarEvent }>
}

export async function deleteMicrosoftCalendarEvent(
  eventId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete Microsoft event failed: ${response.status}`)
  }
}
