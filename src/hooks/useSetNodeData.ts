import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { SelectionValue } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { settingsStateSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

export function useSetNodeData() {
  const store = useStore<RootState>();

  const setNodeData = useCallback((data: SelectionValue, resolvedTokens: AnyTokenList) => {
    const settings = settingsStateSelector(store.getState());
    AsyncMessageChannel.message({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: data,
      tokens: resolvedTokens,
      settings,
    });
  }, [store]);

  return setNodeData;
}
