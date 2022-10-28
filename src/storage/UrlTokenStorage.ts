import { ThemeObjectsList } from '@/types';
import {
  RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata, RemoteTokenStorageSingleTokenSetFile,
} from './RemoteTokenStorage';
import { singleFileSchema } from './schemas/singleFileSchema';
import IsJSONString from '@/utils/isJSONString';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { complexSingleFileSchema } from './schemas';

type UrlData = {
  values: Record<string, RemoteTokenStorageSingleTokenSetFile['data']>
  $themes?: ThemeObjectsList
  $metadata?: RemoteTokenStorageMetadata
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
        path: `${SystemFilenames.THEMES}.json`,
        data: data.$themes ?? [],
      },
      {
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: data.$metadata ?? {},
      },
      ...Object.entries(data.values).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: `${name}.json`,
        data: tokenSet,
      })),
    ];
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
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
      const validationResult = await singleFileSchema.safeParseAsync(parsedJsonData);
      // @README if this validation passes we can assume it is in a newer format
      if (validationResult.success) {
        const urlstorageData = validationResult.data as UrlData;
        return this.convertUrlDataToFiles(urlstorageData);
      }

      // @README if not this is an older format where we just have tokens
      const onlyTokensValidationResult = await complexSingleFileSchema.safeParseAsync(parsedJsonData);
      if (onlyTokensValidationResult.success) {
        const urlstorageData = onlyTokensValidationResult.data;
        const { $themes = [], $metadata = {}, ...values } = urlstorageData;
        return this.convertUrlDataToFiles({
          values,
          $themes,
          $metadata,
        });
      }
      return {
        errorMessage: ErrorMessages.VALIDATION_ERROR,
      };
    }

    return [];
  }

  public async write(): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
