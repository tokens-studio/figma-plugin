import fetchFeatureFlags from './fetchFeatureFlags';

const mockWaitUntilReady = jest.fn();
const mockAllFlags = jest.fn();

jest.mock('launchdarkly-js-client-sdk', () => ({
  initialize: jest.fn().mockImplementation(() => ({
    waitUntilReady: mockWaitUntilReady,
    allFlags: mockAllFlags,
  })),
}));

describe('fetchFeatureFlags', (() => {
  let envFlags: string | undefined = '';

  beforeAll(() => {
    envFlags = process.env.LAUNCHDARKLY_FLAGS;
    process.env.LAUNCHDARKLY_FLAGS = '';
  });

  afterAll(() => {
    process.env.LAUNCHDARKLY_FLAGS = envFlags;
  });

  it('return flags when a user has a licenseKey', (async () => {
    const userData = {
      userId: 'six7',
      licenseKey: 'licenseKey',
    };
    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          email: 'six7@brandcode.dev',
          entitlements: ['pro'],
          plan: 'Tokens pro',
        }),
      }) as Promise<Response>
    ));
    mockWaitUntilReady.mockImplementationOnce(() => ({}));
    mockAllFlags.mockImplementationOnce(() => (
      {
        'git-branch-selector': true,
        'multi-file-sync': true,
        'token-themes': true,
        'token-flow-button': true,
      }
    ));
    const flags = await fetchFeatureFlags(userData);
    expect(flags).toEqual(
      {
        gitBranchSelector: true,
        multiFileSync: true,
        tokenThemes: true,
        tokenFlowButton: true,
      },
    );
  }));

  it('should return null when a user has no licenseKey or userId', (async () => {
    const userData = {
      userId: 'six7',
    };
    const flags = await fetchFeatureFlags(userData);
    expect(flags).toEqual(null);
  }));

  it('should return mock flags when provided', async () => {
    process.env.LAUNCHDARKLY_FLAGS = 'multiFileSync';
    const flags = await fetchFeatureFlags({});
    expect(flags).toEqual({
      multiFileSync: true,
    });
  });
}));
