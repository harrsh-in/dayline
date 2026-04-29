const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export type MicrosoftTodoTaskStatus =
  | 'notStarted'
  | 'inProgress'
  | 'completed'
  | 'waitingOnOthers'
  | 'deferred'

export type MicrosoftTodoTaskInput = {
  listId?: string
  title: string
  body?: string
  dueDateTime?: string
  startDateTime?: string
  reminderDateTime?: string
  timezone?: string
  importance?: 'low' | 'normal' | 'high'
}

export type MicrosoftTodoTask = {
  id: string
  title: string
  status?: MicrosoftTodoTaskStatus
  importance?: 'low' | 'normal' | 'high'
  dueDateTime?: {
    dateTime: string
    timeZone: string
  }
}

export type MicrosoftTodoTaskList = {
  id: string
  displayName: string
  wellknownListName?: string
}

export async function listMicrosoftTodoLists() {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/tasks/lists`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`List Microsoft To Do lists failed: ${response.status}`)
  }

  return response.json() as Promise<{
    connected: true
    lists: MicrosoftTodoTaskList[]
    defaultList: MicrosoftTodoTaskList | null
  }>
}

export async function listMicrosoftTodoTasks(listId?: string) {
  const params = new URLSearchParams()

  if (listId) {
    params.set('listId', listId)
  }

  const query = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/tasks${query ? `?${query}` : ''}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error(`List Microsoft To Do tasks failed: ${response.status}`)
  }

  return response.json() as Promise<{
    connected: true
    listId: string
    tasks: MicrosoftTodoTask[]
  }>
}

export async function createMicrosoftTodoTask(input: MicrosoftTodoTaskInput) {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/tasks`,
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
    throw new Error(`Create Microsoft To Do task failed: ${response.status}`)
  }

  return response.json() as Promise<{
    listId: string
    task: MicrosoftTodoTask
  }>
}

export async function updateMicrosoftTodoTask(input: {
  listId: string
  taskId: string
  patch: Partial<MicrosoftTodoTaskInput> & {
    status?: MicrosoftTodoTaskStatus
  }
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/tasks/${encodeURIComponent(input.taskId)}?listId=${encodeURIComponent(input.listId)}`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input.patch),
    },
  )

  if (!response.ok) {
    throw new Error(`Update Microsoft To Do task failed: ${response.status}`)
  }

  return response.json() as Promise<{
    listId: string
    task: MicrosoftTodoTask
  }>
}

export async function deleteMicrosoftTodoTask(input: {
  listId: string
  taskId: string
}): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/microsoft/tasks/${encodeURIComponent(input.taskId)}?listId=${encodeURIComponent(input.listId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  )

  if (!response.ok && response.status !== 404) {
    throw new Error(`Delete Microsoft To Do task failed: ${response.status}`)
  }
}
