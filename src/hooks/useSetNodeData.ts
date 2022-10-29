import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { SelectionValue } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { settingsStateSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';

export default function useSetNodeData() {
  const store = useStore<RootState>();

  const setNodeData = useCallback(async (data: SelectionValue, resolvedTokens: AnyTokenList) => {
    const settings = settingsStateSelector(store.getState());
    await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: data,
      tokens: resolvedTokens,
      settings,
    });
  }, [store]);

  return setNodeData;
}
