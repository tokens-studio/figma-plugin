import { ThemeObjectsList } from '@/types';
import type { AnyTokenSet } from '@/types/tokens';

export interface RemoteTokenStorageData {
  tokens: Record<string, AnyTokenSet>
  themes: ThemeObjectsList
}

export interface RemoteTokenStorage_CombinedFile {
  path: string
  data: Record<string, Record<string, AnyTokenSet>>
}

export abstract class RemoteTokenStorage {
  public abstract write<Files extends RemoteTokenStorageFile[]>(files: Files): Promise<boolean>;
  public abstract read(): Promise<RemoteTokenStorageData>;

  public save() {}

  public retrieve() {}
}
