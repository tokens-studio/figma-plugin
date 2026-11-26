import type { Dispatch } from '@/app/store';
import { isTokensStudioOAuthType } from '@/utils/is';
import type { StartupMessage } from '@/types/AsyncMessages';
import { identify, track } from '@/utils/analytics';
import { useAuthStore } from '@/app/store/useAuthStore';
import { OAuthService } from '@/app/services/OAuthService';
import pjs from '../../../../../package.json';

export function savePluginDataFactory(dispatch: Dispatch, params: StartupMessage) {
  return async () => {
    const { user, usedEmail } = params;
    if (user) {
      // initiate analytics
      if (user.userId) {
        identify({
          userId: user.userId,
          figmaId: user.userId,
        });
      }
      track('Launched', { version: pjs.version });
      const {
        width, height, showEmptyGroups, ...rest
      } = params.settings;
      const settings = {
        uiWindow: {
          width,
          height,
          isMinimized: false,
        },
        ...rest,
      };
      dispatch.userState.setUserId(user.figmaId);
      dispatch.userState.setUsedEmail(usedEmail ?? undefined);
      dispatch.uiState.setLastOpened(params.lastOpened);
      dispatch.uiState.setOnboardingExplainerSets(params.onboardingExplainer.sets);
      dispatch.uiState.setOnboardingExplainerExportSets(params.onboardingExplainer.exportSets);
      dispatch.uiState.setOnboardingExplainerSyncProviders(params.onboardingExplainer.syncProviders);
      dispatch.uiState.setOnboardingExplainerInspect(params.onboardingExplainer.inspect);
      dispatch.settings.setUISettings(settings);

      // Store the selected export themes in the UI state
      if (params.selectedExportThemes) {
        dispatch.uiState.setSelectedExportThemes(params.selectedExportThemes);
      }

      // Restore OAuth tokens
      if (params.oauthTokens) {
        if (params.activeOrganizationId) {
          useAuthStore.setState({ activeOrganizationId: params.activeOrganizationId });
        }
        await useAuthStore.getState().setOAuthTokens(params.oauthTokens);
        // Refresh before the pull step runs, so it does not start with an expired access token.
        if (OAuthService.needsRefresh(params.oauthTokens)) {
          try {
            await useAuthStore.getState().refreshTokens();
          } catch (error) {
            // A refused refresh has logged the user out; the pull step then asks them to sign in again.
            console.error('Failed to refresh Tokens Studio sign-in at startup', error);
          }
        }
        const { oauthTokens } = useAuthStore.getState();
        if (oauthTokens) {
          // A file synced with Studio uses the org it syncs with; fetchUserData falls back to the org picked in Settings.
          const fileSync = isTokensStudioOAuthType(params.storageType) ? params.storageType : undefined;
          useAuthStore.getState().fetchUserData(oauthTokens, fileSync?.id, fileSync?.orgId);
        }
      }
    } else {
      throw new Error('User not found');
    }
  };
}
