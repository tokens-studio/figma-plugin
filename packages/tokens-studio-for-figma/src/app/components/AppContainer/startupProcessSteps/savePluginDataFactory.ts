import type { Dispatch } from '@/app/store';
import type { StartupMessage } from '@/types/AsyncMessages';
import { identify, track } from '@/utils/analytics';
import { useAuthStore } from '@/app/store/useAuthStore';
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
        useAuthStore.getState().setOAuthTokens(params.oauthTokens);
        const activeProjectId = params.storageType?.provider === 'tokensstudio-oauth' ? (params.storageType as any).id : undefined;
        useAuthStore.getState().fetchUserData(params.oauthTokens, activeProjectId);
      }
    } else {
      throw new Error('User not found');
    }
  };
}
