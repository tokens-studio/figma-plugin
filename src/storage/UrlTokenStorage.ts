import z from 'zod';
import { ThemeObjectsList } from '@/types';
import { AnyTokenSet } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { singleFileSchema } from './schemas/singleFileSchema';
import IsJSONString from '@/utils/isJSONString';

type UrlData = {
  values: Record<string, AnyTokenSet<false>>
  $themes?: ThemeObjectsList
};

export class UrlTokenStorage extends RemoteTokenStorage {
  private url: string;

  private secret: string;

  constructor(url: string, secret: string) {
    super();
    this.url = url;
    this.secret = secret;
  }

  private convertUrlDataToFiles(data: UrlData): RemoteTokenStorageFile[] {
    return [
      {
        type: 'themes',
        path: '$themes.json',
        data: data.$themes ?? [],
      },
      ...Object.entries(data.values).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: `${name}.json`,
        data: tokenSet,
      })),
    ];
  }

  public async read(): Promise<RemoteTokenStorageFile[]> {
    const customHeaders = IsJSONString(this.secret)
      ? JSON.parse(this.secret) as Record<string, string>
      : {};

    const headers = {
      Accept: 'application/json',
      ...customHeaders,
    };

    const response = await fetch(this.url, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      const parsedJsonData = await response.json();
      const validationResult = await z.object({
        record: singleFileSchema,
      }).safeParseAsync(parsedJsonData);
      if (validationResult.success) {
        const jsonbinData = validationResult.data.record as UrlData;
        return this.convertUrlDataToFiles(jsonbinData);
      }
    }

    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
