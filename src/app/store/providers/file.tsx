import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { notifyToUI } from '../../../plugin/notifiers';
import { useFlags } from '@/app/components/LaunchDarkly';
import { activeThemeSelector, usedTokenSetSelector } from '@/selectors';
import { FileTokenStorage } from '@/storage/FileTokenStorage';

export default function useFile() {
  const dispatch = useDispatch<Dispatch>();
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSets = useSelector(usedTokenSetSelector);
  const { multiFileSync } = useFlags();

  const storageClientFactory = useCallback((files: FileList, path: string) => {
    const storageClient = new FileTokenStorage(files, path);

    if (multiFileSync) storageClient.enableMultiFile();
    return storageClient;
  }, [multiFileSync]);

  // Read tokens from URL
  const readTokensFromFile = useCallback(async (files: FileList, path: string) => {
    const storage = storageClientFactory(files, path);

    try {
      const content = await storage.retrieve();
      console.log('content', content);
      if (content) {
        if (Object.keys(content.tokens).length) {
          dispatch.tokenState.setTokenData({
            values: content.tokens,
            themes: content.themes,
            usedTokenSet: usedTokenSets,
            activeTheme,
          });
          return content;
        }
        notifyToUI('No tokens stored on file', { error: true });
      }
    } catch (err) {
      notifyToUI('Error fetching from File, check console (F12)', { error: true });
      console.log('Error:', err);
    }

    return null;
  }, [
    dispatch,
    storageClientFactory,
    usedTokenSets,
    activeTheme,
  ]);

  return useMemo(() => ({
    readTokensFromFile,
  }), [
    readTokensFromFile,
  ]);
}
