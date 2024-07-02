import type { LDClient } from 'launchdarkly-js-client-sdk';
import { createMockStore } from '../../../../../../tests/config/setupTest';
import type { StartupMessage } from '@/types/AsyncMessages';
import { getLdFlagsFactory } from '../getLdFlagsFactory';
import * as analytics from '@/utils/analytics';

describe('getLdFlagsFactory', () => {
  const setUserDataSpy = jest.spyOn(analytics, 'setUserData');

  it('should work', async () => {
    const mockStore = createMockStore({
      userState: {
        licenseKey: 'FIGMA-TOKENS',
        licenseDetails: {
          plan: 'Pro Plan',
          clientEmail: 'example@domain.com',
          entitlements: ['pro'],
        },
      },
    });
    const mockParams = {
      user: {
        userId: 'uid:1234',
      },
    } as unknown as StartupMessage;
    const mockLdClient = {
      identify: jest.fn(),
    } as unknown as LDClient;

    const fn = getLdFlagsFactory(mockStore, Promise.resolve(mockLdClient), mockParams);
    await fn();

    expect(setUserDataSpy).toBeCalledTimes(1);
    expect(setUserDataSpy).toBeCalledWith({
      plan: 'pro',
    });
    expect(mockLdClient.identify).toBeCalledTimes(1);
    expect(mockLdClient.identify).toBeCalledWith({
      key: 'uid:1234',
      custom: {
        plan: 'Pro Plan',
        pro: true,
      },
      email: 'example@domain.com',
    });
  });

  it('should set a free plan if there is no plan', async () => {
    const mockStore = createMockStore({
      userState: {
        licenseKey: 'FIGMA-TOKENS',
      },
    });
    const mockParams = {
      user: {
        userId: 'uid:1234',
      },
    } as unknown as StartupMessage;
    const mockLdClient = {
      identify: jest.fn(),
    } as unknown as LDClient;

    const fn = getLdFlagsFactory(mockStore, Promise.resolve(mockLdClient), mockParams);
    await fn();

    expect(setUserDataSpy).toBeCalledTimes(1);
    expect(setUserDataSpy).toBeCalledWith({
      plan: 'free',
    });
    expect(mockLdClient.identify).toBeCalledTimes(1);
  });

  it('should set a free plan', async () => {
    const mockStore = createMockStore({});
    const mockParams = {
      user: {
        userId: 'uid:1234',
      },
    } as unknown as StartupMessage;
    const mockLdClient = {
      identify: jest.fn(),
    } as unknown as LDClient;

    const fn = getLdFlagsFactory(mockStore, Promise.resolve(mockLdClient), mockParams);
    await fn();

    expect(setUserDataSpy).toBeCalledTimes(1);
    expect(setUserDataSpy).toBeCalledWith({
      plan: 'free',
    });
    expect(mockLdClient.identify).toBeCalledTimes(0);
  });

  it('track an error and set free plan', async () => {
    const mockStore = createMockStore({
      userState: {
        licenseKey: 'FIGMA-TOKENS',
        licenseDetails: {
          plan: 'Pro Plan',
          clientEmail: 'example@domain.com',
          entitlements: ['pro'],
        },
      },
    });
    const mockParams = {
      user: {
        userId: 'uid:1234',
      },
    } as unknown as StartupMessage;
    const mockIdentify = jest.fn();
    const mockLdClient = {
      identify: mockIdentify,
    } as unknown as LDClient;

    mockIdentify.mockRejectedValueOnce(new Error('error'));
    const fn = getLdFlagsFactory(mockStore, Promise.resolve(mockLdClient), mockParams);
    await fn();

    expect(setUserDataSpy).toBeCalledTimes(2);
    expect(setUserDataSpy).toBeCalledWith({
      plan: 'free',
    });
    expect(mockIdentify).toBeCalledTimes(1);
  });
});
