import { StorageProviderType } from '@/constants/StorageProviderType';

/**
 * StorageTypes are meant to define the parameters of a storage provider
 * but this does not include their credentials
 */

export type URLStorageType = {
  type: StorageProviderType.URL
  name: string // this is only for refrence
  id: string // this would be the URL
};

export type JSONBinStorageType = {
  type: StorageProviderType.JSONBIN;
  name: string; // this is only for refrence
  id: string; // this is the ID of the JSONBIN
};

export type GitStorageType = {
  type: StorageProviderType.GITHUB | StorageProviderType.GITLAB;
  name: string; // this is only for refrence
  id: string; // this should be the repository identifier; eg {username}/{repo}
  branch: string; // this is teh base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
  baseUri?: string; // this is the base API url. This is important for self hosted environments
};

export type ADOStorageType = {
  type: StorageProviderType.ADO;
  name?: string; // this is only for refrence
  baseUrl: string; // this is the Azure base URL (eg: https://dev.azure.com/yourOrgName). This is required for Azure
  id: string; // this is the repository identifier; eg {username}/{repo}
  branch: string; // this is teh base branch
  filePath: string; // this is the path to the token file or files (depends on multifile support)
};

export type StorageType =
  URLStorageType
  | JSONBinStorageType
  | GitStorageType
  | ADOStorageType;
