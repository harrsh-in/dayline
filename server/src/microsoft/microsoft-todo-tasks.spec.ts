import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  createMicrosoftTodoTask,
  deleteMicrosoftTodoTask,
  getDefaultMicrosoftTodoListId,
  listMicrosoftTodoTaskLists,
  listMicrosoftTodoTasks,
  updateMicrosoftTodoTask,
} from './microsoft-todo-tasks';

describe('microsoft to do task helpers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('lists task lists and finds the default list', async () => {
    const listResponse = {
      value: [
        { id: 'custom-list', displayName: 'Tasks' },
        {
          id: 'default-list',
          displayName: 'Tasks',
          wellknownListName: 'defaultList',
        },
      ],
    };
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(listResponse))
      .mockResolvedValueOnce(Response.json(listResponse));
    global.fetch = fetchMock;

    await expect(
      listMicrosoftTodoTaskLists({ accessToken: 'token' }),
    ).resolves.toHaveLength(2);
    await expect(
      getDefaultMicrosoftTodoListId({ accessToken: 'token' }),
    ).resolves.toBe('default-list');
  });

  it('lists tasks from a selected list', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValueOnce(
      Response.json({
        value: [{ id: 'task-1', title: 'Submit invoice' }],
      }),
    );
    global.fetch = fetchMock;

    const tasks = await listMicrosoftTodoTasks({
      accessToken: 'token',
      listId: 'default/list',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(
      'https://graph.microsoft.com/v1.0/me/todo/lists/default%2Flist/tasks',
    );
    expect(init.headers).toMatchObject({
      authorization: 'Bearer token',
    });
    expect(tasks).toEqual([{ id: 'task-1', title: 'Submit invoice' }]);
  });

  it('creates tasks with date fields and reminders', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ id: 'task-1', title: 'Invoice' }));
    global.fetch = fetchMock;

    await createMicrosoftTodoTask({
      accessToken: 'token',
      listId: 'default-list',
      title: 'Invoice',
      body: 'Send PDF',
      dueDateTime: '2026-05-02T15:00:00',
      reminderDateTime: '2026-05-02T14:30:00',
      timezone: 'Asia/Kolkata',
      importance: 'high',
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(init.body as string) as Record<string, unknown>;

    expect(init.method).toBe('POST');
    expect(payload).toMatchObject({
      title: 'Invoice',
      body: {
        content: 'Send PDF',
        contentType: 'text',
      },
      dueDateTime: {
        dateTime: '2026-05-02T15:00:00',
        timeZone: 'Asia/Kolkata',
      },
      reminderDateTime: {
        dateTime: '2026-05-02T14:30:00',
        timeZone: 'Asia/Kolkata',
      },
      isReminderOn: true,
      importance: 'high',
    });
  });

  it('updates task completion and clears nullable date fields', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValueOnce(
      Response.json({
        id: 'task-1',
        title: 'Invoice',
        status: 'completed',
      }),
    );
    global.fetch = fetchMock;

    await updateMicrosoftTodoTask({
      accessToken: 'token',
      listId: 'default-list',
      taskId: 'task/1',
      status: 'completed',
      dueDateTime: null,
      reminderDateTime: null,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(init.body as string) as Record<string, unknown>;

    expect(url).toBe(
      'https://graph.microsoft.com/v1.0/me/todo/lists/default-list/tasks/task%2F1',
    );
    expect(init.method).toBe('PATCH');
    expect(payload).toMatchObject({
      status: 'completed',
      dueDateTime: null,
      reminderDateTime: null,
      isReminderOn: false,
    });
  });

  it('treats deleted or missing To Do tasks as deleted', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    global.fetch = fetchMock;

    await expect(
      deleteMicrosoftTodoTask({
        accessToken: 'token',
        listId: 'default-list',
        taskId: 'task-1',
      }),
    ).resolves.toBeUndefined();
  });
});
