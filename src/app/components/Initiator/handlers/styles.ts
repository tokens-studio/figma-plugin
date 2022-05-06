import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import type { StylesFromPluginMessage } from '@/types/messages';
import { track } from '@/utils/analytics';

export function styles(dispatch: Dispatch, message: StylesFromPluginMessage) {
  const { values } = message;
  if (values) {
    track('Import styles');
    dispatch.tokenState.setTokensFromStyles(values);
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
  }
}
