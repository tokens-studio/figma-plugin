import type { ThemeObjectsList } from './ThemeObjectsList';
import type { RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import type { AnyTokenList } from './tokens';

type RemoteResponseSuccess<Metadata = unknown> = {
  status: 'success',
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  metadata?: RemoteTokenStorageMetadata & Metadata | null
  commitSha?: string
  commitDate?: Date
};

type RemoteResponseFailure = {
  status: 'failure',
  errorMessage: string;
};

export type RemoteResponseData<Metadata = unknown> = RemoteResponseSuccess<Metadata> | RemoteResponseFailure;
