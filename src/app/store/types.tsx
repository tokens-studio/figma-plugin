export type StorageType = {
    provider: StorageProviderType;
    id?: string;
    name?: string;
};

export type apiData = {
    id: string;
    secret: string;
    provider: string;
    name: string;
};

export enum StorageProviderType {
    LOCAL = 'local',
    ARCADE = 'arcade',
    JSONBIN = 'jsonbin',
}
