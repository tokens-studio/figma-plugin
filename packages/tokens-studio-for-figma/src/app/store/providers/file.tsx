import { useCallback, useMemo } from 'react';
import { FileTokenStorage } from '@/storage/FileTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { RemoteResponseData } from '@/types/RemoteResponseData';

export default function useFile() {
  const storageClientFactory = useCallback((files: FileList) => {
    const storageClient = new FileTokenStorage(files);

    // Enable multi-file support by default (previously gated by feature flag)
    storageClient.enableMultiFile();
    return storageClient;
  }, []);

  const readTokensFromFileOrDirectory = useCallback(async (files: FileList): Promise<RemoteResponseData | null> => {
    const storage = storageClientFactory(files);
    try {
      const content = await storage.retrieve();
      if (content) {
        return content;
      }
    } catch (e) {
      console.log('Error', e);
      return {
        status: 'failure',
        errorMessage: ErrorMessages.FILE_CREDENTIAL_ERROR,
      };
    }
    return null;
  }, [
    storageClientFactory,
  ]);

  return useMemo(() => ({
    readTokensFromFileOrDirectory,
  }), [
    readTokensFromFileOrDirectory,
  ]);
}
