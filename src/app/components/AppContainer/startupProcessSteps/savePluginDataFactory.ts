import type { Dispatch } from '@/app/store';
import type { StartupMessage } from '@/types/AsyncMessages';
import { identify, track } from '@/utils/analytics';
import * as pjs from '../../../../../package.json';

export function savePluginDataFactory(dispatch: Dispatch, params: StartupMessage) {
  return async () => {
    const { user } = params;
    if (user) {
      // initiate analytics
      if (user.userId) {
        identify({
          userId: user.userId,
          figmaId: user.userId,
          name: user.name,
        });
      }
      track('Launched', { version: pjs.plugin_version });
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
      dispatch.userState.setUserName(user.name);
      dispatch.uiState.setLastOpened(params.lastOpened);
      dispatch.uiState.setOnboardingExplainerSets(params.onboardingExplainer.sets);
      dispatch.uiState.setOnboardingExplainerSyncProviders(params.onboardingExplainer.syncProviders);
      dispatch.uiState.setOnboardingExplainerInspect(params.onboardingExplainer.inspect);
      dispatch.settings.setUISettings(settings);
    } else {
      throw new Error('User not found');
    }
  };
}
