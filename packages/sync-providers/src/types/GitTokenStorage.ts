import type { AnyTokenSet, SingleToken } from './tokens';
import type { ThemeObjectsList } from './ThemeObjectsList';
import type { RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import type { DeepTokensMap } from './DeepTokensMap';

export type GitMultiFileObject = AnyTokenSet<false> | ThemeObjectsList | RemoteTokenStorageMetadata;

export type GitSingleFileObject = Record<string, (
  Record<string, SingleToken<false> | DeepTokensMap<false>>
)> & {
  $themes?: ThemeObjectsList
  $metadata?: RemoteTokenStorageMetadata
};
