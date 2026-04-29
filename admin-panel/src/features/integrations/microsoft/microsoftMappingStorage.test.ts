// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import {
  getMicrosoftMapping,
  getMicrosoftMappings,
  removeMicrosoftMapping,
  saveMicrosoftMapping,
} from './microsoftMappingStorage'

describe('microsoft mapping storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores provider ids without credentials and updates existing mappings', () => {
    saveMicrosoftMapping({
      localItemId: 'local-1',
      kind: 'todo_task',
      microsoftId: 'task-1',
      microsoftTaskListId: 'list-1',
    })

    saveMicrosoftMapping({
      localItemId: 'local-1',
      kind: 'todo_task',
      microsoftId: 'task-2',
      microsoftTaskListId: 'list-1',
    })

    const mappings = getMicrosoftMappings()

    expect(mappings).toHaveLength(1)
    expect(mappings[0]).toMatchObject({
      localItemId: 'local-1',
      kind: 'todo_task',
      microsoftId: 'task-2',
      microsoftTaskListId: 'list-1',
    })
    expect(JSON.stringify(mappings)).not.toContain('token')
    expect(mappings[0]?.createdAt).toBeTruthy()
    expect(mappings[0]?.updatedAt).toBeTruthy()
  })

  it('returns and removes mappings by local id and kind', () => {
    saveMicrosoftMapping({
      localItemId: 'local-event',
      kind: 'calendar_event',
      microsoftId: 'event-1',
    })

    expect(
      getMicrosoftMapping({
        localItemId: 'local-event',
        kind: 'calendar_event',
      })?.microsoftId,
    ).toBe('event-1')

    removeMicrosoftMapping({
      localItemId: 'local-event',
      kind: 'calendar_event',
    })

    expect(
      getMicrosoftMapping({
        localItemId: 'local-event',
        kind: 'calendar_event',
      }),
    ).toBeNull()
  })
})
