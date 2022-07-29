import { RemoteTokenStorageData } from '@/storage/RemoteTokenStorage';
import { ThemeObjectsList } from './ThemeObjectsList';
import { AnyTokenList } from './tokens';

type RemoteResponseSuccess<Metadata = unknown> = {
    status: 'success',
    tokens: Record<string, AnyTokenList>
    themes: ThemeObjectsList
    metadata?: Metadata | null
  };

type RemoteResponseFailure = {
    status: 'failure',
    errorMessage: string;
};

export type RemoteResponseData<Metadata = unknown> = RemoteResponseSuccess<Metadata> | RemoteResponseFailure;
