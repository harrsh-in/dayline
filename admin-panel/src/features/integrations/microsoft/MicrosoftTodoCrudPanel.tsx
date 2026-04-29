import { useState } from 'react'
import { Check, ListTodo, Pencil, RefreshCcw, Trash2 } from 'lucide-react'
import {
  createMicrosoftTodoTask,
  deleteMicrosoftTodoTask,
  listMicrosoftTodoLists,
  listMicrosoftTodoTasks,
  type MicrosoftTodoTask,
  type MicrosoftTodoTaskList,
  updateMicrosoftTodoTask,
} from './microsoftTodoApi'
import {
  getMicrosoftMapping,
  removeMicrosoftMapping,
  saveMicrosoftMapping,
} from './microsoftMappingStorage'

type TodoFormState = {
  localItemId: string
  title: string
  body: string
  dueDateTime: string
}

const emptyTodoForm: TodoFormState = {
  localItemId: '',
  title: '',
  body: '',
  dueDateTime: '2026-05-02T15:00:00',
}

export function MicrosoftTodoCrudPanel(props: {
  onPermissionError: () => void
}) {
  const [lists, setLists] = useState<MicrosoftTodoTaskList[]>([])
  const [selectedListId, setSelectedListId] = useState('')
  const [tasks, setTasks] = useState<MicrosoftTodoTask[]>([])
  const [form, setForm] = useState<TodoFormState>(emptyTodoForm)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = (field: keyof TodoFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Microsoft To Do request failed'

    if (message.includes('401') || message.includes('403')) {
      props.onPermissionError()
    }

    setStatus(message)
  }

  const fetchLists = async () => {
    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await listMicrosoftTodoLists()
      setLists(result.lists)
      setSelectedListId(
        (current) =>
          current || result.defaultList?.id || result.lists[0]?.id || '',
      )
      setStatus('Task lists fetched.')
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchTasks = async (listId = selectedListId) => {
    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await listMicrosoftTodoTasks(listId || undefined)
      setSelectedListId(result.listId)
      setTasks(result.tasks)
      setStatus('Tasks fetched.')
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const createTask = async () => {
    if (!form.title) {
      setStatus('Task title is required.')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await createMicrosoftTodoTask({
        listId: selectedListId || undefined,
        title: form.title,
        body: form.body || undefined,
        dueDateTime: form.dueDateTime || undefined,
        timezone: 'Asia/Kolkata',
      })

      if (form.localItemId) {
        saveMicrosoftMapping({
          localItemId: form.localItemId,
          kind: 'todo_task',
          microsoftId: result.task.id,
          microsoftTaskListId: result.listId,
        })
      }

      setSelectedListId(result.listId)
      setStatus('Task created.')
      setForm(emptyTodoForm)
      await fetchTasks(result.listId)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateTask = async (taskId: string, listId = selectedListId) => {
    if (!listId) {
      setStatus('Select a task list first.')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      await updateMicrosoftTodoTask({
        listId,
        taskId,
        patch: {
          title: form.title || undefined,
          body: form.body || undefined,
          dueDateTime: form.dueDateTime || undefined,
          timezone: 'Asia/Kolkata',
        },
      })
      setStatus('Task updated.')
      setEditingTaskId(null)
      setForm(emptyTodoForm)
      await fetchTasks(listId)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completeTask = async (taskId: string, listId = selectedListId) => {
    if (!listId) {
      setStatus('Select a task list first.')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      await updateMicrosoftTodoTask({
        listId,
        taskId,
        patch: {
          status: 'completed',
        },
      })
      setStatus('Task completed.')
      await fetchTasks(listId)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeTask = async (taskId: string, listId = selectedListId) => {
    if (!listId) {
      setStatus('Select a task list first.')
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      await deleteMicrosoftTodoTask({
        listId,
        taskId,
      })

      if (form.localItemId) {
        removeMicrosoftMapping({
          localItemId: form.localItemId,
          kind: 'todo_task',
        })
      }

      setStatus('Task deleted.')
      await fetchTasks(listId)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateMappedTask = async () => {
    if (!form.localItemId) {
      setStatus('Local Dayline todo ID is required.')
      return
    }

    const mapping = getMicrosoftMapping({
      localItemId: form.localItemId,
      kind: 'todo_task',
    })

    if (!mapping?.microsoftTaskListId) {
      setStatus('No Microsoft To Do mapping found for that local ID.')
      return
    }

    setSelectedListId(mapping.microsoftTaskListId)
    await updateTask(mapping.microsoftId, mapping.microsoftTaskListId)
  }

  const completeMappedTask = async () => {
    if (!form.localItemId) {
      setStatus('Local Dayline todo ID is required.')
      return
    }

    const mapping = getMicrosoftMapping({
      localItemId: form.localItemId,
      kind: 'todo_task',
    })

    if (!mapping?.microsoftTaskListId) {
      setStatus('No Microsoft To Do mapping found for that local ID.')
      return
    }

    setSelectedListId(mapping.microsoftTaskListId)
    await completeTask(mapping.microsoftId, mapping.microsoftTaskListId)
  }

  const removeMappedTask = async () => {
    if (!form.localItemId) {
      setStatus('Local Dayline todo ID is required.')
      return
    }

    const mapping = getMicrosoftMapping({
      localItemId: form.localItemId,
      kind: 'todo_task',
    })

    if (!mapping?.microsoftTaskListId) {
      setStatus('No Microsoft To Do mapping found for that local ID.')
      return
    }

    setSelectedListId(mapping.microsoftTaskListId)
    await removeTask(mapping.microsoftId, mapping.microsoftTaskListId)
  }

  const startEditing = (task: MicrosoftTodoTask) => {
    setEditingTaskId(task.id)
    setForm({
      localItemId: '',
      title: task.title,
      body: '',
      dueDateTime: task.dueDateTime?.dateTime ?? '',
    })
  }

  return (
    <section className="border border-ui-border p-5">
      <div className="mb-5">
        <h2 className="text-lg font-medium">Microsoft To Do</h2>
        <p className="mt-1 text-sm text-ui-text-muted">
          Fetch lists and create, update, complete, or delete To Do tasks.
        </p>
      </div>

      {status ? (
        <p className="mb-4 text-sm text-ui-text-muted" role="status">
          {status}
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void fetchLists()}
          disabled={isSubmitting}
        >
          <ListTodo aria-hidden="true" className="size-4" />
          Fetch task lists
        </button>
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void fetchTasks()}
          disabled={isSubmitting}
        >
          <RefreshCcw aria-hidden="true" className="size-4" />
          Fetch tasks
        </button>
      </div>

      <select
        className="input-base mb-5"
        value={selectedListId}
        onChange={(event) => {
          setSelectedListId(event.target.value)
          void fetchTasks(event.target.value)
        }}
      >
        <option value="">Default task list</option>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.displayName}
          </option>
        ))}
      </select>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="input-base"
          value={form.localItemId}
          onChange={(event) => setField('localItemId', event.target.value)}
          placeholder="Local Dayline todo ID"
        />
        <input
          className="input-base"
          value={form.title}
          onChange={(event) => setField('title', event.target.value)}
          placeholder="Task title"
        />
        <input
          className="input-base"
          value={form.dueDateTime}
          onChange={(event) => setField('dueDateTime', event.target.value)}
          placeholder="2026-05-02T15:00:00"
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
          onClick={() => void createTask()}
          disabled={isSubmitting}
        >
          <Check aria-hidden="true" className="size-4" />
          Create task
        </button>
        {editingTaskId ? (
          <button
            className="btn-secondary gap-2"
            type="button"
            onClick={() => void updateTask(editingTaskId)}
            disabled={isSubmitting}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Save edit
          </button>
        ) : null}
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void updateMappedTask()}
          disabled={isSubmitting}
        >
          <Pencil aria-hidden="true" className="size-4" />
          Update mapped task
        </button>
        <button
          className="btn-secondary gap-2"
          type="button"
          onClick={() => void completeMappedTask()}
          disabled={isSubmitting}
        >
          <Check aria-hidden="true" className="size-4" />
          Complete mapped task
        </button>
        <button
          className="btn-ghost gap-2"
          type="button"
          onClick={() => void removeMappedTask()}
          disabled={isSubmitting}
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Delete mapped task
        </button>
      </div>

      <ul className="mt-6 divide-y divide-ui-border border-y border-ui-border">
        {tasks.length === 0 ? (
          <li className="py-4 text-sm text-ui-text-muted">
            No Microsoft To Do tasks loaded.
          </li>
        ) : null}

        {tasks.map((task) => (
          <li key={task.id} className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="mt-1 text-sm text-ui-text-muted">
                  {task.status ?? 'notStarted'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-ghost gap-2"
                  type="button"
                  onClick={() => void completeTask(task.id)}
                  disabled={isSubmitting}
                >
                  <Check aria-hidden="true" className="size-4" />
                  Complete
                </button>
                <button
                  className="btn-ghost gap-2"
                  type="button"
                  onClick={() => startEditing(task)}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Edit
                </button>
                <button
                  className="btn-ghost gap-2"
                  type="button"
                  onClick={() => void removeTask(task.id)}
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
