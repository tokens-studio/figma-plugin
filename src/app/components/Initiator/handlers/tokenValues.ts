import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import type { TokenValuesFromPluginMessage } from '@/types/messages';

export function tokenValues(dispatch: Dispatch, message: TokenValuesFromPluginMessage) {
  const { values } = message;
  if (values) {
    dispatch.tokenState.setTokenData(values);
    const existTokens = Object.values(values?.values ?? {}).some((value) => value.length > 0);
    if (existTokens) dispatch.uiState.setActiveTab(Tabs.TOKENS);
    else dispatch.uiState.setActiveTab(Tabs.START);
  }
}
