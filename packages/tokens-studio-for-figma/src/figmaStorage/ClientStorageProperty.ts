export const ClientStorageProperty = {
  async write(key: string, value: any) {
    return figma.clientStorage.setAsync(key, JSON.stringify(value));
  },
  async read(key: string) {
    const value = await figma.clientStorage.getAsync(key);
    return value ? JSON.parse(value as string) : null;
  },
};
