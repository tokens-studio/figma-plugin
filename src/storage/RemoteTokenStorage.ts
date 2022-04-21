import { ThemeObjectsList } from '@/types';
import type { AnyTokenList, AnyTokenSet } from '@/types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import parseTokenValues from '@/utils/parseTokenValues';

export type RemoteTokenStorageData<Metadata = unknown> = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  metadata: Metadata | null
};

export interface RemoteTokenStorageSingleTokenSetFile {
  type: 'tokenSet'
  path: string
  name: string
  data: AnyTokenSet<false> // @README we save tokens without their name, but rather key them by their name
}

export interface RemoteTokenStorageThemesFile {
  type: 'themes'
  path: string
  data: ThemeObjectsList
}

export interface RemoteTokenStorageMetadataFile<Metadata = unknown> {
  type: 'metadata'
  path: string
  data: Metadata
}

export type RemoteTokenStorageFile<Metadata = unknown> =
  RemoteTokenStorageSingleTokenSetFile
  | RemoteTokenStorageThemesFile
  | RemoteTokenStorageMetadataFile<Metadata>;

export abstract class RemoteTokenStorage<Metadata = unknown> {
  public abstract write(files: RemoteTokenStorageFile<Metadata>[]): Promise<boolean>;
  public abstract read(): Promise<RemoteTokenStorageFile<Metadata>[]>;

  public async save(data: RemoteTokenStorageData<Metadata>): Promise<boolean> {
    const files: RemoteTokenStorageFile<Metadata>[] = [];

    // First we'll convert the incoming data into files
    // in this generic implementation we will ignore whether multi file is enabled or not (ie for Github)
    // how these "files" are written is up to the read and write implementation
    const tokenSetObjects = convertTokensToObject(data.tokens);
    Object.entries(tokenSetObjects).forEach(([name, tokenSet]) => {
      files.push({
        type: 'tokenSet',
        name,
        path: `${name}.json`,
        data: tokenSet,
      });
    });

    // we will also include a separate file for the themes called $themes
    files.push({
      type: 'themes',
      path: '$themes.json',
      data: data.themes,
    });

    if (data.metadata) {
      files.push({
        type: 'metadata',
        path: '$metadata.json',
        data: data.metadata,
      });
    }

    return this.write(files);
  }

  public async retrieve(): Promise<RemoteTokenStorageData<Metadata>> {
    const data: RemoteTokenStorageData<Metadata> = {
      themes: [],
      tokens: {},
      metadata: null,
    };

    // start by reading the files from the remote source
    // it is up to the remote storage implementation to split it up into "File" objects
    const files = await this.read();
    files.forEach((file) => {
      if (file.type === 'themes') {
        data.themes = [...data.themes, ...file.data];
      } else if (file.type === 'tokenSet') {
        data.tokens = {
          ...data.tokens,
          ...parseTokenValues({ [file.name]: file.data }),
        };
      } else if (file.type === 'metadata') {
        data.metadata = {
          ...data.metadata,
          ...file.data,
        };
      }
    });
    return data;
  }
}
