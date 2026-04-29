import { Check, Pencil, RefreshCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  createMicrosoftCalendarEvent,
  deleteMicrosoftCalendarEvent,
  updateMicrosoftCalendarEvent,
} from './microsoftCalendarApi'
import type { MicrosoftCalendarEvent } from './microsoftCalendarApi'
import {
  getMicrosoftMapping,
  removeMicrosoftMapping,
  saveMicrosoftMapping,
} from './microsoftMappingStorage'

type CalendarFormState = {
  localItemId: string
  subject: string
  body: string
  startDateTime: string
  endDateTime: string
  location: string
}

const emptyCalendarForm: CalendarFormState = {
  localItemId: '',
  subject: '',
  body: '',
  startDateTime: '2026-05-02T15:00:00',
  endDateTime: '2026-05-02T15:30:00',
  location: '',
}

export function MicrosoftCalendarCrudPanel(props: {
  events: MicrosoftCalendarEvent[]
  isLoadingEvents: boolean
  onRefresh: () => Promise<void>
  onPermissionError: () => void
}) {
  const [form, setForm] = useState<CalendarFormState>(emptyCalendarForm)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = (field: keyof CalendarFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : 'Microsoft calendar request failed'

    if (message.includes('401') || message.includes('403')) {
      props.onPermissionError()
    }

    setStatus(message)
  }

  const createEvent = async () => {
    if (!form.subject || !form.startDateTime || !form.endDateTime) {
      setStatus('Subject, start, and end are required.')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await createMicrosoftCalendarEvent({
        subject: form.subject,
        body: form.body || undefined,
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        timezone: 'Asia/Kolkata',
        location: form.location || undefined,
      })

      if (form.localItemId) {
        saveMicrosoftMapping({
          localItemId: form.localItemId,
          kind: 'calendar_event',
          microsoftId: result.event.id,
        })
      }

      setStatus('Event created.')
      setForm(emptyCalendarForm)
      await props.onRefresh()
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateEvent = async (eventId: string) => {
    setIsSubmitting(true)
    setStatus(null)

    try {
      await updateMicrosoftCalendarEvent(eventId, {
        subject: form.subject,
        body: form.body,
        startDateTime: form.startDateTime,
        endDateTime: form.endDateTime,
        timezone: 'Asia/Kolkata',
        location: form.location,
      })

      if (form.localItemId) {
        const mapping = getMicrosoftMapping({
          localItemId: form.localItemId,
          kind: 'calendar_event',
        })

        if (mapping) {
          saveMicrosoftMapping({
            localItemId: form.localItemId,
            kind: 'calendar_event',
            microsoftId: eventId,
          })
        }
      }

      setStatus('Event updated.')
      setEditingEventId(null)
      setForm(emptyCalendarForm)
      await props.onRefresh()
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeEvent = async (eventId: string) => {
    setIsSubmitting(true)
    setStatus(null)

    try {
      await deleteMicrosoftCalendarEvent(eventId)

      if (form.localItemId) {
        removeMicrosoftMapping({
          localItemId: form.localItemId,
          kind: 'calendar_event',
        })
      }

      setStatus('Event deleted.')
      await props.onRefresh()
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateMappedEvent = async () => {
    if (!form.localItemId) {
      setStatus('Local Dayline event ID is required.')
      return
    }

    const mapping = getMicrosoftMapping({
      localItemId: form.localItemId,
      kind: 'calendar_event',
    })

    if (!mapping) {
      setStatus('No Microsoft Calendar mapping found for that local ID.')
      return
    }

    await updateEvent(mapping.microsoftId)
  }

  const removeMappedEvent = async () => {
    if (!form.localItemId) {
      setStatus('Local Dayline event ID is required.')
      return
    }

    const mapping = getMicrosoftMapping({
      localItemId: form.localItemId,
      kind: 'calendar_event',
    })

    if (!mapping) {
      setStatus('No Microsoft Calendar mapping found for that local ID.')
      return
    }

    await removeEvent(mapping.microsoftId)
  }

  const startEditing = (event: MicrosoftCalendarEvent) => {
    setEditingEventId(event.id)
    setForm({
      localItemId: '',
      subject: event.title,
      body: event.bodyPreview ?? '',
      startDateTime: event.startsAt.slice(0, 19),
      endDateTime: event.endsAt.slice(0, 19),
      location: '',
    })
  }

  return (
    <section className="border border-ui-border p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-medium">Calendar Events</h2>
          <p className="mt-1 text-sm text-ui-text-muted">
            Create, update, and delete Microsoft Calendar events.
          </p>
        </div>
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void props.onRefresh()}
          disabled={props.isLoadingEvents}
        >
          <RefreshCcw aria-hidden="true" className="size-4" />
          {props.isLoadingEvents ? 'Fetching' : 'Refresh events'}
        </button>
      </div>

      {status ? (
        <p className="mb-4 text-sm text-ui-text-muted" role="status">
          {status}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input-base"
          value={form.localItemId}
          onChange={(event) => setField('localItemId', event.target.value)}
          placeholder="Local Dayline event ID"
        />
        <input
          className="input-base"
          value={form.subject}
          onChange={(event) => setField('subject', event.target.value)}
          placeholder="Event title"
        />
        <input
          className="input-base"
          value={form.startDateTime}
          onChange={(event) => setField('startDateTime', event.target.value)}
          placeholder="2026-05-02T15:00:00"
        />
        <input
          className="input-base"
          value={form.endDateTime}
          onChange={(event) => setField('endDateTime', event.target.value)}
          placeholder="2026-05-02T15:30:00"
        />
        <input
          className="input-base"
          value={form.location}
          onChange={(event) => setField('location', event.target.value)}
          placeholder="Location"
        />
        <input
          className="input-base"
          value={form.body}
          onChange={(event) => setField('body', event.target.value)}
          placeholder="Notes"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn-primary gap-2"
          type="button"
          onClick={() => void createEvent()}
          disabled={isSubmitting}
        >
          <Check aria-hidden="true" className="size-4" />
          Create event
        </button>
        {editingEventId ? (
          <button
            className="btn-secondary gap-2"
            type="button"
            onClick={() => void updateEvent(editingEventId)}
            disabled={isSubmitting}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Save edit
          </button>
        ) : null}
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void updateMappedEvent()}
          disabled={isSubmitting}
        >
          <Pencil aria-hidden="true" className="size-4" />
          Update mapped event
        </button>
        <button
          className="btn-ghost gap-2"
          type="button"
          onClick={() => void removeMappedEvent()}
          disabled={isSubmitting}
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete mapped event
        </button>
      </div>

      <ul className="mt-6 divide-y divide-ui-border border-y border-ui-border">
        {props.events.length === 0 ? (
          <li className="py-4 text-sm text-ui-text-muted">
            No Microsoft Calendar events found.
          </li>
        ) : null}

        {props.events.map((event) => (
          <li key={event.id} className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="mt-1 text-sm text-ui-text-muted">
                  {event.startsAt} to {event.endsAt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-ghost gap-2"
                  type="button"
                  onClick={() => startEditing(event)}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Edit
                </button>
                <button
                  className="btn-ghost gap-2"
                  type="button"
                  onClick={() => void removeEvent(event.id)}
                  disabled={isSubmitting}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
