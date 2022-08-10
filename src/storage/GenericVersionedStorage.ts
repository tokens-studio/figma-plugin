import z from 'zod';
import * as pjs from '../../package.json';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { singleFileSchema } from './schemas/singleFileSchema';

const genericVersionedSchema = singleFileSchema.extend({
  version: z.string(),
  updatedAt: z.string().optional(),
});

type GenericVersionedMeta = {
  version: string
  updatedAt: string
};

type GenericVersionedData = GenericVersionedMeta & {
  values: Record<string, Record<string, SingleToken<false> | DeepTokensMap<false>>>
  $themes?: ThemeObjectsList
};

export type GenericVersionedAdditionalHeaders = Array<{
  name: string,
  value: string
}>;

const flattenHeaders = (headers: GenericVersionedAdditionalHeaders) => headers.map((x) => [x.name, x.value]);

// Life cycle is

// POST - Create storage at endpoint. Storage may or may not already exist
// Get - Retrieve tokens
// PUT - Push tokens to endpoint

export class GenericVersionedStorage extends RemoteTokenStorage<GenericVersionedMeta> {
  private url: string;

  private defaultHeaders: Headers;

  public static async create(url: string, updatedAt: string, headers: GenericVersionedAdditionalHeaders = []): Promise<false | {
    metadata: { id: string }
  }> {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({
        version: pjs.plugin_version,
        updatedAt,
        values: {
          options: {},
        },
      }, null, 2),
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ...flattenHeaders(headers),
      ]),
    });

    if (response.ok) {
      return response.json();
    }

    return false;
  }

  constructor(url: string, headers: GenericVersionedAdditionalHeaders = []) {
    super();
    this.url = url;

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
    if (response.ok) {
      const parsedJsonData = await response.json();
      const validationResult = await z.object({
        record: genericVersionedSchema,
      }).safeParseAsync(parsedJsonData);
      if (validationResult.success) {
        const GenericVersionedData = validationResult.data.record as GenericVersionedData;
        return this.convertGenericVersionedDataToFiles(GenericVersionedData);
      }
    }

    return [];
  }

  public async write(files: RemoteTokenStorageFile<GenericVersionedMeta>[]): Promise<boolean> {
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

    if (response.ok) {
      return true;
    }

    return false;
  }
}
