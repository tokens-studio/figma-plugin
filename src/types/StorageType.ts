import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * StorageTypes are meant to define the parameters of a storage provider
 * but this does not include their credentials
 */

export type GenericStorageType<T extends StorageProviderType = StorageProviderType, P = unknown> = P & {
  provider: T;
} & (T extends StorageProviderType.LOCAL ? {} : {
  internalId: string;
});

export type StorageTypeCredential<T extends GenericStorageType> = T & {
  secret: string;
};

export type LocalStorageType = GenericStorageType<StorageProviderType.LOCAL>;

export type URLStorageType = GenericStorageType<StorageProviderType.URL, {
  name: string // this is only for refrence
  id: string // this would be the URL
}>;

export type JSONBinStorageType = GenericStorageType<StorageProviderType.JSONBIN, {
  name: string; // this is only for refrence
  id: string; // this is the ID of the JSONBIN
}>;

export type GitStorageType = GenericStorageType<StorageProviderType.GITHUB | StorageProviderType.GITLAB, {
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is teh base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUri?: string; // this is the base API url. This is important for self hosted environments
}>;

export type ADOStorageType = GenericStorageType<StorageProviderType.ADO, {
  name?: string; // this is only for refrence
  baseUrl: string; // this is the Azure base URL (eg: https://dev.azure.com/yourOrgName). This is required for Azure
  id: string; // this is the repository identifier; eg {username}/{repo}
  branch: string; // this is teh base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
}>;

export type StorageType =
  LocalStorageType
  | URLStorageType
  | JSONBinStorageType
  | GitStorageType
  | ADOStorageType;

export type StorageTypeCredentials =
  StorageTypeCredential<URLStorageType>
  | StorageTypeCredential<JSONBinStorageType>
  | StorageTypeCredential<GitStorageType>
  | StorageTypeCredential<ADOStorageType>;
