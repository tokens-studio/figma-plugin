import { useEffect, useState } from 'react';

import { SyncProvider, SyncState } from '@/providers/provider';

// [WIP] - Unused for now

export function useSyncProvider(syncProvider: SyncProvider) {
  const [syncState, setSyncState] = useState(syncProvider.getState());
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const handleStateChange = (state: SyncState) => {
      setSyncState(state);
    };

    const handleError = (err: any) => {
      setError(err);
    };

    const handlePullSuccess = (pulledData: any) => {
      setData(pulledData);
    };

    syncProvider.on('stateChange', handleStateChange);
    syncProvider.on('error', handleError);
    syncProvider.on('pullSuccess', handlePullSuccess);

    return () => {
      syncProvider.on('stateChange', () => {});
      syncProvider.on('error', () => {});
      syncProvider.on('pullSuccess', () => {});
    };
  }, [syncProvider]);

  return { syncState, data, error };
}
