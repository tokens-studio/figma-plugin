export type StorageType = {
  provider: StorageProviderType;
  id?: string;
  name?: string;
  filePath?: string;
  branch?: string;
};

export type ApiDataType = {
  id: string;
  secret: string;
  provider: StorageProviderType;
  name: string;
  branch?: string;
  new?: boolean;
  filePath?: string;
};

export enum StorageProviderType {
  LOCAL = 'local',
  JSONBIN = 'jsonbin',
  GITHUB = 'github',
  GITLAB = 'gitlab',
  URL = 'url',
}

export interface ContextObject extends ApiDataType {
  branch?: string;
  filePath?: string;
  tokens?: string;
  baseUrl?: string;
  internalId?: string;
  updatedAt?: string;
}

export interface StoredCredentials {
  id: string;
  provider: StorageProviderType;
  filePath?: string;
  branch?: string;
  name?: string;
}
