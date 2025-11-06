import { useCallback, useMemo } from 'react';
import { FileTokenStorage } from '@/storage/FileTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { useIsProUser } from '@/app/hooks/useIsProUser';

export default function useFile() {
  const isProUser = useIsProUser();

  const storageClientFactory = useCallback((files: FileList) => {
    const storageClient = new FileTokenStorage(files);

    // Always check isProUser dynamically rather than capturing it in closure
    // This ensures multi-file is enabled even if the license was validated after this callback was created
    if (isProUser) storageClient.enableMultiFile();
    return storageClient;
  }, [isProUser]);

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
