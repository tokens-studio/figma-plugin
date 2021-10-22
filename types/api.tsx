export type StorageType = {
    provider: StorageProviderType;
    id?: string;
    name?: string;
};

export type ApiDataType = {
    id: string;
    secret: string;
    provider: StorageProviderType;
    name: string;
    new?: boolean;
};

export enum StorageProviderType {
    LOCAL = 'local',
    JSONBIN = 'jsonbin',
    GITHUB = 'github',
    URL = 'url',
}

export interface ContextObject extends ApiDataType {
    secret: string;
    id: string;
    branch: string;
    filePath: string;
    tokens: string;
}
