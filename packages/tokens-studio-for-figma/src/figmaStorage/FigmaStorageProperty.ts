export enum FigmaStorageType {
  CLIENT_STORAGE = 'client_storage',
  SHARED_PLUGIN_DATA = 'shared_plugin_data',
}

export class FigmaStorageProperty<V = string> {
  protected storageType: FigmaStorageType = FigmaStorageType.CLIENT_STORAGE;

  protected key: string;

  protected stringify: (value: V) => string = (value) => String(value);

  protected parse: (value: string) => V | null = (value) => value as unknown as V;

  constructor(
    storageType: FigmaStorageType,
    key: string,
    stringify?: (value: V) => string,
    parse?: (value: string) => V | null,
  ) {
    this.storageType = storageType;
    this.key = key;
    if (stringify) this.stringify = stringify;
    if (parse) this.parse = parse;
  }

  public async read(node: BaseNode = figma.root): Promise<V | null> {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      const value = await figma.clientStorage.getAsync(this.key);
      return value ? this.parse(value) : null;
    } if (this.storageType === FigmaStorageType.SHARED_PLUGIN_DATA) {
      const keyParts = this.key.split('/');
      const namespace = keyParts[0];
      const key = keyParts.slice(1).join('/');
      const value = node?.getSharedPluginData(namespace, key);
      return value ? this.parse(value) : null;
    }

    return null;
  }

  public async write(value: V | null, node: BaseNode = figma.root) {
    if (this.storageType === FigmaStorageType.CLIENT_STORAGE) {
      await figma.clientStorage.setAsync(this.key, value ? this.stringify(value) : null);
    } else if (this.storageType === FigmaStorageType.SHARED_PLUGIN_DATA) {
      const keyParts = this.key.split('/');
      const namespace = keyParts[0];
      const key = keyParts.slice(1).join('/');
      node?.setSharedPluginData(namespace, key, value ? this.stringify(value) : '');
    }
  }
}
