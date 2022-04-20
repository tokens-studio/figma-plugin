import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { SelectionValue } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import { settingsStateSelector } from '@/selectors';
import { RootState } from '@/app/store';

export function useSetNodeData() {
  const store = useStore<RootState>();

  const setNodeData = useCallback((data: SelectionValue, resolvedTokens: AnyTokenList) => {
    const settings = settingsStateSelector(store.getState());
    postToFigma({
      type: MessageToPluginTypes.SET_NODE_DATA,
      values: data,
      tokens: resolvedTokens,
      settings,
    });
  }, [store]);

  return setNodeData;
}
