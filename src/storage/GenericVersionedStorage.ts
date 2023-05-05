import z from 'zod';
import * as pjs from '../../package.json';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { singleFileSchema } from './schemas/singleFileSchema';
import { GenericVersionedStorageFlow } from '@/types/StorageType';
import { tokensMapSchema } from './schemas/tokensMapSchema';
import { themeObjectSchema } from './schemas/themeObjectSchema';

const genericVersionedSchema = singleFileSchema.extend({
  values: z.record(tokensMapSchema),
  version: z.string().optional(),
  $themes: z.array(themeObjectSchema).optional(),
  updatedAt: z.coerce.date().optional(),
});

export type GenericVersionedMeta = {
  version: string
  updatedAt: string
};

export type GenericVersionedData = GenericVersionedMeta & {
  values: Record<string, Record<string, SingleToken<false> | DeepTokensMap<false>>>
  $themes?: ThemeObjectsList
};

export type GenericVersionedAdditionalHeaders = Array<{
  name: string,
  value: string
}>;

const flattenHeaders = (headers: GenericVersionedAdditionalHeaders): Array<[key: string, val: string]> => headers.map((x) => [x.name, x.value]);

// Life cycle is

// POST - Create storage at endpoint. Storage may or may not already exist
// Get - Retrieve tokens
// PUT - Push tokens to endpoint

export class GenericVersionedStorage extends RemoteTokenStorage<GenericVersionedMeta> {
  private url: string;

  private defaultHeaders: Headers;

  private flow: GenericVersionedStorageFlow;

  public static async create(url: string, updatedAt: string, flow: GenericVersionedStorageFlow, headers: GenericVersionedAdditionalHeaders = []): Promise<false | {
    metadata: { id: string }
  }> {
    let body: string | undefined = JSON.stringify({
      version: pjs.plugin_version,
      updatedAt,
      values: {
        options: {},
      },
    }, null, 2);
    let method: string;
    switch (flow) {
      case GenericVersionedStorageFlow.READ_ONLY:
        method = 'GET';
        body = undefined;
        break;
      case GenericVersionedStorageFlow.READ_WRITE:
        method = 'PUT';
        break;
      case GenericVersionedStorageFlow.READ_WRITE_CREATE:
        method = 'POST';
        break;
      default:
        console.log('Unknown flow type');
        return false;
    }

    const response = await fetch(url, {
      method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body,
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ...flattenHeaders(headers),
      ]),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (response.ok) {
      return response.json();
    }
    return false;
  }

  constructor(url: string, flow: GenericVersionedStorageFlow, headers: GenericVersionedAdditionalHeaders = []) {
    super();
    this.url = url;
    this.flow = flow;
    this.defaultHeaders = new Headers([
      ['Content-Type', 'application/json'],
      ...flattenHeaders(headers),
    ]);
  }

  private convertGenericVersionedDataToFiles(data: GenericVersionedData): RemoteTokenStorageFile<GenericVersionedMeta>[] {
    return [
      {
        type: 'themes',
        path: '$themes.json',
        data: data.$themes ?? [],
      },
      {
        type: 'metadata',
        path: '$metadata.json',
        data: {
          version: data.version,
          updatedAt: data.updatedAt,
        },
      },
      ...Object.entries(data.values).map<RemoteTokenStorageFile<GenericVersionedMeta>>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: `${name}.json`,
        data: tokenSet,
      })),
    ];
  }

  public async read(): Promise<RemoteTokenStorageFile<GenericVersionedMeta>[]> {
    const response = await fetch(this.url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: new Headers([
        ...this.defaultHeaders.entries(),
      ]),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }
    if (response.ok) {
      const parsedJsonData = await response.json();
      const validationResult = await genericVersionedSchema.safeParseAsync(parsedJsonData);
      if (validationResult.success) {
        const GenericVersionedData = validationResult.data as unknown as GenericVersionedData;
        GenericVersionedData.updatedAt = (GenericVersionedData.updatedAt as unknown as Date).toISOString();
        return this.convertGenericVersionedDataToFiles(GenericVersionedData);
      }
    }

    // Required to satisfy typescript
    return [];
  }

  public async write(files: RemoteTokenStorageFile<GenericVersionedMeta>[]): Promise<boolean> {
    if (this.flow === GenericVersionedStorageFlow.READ_ONLY) {
      throw new Error('Attempting to write to endpoint of Versioned storage when in Read Only mode');
    }

    const dataObject: GenericVersionedData = {
      version: pjs.plugin_version,
      updatedAt: (new Date()).toISOString(),
      values: {},
      $themes: [],
    };
    files.forEach((file) => {
      if (file.type === 'themes') {
        dataObject.$themes = [
          ...(dataObject.$themes ?? []),
          ...file.data,
        ];
      } else if (file.type === 'tokenSet') {
        dataObject.values = {
          ...dataObject.values,
          [file.name]: file.data,
        };
      }
    });

    const response = await fetch(this.url, {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify(dataObject),
      headers: new Headers([
        ...this.defaultHeaders.entries(),
      ]),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }

    if (response.ok) {
      return true;
    }
    // Required to make typescript happy
    return false;
  }
}
