import {
  RestApiError, createThemeGroupRest, isNameConflictError, isPlanLimitError,
} from './restApi';

const errorResponse = (status: number, error: Record<string, unknown>) => ({
  ok: false,
  status,
  json: async () => ({ errors: [error] }),
});

describe('restApi errors', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const createThemeGroup = () => createThemeGroupRest('token', 'https://api.example.com', 'project-1', { name: 'Colors' });

  it('keeps the status, code and detail of a plan limit refusal', async () => {
    global.fetch = jest.fn().mockResolvedValue(errorResponse(422, {
      code: 'theme_group_limit_reached',
      detail: 'Your plan includes 1 theme group. Upgrade to add more.',
      meta: { limit: 1 },
    })) as any;

    const error = await createThemeGroup().catch((e) => e);

    expect(error).toBeInstanceOf(RestApiError);
    expect(error.status).toBe(422);
    expect(error.code).toBe('theme_group_limit_reached');
    expect(error.detail).toBe('Your plan includes 1 theme group. Upgrade to add more.');
    expect(error.message).toContain('Your plan includes 1 theme group');
    expect(isPlanLimitError(error)).toBe(true);
    expect(isNameConflictError(error)).toBe(false);
  });

  it('recognises a name clash, which carries no code', async () => {
    global.fetch = jest.fn().mockResolvedValue(errorResponse(422, {
      detail: "A theme group with the name 'Colors' already exists in this branch",
    })) as any;

    const error = await createThemeGroup().catch((e) => e);

    expect(isNameConflictError(error)).toBe(true);
    expect(isPlanLimitError(error)).toBe(false);
  });

  it('treats other failures as neither', async () => {
    global.fetch = jest.fn().mockResolvedValue(errorResponse(422, { detail: 'Theme group name is required' })) as any;

    const error = await createThemeGroup().catch((e) => e);

    expect(isNameConflictError(error)).toBe(false);
    expect(isPlanLimitError(error)).toBe(false);
  });

  it('survives an error body it cannot read', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    }) as any;

    const error = await createThemeGroup().catch((e) => e);

    expect(error).toBeInstanceOf(RestApiError);
    expect(error.status).toBe(500);
    expect(error.detail).toBeUndefined();
    expect(isNameConflictError(error)).toBe(false);
  });
});
