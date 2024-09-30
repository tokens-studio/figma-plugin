import { StateStorage } from 'zustand/middleware';

export const figmaStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    console.log(name, 'has been retrieved')
    return (await figma.clientStorage.getAsync(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    console.log(name, 'with value', value, 'has been saved')
    await figma.clientStorage.setAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    console.log(name, 'has been deleted')
    await figma.clientStorage.deleteAsync(name);
  },
}
