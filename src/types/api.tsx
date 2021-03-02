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
};

export enum StorageProviderType {
    LOCAL = 'local',
    ARCADE = 'arcade',
    JSONBIN = 'jsonbin',
}
