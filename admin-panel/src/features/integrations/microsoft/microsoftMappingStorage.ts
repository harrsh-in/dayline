export type MicrosoftMappingKind = 'calendar_event' | 'todo_task'

export type MicrosoftLocalMapping = {
  localItemId: string
  kind: MicrosoftMappingKind
  microsoftId: string
  microsoftTaskListId?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'dayline:microsoft:mappings'

export function getMicrosoftMappings(): MicrosoftLocalMapping[] {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as MicrosoftLocalMapping[]) : []
  } catch {
    return []
  }
}

export function saveMicrosoftMapping(
  mapping: Omit<MicrosoftLocalMapping, 'createdAt' | 'updatedAt'>,
): void {
  const now = new Date().toISOString()
  const existing = getMicrosoftMappings()
  const previous = existing.find(
    (item) =>
      item.localItemId === mapping.localItemId && item.kind === mapping.kind,
  )
  const withoutCurrent = existing.filter(
    (item) =>
      !(item.localItemId === mapping.localItemId && item.kind === mapping.kind),
  )

  const next: MicrosoftLocalMapping = {
    ...mapping,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...withoutCurrent, next]))
}

export function getMicrosoftMapping(input: {
  localItemId: string
  kind: MicrosoftMappingKind
}): MicrosoftLocalMapping | null {
  return (
    getMicrosoftMappings().find(
      (item) =>
        item.localItemId === input.localItemId && item.kind === input.kind,
    ) ?? null
  )
}

export function removeMicrosoftMapping(input: {
  localItemId: string
  kind: MicrosoftMappingKind
}): void {
  const next = getMicrosoftMappings().filter(
    (item) =>
      !(item.localItemId === input.localItemId && item.kind === input.kind),
  )

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
