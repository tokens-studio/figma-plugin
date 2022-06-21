import { StorageProviderType } from '@/constants/StorageProviderType';
import { OptionalPartial } from './OptionalPartial';

/**
 * StorageTypes are meant to define the parameters of a storage provider
 * but this does not include their credentials
 */

export type GenericStorageType<T extends StorageProviderType = StorageProviderType, P = unknown> = P & {
  provider: T;
} & (T extends StorageProviderType.LOCAL
  ? {}
  : {
    internalId: string;
  });

export type StorageTypeCredential<T extends GenericStorageType, Required extends boolean = true> = T &
(Required extends true ? { secret: string } : { secret?: string });

export type LocalStorageType = GenericStorageType<StorageProviderType.LOCAL>;

export type URLStorageType = GenericStorageType<
StorageProviderType.URL,
{
  name: string; // this is only for refrence
  id: string; // this would be the URL
}
>;

export type JSONBinStorageType = GenericStorageType<
StorageProviderType.JSONBIN,
{
  name: string; // this is only for refrence
  id: string; // this is the ID of the JSONBIN
}
>;

export type GitStorageType = GenericStorageType<
StorageProviderType.GITHUB | StorageProviderType.GITLAB,
{
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is the base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUrl?: string; // this is the base API url. This is important for self hosted environments
}
>;

export type BitbucketStorageType = GenericStorageType<
StorageProviderType.BITBUCKET,
{
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is the base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUrl?: string; // this is the base API url. This is important for self hosted environments
}
>;

export type ADOStorageType = GenericStorageType<
StorageProviderType.ADO,
{
  name?: string; // this is only for refrence
  baseUrl: string; // this is the Azure base URL (eg: https://dev.azure.com/yourOrgName). This is required for Azure
  id: string; // this is the repository identifier; eg {username}/{repo}
  branch: string; // this is the base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
}
>;

export type StorageType =
  | LocalStorageType
  | URLStorageType
  | JSONBinStorageType
  | GitStorageType
  | ADOStorageType
  | BitbucketStorageType;

export type StorageTypeCredentials =
  | StorageTypeCredential<URLStorageType>
  | StorageTypeCredential<JSONBinStorageType>
  | StorageTypeCredential<GitStorageType>
  | StorageTypeCredential<BitbucketStorageType>
  | StorageTypeCredential<ADOStorageType>;

export type StorageTypeFormValues<Incomplete extends boolean = false> =
  | ({ new?: boolean; provider: StorageProviderType.URL } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<URLStorageType>, 'provider'>
  >)
  | ({ new?: boolean; id?: string; provider: StorageProviderType.JSONBIN } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<JSONBinStorageType>, 'provider' | 'id'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<GitStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.BITBUCKET } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<BitbucketStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.ADO } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<ADOStorageType>, 'provider'>
  >)
  | { new?: boolean; provider: StorageProviderType.LOCAL };
