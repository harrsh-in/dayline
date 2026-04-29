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
  displayName: string | undefined;
  mail: string | undefined;
  userPrincipalName: string | undefined;
};

export type MicrosoftCalendarEvent = {
  id: string;
  subject: string | undefined;
  bodyPreview: string | undefined;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  isAllDay: boolean | undefined;
  showAs: string | undefined;
  webLink: string | undefined;
  createdDateTime: string | undefined;
  lastModifiedDateTime: string | undefined;
};

export type MicrosoftCalendarViewResponse = {
  value: MicrosoftCalendarEvent[];
  '@odata.nextLink': string | undefined;
};

export type NormalizedMicrosoftCalendarEvent = {
  id: string;
  title: string;
  bodyPreview: string | undefined;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isAllDay: boolean;
  showAs: string | undefined;
  webLink: string | undefined;
  source: 'microsoft_calendar';
};

export type MicrosoftTodoTaskList = {
  id: string;
  displayName: string;
  isOwner: boolean | undefined;
  isShared: boolean | undefined;
  wellknownListName:
    | 'none'
    | 'defaultList'
    | 'flaggedEmails'
    | 'unknownFutureValue'
    | undefined;
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
  status: MicrosoftTodoTaskStatus | undefined;
  importance: MicrosoftTodoTaskImportance | undefined;
  body:
    | {
        content: string | undefined;
        contentType: 'text' | 'html' | undefined;
      }
    | undefined;
  dueDateTime: MicrosoftTodoDateTime | undefined;
  startDateTime: MicrosoftTodoDateTime | undefined;
  reminderDateTime: MicrosoftTodoDateTime | undefined;
  isReminderOn: boolean | undefined;
  createdDateTime: string | undefined;
  lastModifiedDateTime: string | undefined;
};

export type MicrosoftCollectionResponse<T> = {
  value: T[];
  '@odata.nextLink': string | undefined;
};
