import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import type { TokenValuesFromPluginMessage } from '@/types/messages';

export function tokenValues(dispatch: Dispatch, message: TokenValuesFromPluginMessage) {
  const { values } = message;
  if (values) {
    dispatch.tokenState.setTokenData(values);
    dispatch.uiState.setActiveTab(Tabs.TOKENS);
  }
}
