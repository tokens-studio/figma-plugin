import { useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { Dispatch } from '@/app/store';
import { useFlags } from '@/app/components/LaunchDarkly';
import { FileTokenStorage } from '@/storage/FileTokenStorage';

export default function useFile() {
  const dispatch = useDispatch<Dispatch>();
  const { multiFileSync } = useFlags();

  const storageClientFactory = useCallback((files: FileList) => {
    const storageClient = new FileTokenStorage(files);

    if (multiFileSync) storageClient.enableMultiFile();
    return storageClient;
  }, [multiFileSync]);

  const readTokensFromFileOrDirectory = useCallback(async (files: FileList) => {
    const storage = storageClientFactory(files);

    try {
      const content = await storage.retrieve();
      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }, [
    dispatch,
    storageClientFactory,
  ]);

  return useMemo(() => ({
    readTokensFromFileOrDirectory,
  }), [
    readTokensFromFileOrDirectory,
  ]);
}
