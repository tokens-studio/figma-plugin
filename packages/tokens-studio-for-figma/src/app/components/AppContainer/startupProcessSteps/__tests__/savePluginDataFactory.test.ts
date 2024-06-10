import { createMockStore } from '../../../../../../tests/config/setupTest';
import { savePluginDataFactory } from '../savePluginDataFactory';
import type { StartupMessage } from '@/types/AsyncMessages';
import * as analytics from '@/utils/analytics';

describe('savePluginDataFactory', () => {
  it('should work', async () => {
    const identifySpy = jest.spyOn(analytics, 'identify');
    identifySpy.mockReturnValueOnce();

    const mockStore = createMockStore({});

    const mockParams = {
      user: {
        userId: 'figma:1234',
        figmaId: 'figma:1234',
        name: 'Jan Six',
      },
      lastOpened: Date.now(),
      onboardingExplainer: {
        sets: true,
        inspect: true,
        syncProviders: true,
      },
      settings: {
        width: 500,
        height: 500,
      },
    } as unknown as StartupMessage;

    const fn = savePluginDataFactory(
      mockStore.dispatch,
      mockParams,
    );
    await fn();

    const state = mockStore.getState();
    expect(state.userState.userId).toEqual(mockParams.user?.figmaId);
    expect(state.userState.userName).toEqual(mockParams.user?.name);
    expect(state.uiState.lastOpened).toEqual(mockParams.lastOpened);
    expect(identifySpy).toBeCalledWith(mockParams.user);
  });

  it('should error if the user is not found', async () => {
    // this should realistically never happen
    const mockStore = createMockStore({});

    const fn = savePluginDataFactory(
      mockStore.dispatch,
      {} as unknown as StartupMessage,
    );

    expect(fn()).rejects.toEqual(new Error('User not found'));
  });
});
