import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { GitStorageMetadata } from '@/storage/GitTokenStorage';
import { JsonBinMetadata } from '@/storage';

export type RemoteResponseData = Partial<RemoteTokenStorageData<unknown> & { errorMessage?: string, hasError: boolean}>;

export type RemoteResponseWithError = {
    hasError: boolean;
    errorMessage?: string;
  };
  
