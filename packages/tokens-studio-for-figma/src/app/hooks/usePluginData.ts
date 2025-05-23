import { useCallback } from 'react';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { SharedPluginDataNamespaces } from '@/constants/SharedPluginDataNamespaces';

export function usePluginData() {
  const getSharedPluginData = useCallback((key: string): string | null => {
    try {
      const data = window.__SHARED_PLUGIN_DATA__?.[SharedPluginDataNamespaces.TOKENS]?.[key];
      return data || null;
    } catch (e) {
      console.error('Error reading shared plugin data', e);
      return null;
    }
  }, []);

  const saveSharedPluginData = useCallback((key: string, value: string) => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.WRITE_SHARED_PLUGIN_DATA,
      namespace: SharedPluginDataNamespaces.TOKENS,
      key,
      value,
    });
  }, []);

  return {
    getSharedPluginData,
    saveSharedPluginData,
  };
}