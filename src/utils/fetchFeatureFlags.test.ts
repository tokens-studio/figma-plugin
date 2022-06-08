import fetchFeatureFlags from './fetchFeatureFlags';

const mockInitialize = jest.fn();
const mockWaitUntilReady = jest.fn();
const mockAllFlags = jest.fn();

jest.mock('launchdarkly-js-client-sdk', (() => {
  jest.fn().mockImplementation(() => {
    return {
      initialize: mockInitialize,
      LDclient: {
        waitUntilReady: mockWaitUntilReady,
        allFlags: mockAllFlags
      }
    }  
  })
}))
describe('fetchFeatureFlags', (() => {
  it('return flags', (() => {
    const userData = {
      userId: 'six7',
      licensekey: ''
    }

    global.fetch = jest.fn(() => (
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          email: "six7@brandcode.dev",
          entitlements: ['pro'],
          plan: "Tokens pro",
        }),
      }) as Promise<Response>
    ));

    mockInitialize.mockImplementationOnce(() => (
      Promise.resolve({
        waitUntilReady: jest.fn(),
        allFlags: jest.fn()
      })
    ));


    // mockWaitUntilReady.mockImplementationOnce(() => { });
    // const cc = mockAllFlags.mockImplementationOnce(() => (
    //   Promise.resolve({
    //     'git-branch-selector': true,
    //     'multi-file-sync': true,
    //     'token-themes': true,
    //   })
    // ))
    // console.log("cc", cc)
    const flags = fetchFeatureFlags(userData);
    expect(flags).toEqual(
      [
        {'git-branch-selector': true},
        {'multi-file-sync': true},
        {'token-themes': true},
      ]
    )
  }));
}));
