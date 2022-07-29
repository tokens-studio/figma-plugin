export enum ErrorMessages {
  GENERAL_CONNECTION_ERROR = 'There was an error connecting. Check your credentials.',
  GITHUB_CREDNETIAL_ERROR = 'Error syncing with GitHub, check credentials',
  GITLAB_CREDNETIAL_ERROR = 'Error syncing with GitLab, check credentials',
  ADO_CREDNETIAL_ERROR = 'Error syncing with ADO, check credentials',
  URL_CREDNETIAL_ERROR = 'Error fetching from URL, check console (F12)',
  JSONBIN_CREDNETIAL_ERROR = 'Error fetching from JSONbin, check console (F12)',
  FILE_CREDNETIAL_ERROR = 'Error fetching from file, check console (F12)',
  EMPTY_BRNACH_ERROR = 'There is no branch',
  VALIDATION_ERROR = 'Contents don\'t pass schema validation',
  JSONBIN_ID_NON_EXIST_ERROR = 'ID or Secret should be exist',
  JSONBIN_CREATE_ERROR = 'Error creating JSONbin token storage',
}
