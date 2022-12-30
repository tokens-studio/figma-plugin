import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import type { AnyTokenList, SingleToken } from '@/types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import parseTokenValues from '@/utils/parseTokenValues';
import { SystemFilenames } from '@/constants/SystemFilenames';

export type RemoteTokenStorageMetadata = {
  tokenSetOrder?: string[]
};

export type RemoteTokenStorageData<Metadata> = {
  tokens: Record<string, AnyTokenList>
  themes: ThemeObjectsList
  metadata?: RemoteTokenStorageMetadata & Metadata | null
};

export interface RemoteTokenStorageSingleTokenSetFile {
  type: 'tokenSet'
  path: string
  name: string
  data: Record<string, SingleToken<false> | DeepTokensMap<false>>;// @README we save tokens without their name, but rather key them by their name
}

export interface RemoteTokenStorageThemesFile {
  type: 'themes'
  path: string
  data: ThemeObjectsList
}

export interface RemoteTokenStorageMetadataFile<Metadata = unknown> {
  type: 'metadata'
  path: string
  data: RemoteTokenStorageMetadata & Metadata
}

export interface RemoteTokenstorageErrorMessage {
  errorMessage: string
}

export type RemoteTokenStorageFile<Metadata = unknown> =
  RemoteTokenStorageSingleTokenSetFile
  | RemoteTokenStorageThemesFile
  | RemoteTokenStorageMetadataFile<Metadata>;

export abstract class RemoteTokenStorage<Metadata = unknown, SaveOptions = unknown> {
  public abstract write(files: RemoteTokenStorageFile<Metadata>[], saveOptions?: SaveOptions): Promise<boolean>;
  public abstract read(): Promise<RemoteTokenStorageFile<Metadata>[] | RemoteTokenstorageErrorMessage>;

  public async save(data: RemoteTokenStorageData<Metadata>, saveOptions?: SaveOptions): Promise<boolean> {
    const files: RemoteTokenStorageFile<Metadata>[] = [];
    // First we'll convert the incoming data into files
    // in this generic implementation we will ignore whether multi file is enabled or not (ie for Github)
    // how these "files" are written is up to the read and write implementation
    const tokenSetObjects = convertTokensToObject({ ...data.tokens });
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
      path: `${SystemFilenames.THEMES}.json`,
      data: data.themes,
    });

    if ('metadata' in data && data.metadata) {
      files.push({
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: data.metadata,
      });
    }

    return this.write(files, saveOptions);
  }

  public async retrieve(): Promise<RemoteResponseData<Metadata> | null> {
    const data: RemoteTokenStorageData<Metadata> = {
      themes: [],
      tokens: {},
    };

    // start by reading the files from the remote source
    // it is up to the remote storage implementation to split it up into "File" objects
    const files = await this.read();

    // successfully fetch data
    if (Array.isArray(files)) {
      if (files.length === 0) {
        return null;
      }
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
      return {
        status: 'success',
        ...data,
      };
    }
    return {
      status: 'failure',
      ...files,
    };
  }
}
