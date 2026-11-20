import { createMockStore } from '../../../../../../tests/config/setupTest';
import { savePluginDataFactory } from '../savePluginDataFactory';
import type { StartupMessage } from '@/types/AsyncMessages';
import * as analytics from '@/utils/analytics';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('savePluginDataFactory', () => {
  it('should work', async () => {
    const identifySpy = jest.spyOn(analytics, 'identify');
    identifySpy.mockReturnValueOnce();

    const mockStore = createMockStore({});

    const mockParams = {
      user: {
        userId: 'figma:1234',
        figmaId: 'figma:1234',
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

  describe('active Tokens Studio organization', () => {
    const baseParams = {
      user: { userId: 'figma:1234', figmaId: 'figma:1234' },
      lastOpened: Date.now(),
      onboardingExplainer: { sets: true, inspect: true, syncProviders: true },
      settings: { width: 500, height: 500 },
      oauthTokens: {
        accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
      },
      activeOrganizationId: 'saved-org',
    };
    const mockFetchUserData = jest.fn();

    beforeEach(() => {
      jest.spyOn(analytics, 'identify').mockReturnValue();
      mockFetchUserData.mockReset();
      useAuthStore.setState({
        activeOrganizationId: null,
        fetchUserData: mockFetchUserData,
        setOAuthTokens: jest.fn(async (oauthTokens) => useAuthStore.setState({ oauthTokens })),
      });
    });

    it('refreshes an expired sign-in before handing the new tokens to fetchUserData', async () => {
      const refreshed = {
        accessToken: 'new-token', refreshToken: 'new-refresh', tokenType: 'Bearer', expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      const refreshTokens = jest.fn(async () => useAuthStore.setState({ oauthTokens: refreshed }));
      useAuthStore.setState({ refreshTokens });
      const params = {
        ...baseParams,
        oauthTokens: { ...baseParams.oauthTokens, expiresAt: Date.now() - 1000 },
      } as unknown as StartupMessage;

      await savePluginDataFactory(createMockStore({}).dispatch, params)();

      expect(refreshTokens).toHaveBeenCalledTimes(1);
      expect(mockFetchUserData).toHaveBeenCalledWith(refreshed, undefined, undefined);
    });

    it('skips fetchUserData when the startup refresh was refused and signed the user out', async () => {
      const refreshTokens = jest.fn(async () => {
        useAuthStore.setState({ oauthTokens: null });
        throw new Error('invalid_grant');
      });
      useAuthStore.setState({ refreshTokens });
      const params = {
        ...baseParams,
        oauthTokens: { ...baseParams.oauthTokens, expiresAt: Date.now() - 1000 },
      } as unknown as StartupMessage;

      await savePluginDataFactory(createMockStore({}).dispatch, params)();

      expect(mockFetchUserData).not.toHaveBeenCalled();
    });

    it('hands fetchUserData the org a Studio-synced file syncs with, keeping the saved org as the fallback', async () => {
      const params = {
        ...baseParams,
        storageType: {
          provider: StorageProviderType.TOKENS_STUDIO_OAUTH, internalId: 'tokens-studio-file-org', orgId: 'file-org', id: 'project-1', name: 'Org',
        },
      } as unknown as StartupMessage;

      await savePluginDataFactory(createMockStore({}).dispatch, params)();

      expect(useAuthStore.getState().activeOrganizationId).toBe('saved-org');
      expect(mockFetchUserData).toHaveBeenCalledWith(params.oauthTokens, 'project-1', 'file-org');
    });

    it('uses the saved org for a file that does not sync with Studio', async () => {
      const params = { ...baseParams, storageType: { provider: StorageProviderType.LOCAL } } as unknown as StartupMessage;

      await savePluginDataFactory(createMockStore({}).dispatch, params)();

      expect(useAuthStore.getState().activeOrganizationId).toBe('saved-org');
    });
  });
});
