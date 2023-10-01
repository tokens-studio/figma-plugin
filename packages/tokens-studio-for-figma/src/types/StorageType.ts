import { StorageProviderType } from '@/constants/StorageProviderType';
import { OptionalPartial } from './OptionalPartial';
import { GenericVersionedAdditionalHeaders } from '../storage/GenericVersionedStorage';

/**
 * StorageTypes are meant to define the parameters of a storage provider
 * but this does not include their credentials
 */

export type GenericStorageType<T extends StorageProviderType = StorageProviderType, P = unknown> = P & {
  provider: T;
} & (T extends StorageProviderType.LOCAL
  ? unknown
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

export type GitHubStorageType = GenericStorageType<
StorageProviderType.GITHUB,
{
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is the base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUrl?: string; // this is the base API url. This is important for self hosted environments
  commitSha?: string; // this is the commit sha of the current file or folder
}
>;

export type GitLabStorageType = GenericStorageType<
StorageProviderType.GITLAB,
{
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is the base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUrl?: string; // this is the base API url. This is important for self hosted environments
  commitDate?: Date; // this is the commit sha of the current file or folder
}
>;

export type BitbucketStorageType = GenericStorageType<
StorageProviderType.BITBUCKET,
{
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {workspace}/{repo_slug}
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

export type SupernovaStorageType = GenericStorageType<StorageProviderType.SUPERNOVA, {
  id: string; // Not used for now, but makes it easier to handle rest of code for other providers
  name: string; // this is only for refrence
  designSystemUrl: string; // URL of the design system
  mapping: string; // Mapping configuration
}>;

export enum GenericVersionedStorageFlow {
  READ_WRITE_CREATE = 'Read/Write/Create',
  READ_WRITE = 'Read/Write',
  READ_ONLY = 'ReadOnly ',
}
export type GenericVersionedStorageType = GenericStorageType<StorageProviderType.GENERIC_VERSIONED_STORAGE, {
  name?: string; // this is only for refrence
  id: string // this would be the URL
  flow: GenericVersionedStorageFlow,
  additionalHeaders: GenericVersionedAdditionalHeaders ;
}>;

export type StorageType =
  | LocalStorageType
  | URLStorageType
  | JSONBinStorageType
  | GitHubStorageType
  | GitLabStorageType
  | GenericVersionedStorageType
  | ADOStorageType
  | BitbucketStorageType
  | SupernovaStorageType;

export type StorageTypeCredentials =
  | StorageTypeCredential<URLStorageType>
  | StorageTypeCredential<JSONBinStorageType>
  | StorageTypeCredential<GitHubStorageType>
  | StorageTypeCredential<GitLabStorageType>
  | StorageTypeCredential<GenericVersionedStorageType, false>
  | StorageTypeCredential<BitbucketStorageType>
  | StorageTypeCredential<ADOStorageType>
  | StorageTypeCredential<SupernovaStorageType>;

export type StorageTypeFormValues<Incomplete extends boolean = false> =
  | ({ new?: boolean; provider: StorageProviderType.URL } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<URLStorageType>, 'provider'>
  >)
  | ({ new?: boolean; id?: string; provider: StorageProviderType.JSONBIN } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<JSONBinStorageType>, 'provider' | 'id'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.GITHUB } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<GitHubStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.GITLAB } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<GitLabStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.BITBUCKET } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<BitbucketStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.SUPERNOVA } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<SupernovaStorageType>, 'provider'>
  >)
  | ({ new?: boolean; provider: StorageProviderType.ADO } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<ADOStorageType>, 'provider'>
  >)
  | ({ new?: boolean; id?: string; provider: StorageProviderType.GENERIC_VERSIONED_STORAGE } & OptionalPartial<
  Incomplete,
  Omit<StorageTypeCredential<GenericVersionedStorageType>, 'provider'>
  >)
  | { new?: boolean; provider: StorageProviderType.LOCAL };
export { StorageProviderType };
