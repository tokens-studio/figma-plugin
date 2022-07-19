import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';

export type RemoteResponseData = {
  hasError: boolean,
  data: Partial<RemoteTokenStorageData<GitStorageMetadata> & { errorMessage: string }>
};
