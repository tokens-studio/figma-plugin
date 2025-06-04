import { useMemo } from 'react';
import { useChangedState } from './useChangedState';
import { SystemFilenames } from '@/constants/SystemFilenames';

export type ChangedFiles = {
  tokenSets: string[]; // Array of token set names that have changed
  themes: boolean; // Whether themes file has changed
  metadata: boolean; // Whether metadata file has changed
};

export function useChangedFiles(): ChangedFiles {
  const { changedPushState } = useChangedState();

  return useMemo(() => {
    const tokenSets = Object.keys(changedPushState.tokens);
    const themes = changedPushState.themes.length > 0;
    const metadata = changedPushState.metadata !== null;

    return {
      tokenSets,
      themes,
      metadata,
    };
  }, [changedPushState]);
}