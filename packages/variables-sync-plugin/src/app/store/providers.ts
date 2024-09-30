import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';

import { StorageProviderType, StorageType } from '@tokens-studio/sync-providers/types';
// import { StorageType } from '@tokens-studio/sync-providers';
import { figmaStorage } from './adapter.js';

interface ProvidersState extends StorageType {

}

export const useProvidersStore = create<ProvidersState>()(
  persist(
    (set, get) => ({
      secret: '',
      id: '',
      provider: StorageProviderType.GITHUB,
      internalId: '',
      name: '',
      branch: '',
      filePath: '',
      setProvider: (provider: any) => set({ ...get(), provider }),
      // addABear: () => set({ bears: get().bears + 1 }),
    }),
    {
      name: 'providers-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => figmaStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)