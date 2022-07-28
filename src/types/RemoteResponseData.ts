import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';

export type RemoteResponseData<Metadata = unknown> = Partial<RemoteTokenStorageData<Metadata> & { errorMessage: string }>;
