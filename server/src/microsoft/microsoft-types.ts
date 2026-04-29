export type MicrosoftTokenResponse = {
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
  refresh_token?: string;
  id_token?: string;
};

export type MicrosoftMeResponse = {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
};

export type MicrosoftCalendarEvent = {
  id: string;
  subject?: string;
  bodyPreview?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay?: boolean;
  showAs?: string;
  webLink?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
};

export type MicrosoftCalendarViewResponse = {
  value: MicrosoftCalendarEvent[];
  '@odata.nextLink'?: string;
};

export type NormalizedMicrosoftCalendarEvent = {
  id: string;
  title: string;
  bodyPreview?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isAllDay: boolean;
  showAs?: string;
  webLink?: string;
  source: 'microsoft_calendar';
};

export type MicrosoftTodoTaskList = {
  id: string;
  displayName: string;
  isOwner?: boolean;
  isShared?: boolean;
  wellknownListName?:
    | 'none'
    | 'defaultList'
    | 'flaggedEmails'
    | 'unknownFutureValue';
};

export type MicrosoftTodoTaskStatus =
  | 'notStarted'
  | 'inProgress'
  | 'completed'
  | 'waitingOnOthers'
  | 'deferred';

export type MicrosoftTodoTaskImportance = 'low' | 'normal' | 'high';

export type MicrosoftTodoDateTime = {
  dateTime: string;
  timeZone: string;
};

export type MicrosoftTodoTask = {
  id: string;
  title: string;
  status?: MicrosoftTodoTaskStatus;
  importance?: MicrosoftTodoTaskImportance;
  body?: {
    content?: string;
    contentType?: 'text' | 'html';
  };
  dueDateTime?: MicrosoftTodoDateTime;
  startDateTime?: MicrosoftTodoDateTime;
  reminderDateTime?: MicrosoftTodoDateTime;
  isReminderOn?: boolean;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
};

export type MicrosoftCollectionResponse<T> = {
  value: T[];
  '@odata.nextLink'?: string;
};
