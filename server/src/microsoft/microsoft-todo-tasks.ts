import { graphFetch } from './microsoft-graph';
import type {
  MicrosoftCollectionResponse,
  MicrosoftTodoTask,
  MicrosoftTodoTaskImportance,
  MicrosoftTodoTaskList,
  MicrosoftTodoTaskStatus,
} from './microsoft-types';

export async function listMicrosoftTodoTaskLists(input: {
  accessToken: string;
}): Promise<MicrosoftTodoTaskList[]> {
  const response = await graphFetch(
    'https://graph.microsoft.com/v1.0/me/todo/lists',
    {
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `List Microsoft To Do lists failed: ${response.status} ${text}`,
    );
  }

  const data =
    (await response.json()) as MicrosoftCollectionResponse<MicrosoftTodoTaskList>;
  return data.value;
}

export async function getDefaultMicrosoftTodoListId(input: {
  accessToken: string;
}): Promise<string> {
  const lists = await listMicrosoftTodoTaskLists({
    accessToken: input.accessToken,
  });
  const defaultList = lists.find(
    (list) => list.wellknownListName === 'defaultList',
  );

  if (!defaultList) {
    throw new Error('Default Microsoft To Do task list not found');
  }

  return defaultList.id;
}

export async function listMicrosoftTodoTasks(input: {
  accessToken: string;
  listId: string;
}): Promise<MicrosoftTodoTask[]> {
  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/todo/lists/${encodeURIComponent(input.listId)}/tasks`,
    {
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `List Microsoft To Do tasks failed: ${response.status} ${text}`,
    );
  }

  const data =
    (await response.json()) as MicrosoftCollectionResponse<MicrosoftTodoTask>;
  return data.value;
}

export async function createMicrosoftTodoTask(input: {
  accessToken: string;
  listId: string;
  title: string;
  body?: string;
  dueDateTime?: string;
  startDateTime?: string;
  reminderDateTime?: string;
  timezone?: string;
  importance?: MicrosoftTodoTaskImportance;
}): Promise<MicrosoftTodoTask> {
  const timezone = input.timezone ?? 'Asia/Kolkata';
  const payload: Record<string, unknown> = {
    title: input.title,
  };

  if (input.body) {
    payload.body = {
      content: input.body,
      contentType: 'text',
    };
  }

  if (input.dueDateTime) {
    payload.dueDateTime = {
      dateTime: input.dueDateTime,
      timeZone: timezone,
    };
  }

  if (input.startDateTime) {
    payload.startDateTime = {
      dateTime: input.startDateTime,
      timeZone: timezone,
    };
  }

  if (input.reminderDateTime) {
    payload.reminderDateTime = {
      dateTime: input.reminderDateTime,
      timeZone: timezone,
    };
    payload.isReminderOn = true;
  }

  if (input.importance) {
    payload.importance = input.importance;
  }

  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/todo/lists/${encodeURIComponent(input.listId)}/tasks`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Create Microsoft To Do task failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftTodoTask>;
}

export async function updateMicrosoftTodoTask(input: {
  accessToken: string;
  listId: string;
  taskId: string;
  title?: string;
  body?: string;
  status?: MicrosoftTodoTaskStatus;
  dueDateTime?: string | null;
  startDateTime?: string | null;
  reminderDateTime?: string | null;
  timezone?: string;
  importance?: MicrosoftTodoTaskImportance;
}): Promise<MicrosoftTodoTask> {
  const timezone = input.timezone ?? 'Asia/Kolkata';
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) {
    payload.title = input.title;
  }

  if (input.body !== undefined) {
    payload.body = {
      content: input.body,
      contentType: 'text',
    };
  }

  if (input.status !== undefined) {
    payload.status = input.status;
  }

  if (input.importance !== undefined) {
    payload.importance = input.importance;
  }

  if (input.dueDateTime !== undefined) {
    payload.dueDateTime = input.dueDateTime
      ? { dateTime: input.dueDateTime, timeZone: timezone }
      : null;
  }

  if (input.startDateTime !== undefined) {
    payload.startDateTime = input.startDateTime
      ? { dateTime: input.startDateTime, timeZone: timezone }
      : null;
  }

  if (input.reminderDateTime !== undefined) {
    payload.reminderDateTime = input.reminderDateTime
      ? { dateTime: input.reminderDateTime, timeZone: timezone }
      : null;
    payload.isReminderOn = Boolean(input.reminderDateTime);
  }

  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/todo/lists/${encodeURIComponent(input.listId)}/tasks/${encodeURIComponent(input.taskId)}`,
    {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Update Microsoft To Do task failed: ${response.status} ${text}`,
    );
  }

  return response.json() as Promise<MicrosoftTodoTask>;
}

export async function deleteMicrosoftTodoTask(input: {
  accessToken: string;
  listId: string;
  taskId: string;
}): Promise<void> {
  const response = await graphFetch(
    `https://graph.microsoft.com/v1.0/me/todo/lists/${encodeURIComponent(input.listId)}/tasks/${encodeURIComponent(input.taskId)}`,
    {
      method: 'DELETE',
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
    },
  );

  if (response.status === 204 || response.status === 404) {
    return;
  }

  const text = await response.text();
  throw new Error(
    `Delete Microsoft To Do task failed: ${response.status} ${text}`,
  );
}
