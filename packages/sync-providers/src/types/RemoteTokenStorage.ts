import type { SingleToken } from './tokens';
import type { DeepTokensMap } from './DeepTokensMap';
import type { ThemeObjectsList } from './ThemeObjectsList';

export interface RemoteTokenstorageErrorMessage {
  errorMessage: string
}

export interface RemoteTokenStorageSingleTokenSetFile {
  type: 'tokenSet'
  path: string
  name: string
  data: Record<string, SingleToken<false> | DeepTokensMap<false>>; // @README we save tokens without their name, but rather key them by their name
}

export interface RemoteTokenStorageThemesFile {
  type: 'themes'
  path: string
  data: ThemeObjectsList
}

export type RemoteTokenStorageMetadata = {
  tokenSetOrder?: string[];
  tokenSetsData?: Record<string, { id: string, isDynamic?: boolean }>;
};

export interface RemoteTokenStorageMetadataFile<Metadata = unknown> {
  type: 'metadata'
  path: string
  data: RemoteTokenStorageMetadata & Metadata
}

export type RemoteTokenStorageFile<Metadata = unknown> =
  RemoteTokenStorageSingleTokenSetFile
  | RemoteTokenStorageThemesFile
  | RemoteTokenStorageMetadataFile<Metadata>;
