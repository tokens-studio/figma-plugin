import z from 'zod';
import * as pjs from '../../package.json';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import {
  RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata,
} from './RemoteTokenStorage';
import { singleFileSchema } from './schemas/singleFileSchema';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';

type JsonBinMetadata = Partial<{
  version: string
  updatedAt: string
}>;

type JsonbinData = JsonBinMetadata & {
  values: Record<string, Record<string, SingleToken<false> | DeepTokensMap<false>>>
  $themes?: ThemeObjectsList
  $metadata?: RemoteTokenStorageMetadata & JsonBinMetadata
};

const jsonbinSchema = singleFileSchema.extend({
  version: z.string().optional(),
  updatedAt: z.string().optional(),
});

export class JSONBinTokenStorage extends RemoteTokenStorage<JsonBinMetadata> {
  private id: string;

  private secret: string;

  private defaultHeaders: Headers;

  public static async create(name: string, updatedAt: string, secret: string): Promise<false | {
    metadata: { id: string }
  }> {
    const response = await fetch('https://api.jsonbin.io/v3/b', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({
        values: { options: {} },
        $metadata: {
          version: pjs.plugin_version,
          updatedAt,
        },
      }, null, 2),
      headers: new Headers([
        ['Content-Type', 'application/json'],
        ['X-Master-Key', secret],
        ['X-Bin-Name', name],
        ['versioning', 'false'],
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

  constructor(id: string, secret: string) {
    super();
    this.id = id;
    this.secret = secret;

    this.defaultHeaders = new Headers();
    this.defaultHeaders.append('Content-Type', 'application/json');
    this.defaultHeaders.append('X-Master-Key', this.secret);
  }

  private convertJsonBinDataToFiles(data: JsonbinData): RemoteTokenStorageFile<JsonBinMetadata>[] {
    // @README the version and updatedAt key have been moved to the $metadata object
    // but we'll still support the old keys when reading
    return [
      {
        type: 'themes',
        path: `${SystemFilenames.THEMES}.json`,
        data: data.$themes ?? [],
      },
      {
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: {
          version: data.$metadata?.version ?? data.version ?? pjs.plugin_version,
          updatedAt: data.$metadata?.updatedAt ?? data.updatedAt ?? new Date().toISOString(),
          ...(data.$metadata?.tokenSetOrder ? {
            tokenSetOrder: data.$metadata.tokenSetOrder,
          } : {}),
        },
      },
      ...Object.entries(data.values).map<RemoteTokenStorageFile<JsonBinMetadata>>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: `${name}.json`,
        data: tokenSet,
      })),
    ];
  }

  public async read(): Promise<RemoteTokenStorageFile<JsonBinMetadata>[] | RemoteTokenstorageErrorMessage> {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${this.id}/latest`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: new Headers([
        ...this.defaultHeaders.entries(),
        ['X-Bin-Meta', '0'],
      ]),
    });

    if (!response.ok) {
      throw Error(response.statusText);
    }

    if (response.ok) {
      const parsedJsonData = await response.json();
      const validationResult = await z.object({
        record: jsonbinSchema,
      }).safeParseAsync(parsedJsonData);
      if (validationResult.success) {
        const jsonbinData = validationResult.data.record as JsonbinData;
        return this.convertJsonBinDataToFiles(jsonbinData);
      }
      return {
        errorMessage: ErrorMessages.VALIDATION_ERROR,
      };
    }
    return [];
  }

  public async write(files: RemoteTokenStorageFile<JsonBinMetadata>[]): Promise<boolean> {
    const dataObject: JsonbinData = {
      values: {},
      $metadata: {
        version: pjs.plugin_version,
        updatedAt: (new Date()).toISOString(),
      },
      $themes: [],
    };
    files.forEach((file) => {
      if (file.type === 'themes') {
        dataObject.$themes = [
          ...(dataObject.$themes ?? []),
          ...file.data,
        ];
      } else if (file.type === 'metadata') {
        dataObject.$metadata = {
          ...(dataObject.$metadata ?? []),
          ...file.data,
        };
      } else if (file.type === 'tokenSet') {
        dataObject.values = {
          ...dataObject.values,
          [file.name]: file.data,
        };
      }
    });

    const response = await fetch(`https://api.jsonbin.io/v3/b/${this.id}`, {
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

    return false;
  }
}
