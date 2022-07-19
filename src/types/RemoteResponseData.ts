import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';

export type RemoteResponseData = Partial<RemoteTokenStorageData<unknown> & { errorMessage: string }>;
