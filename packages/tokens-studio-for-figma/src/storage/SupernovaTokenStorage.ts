import { DesignSystem, DesignSystemVersion, Supernova } from '@supernovaio/supernova-sdk';
import * as Sentry from '@sentry/react';
import { AnyTokenSet } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { ErrorMessages } from '../constants/ErrorMessages';
import { SystemFilenames } from '../constants/SystemFilenames';
import { SaveOption } from './FileTokenStorage';

export type SupernovaStorageSaveOptions = {
  commitMessage?: string;
};

export class SupernovaTokenStorage extends RemoteTokenStorage<SupernovaStorageSaveOptions, SaveOption> {
  private workspaceHandle: string;

  private designSystemId: string;

  private mapping: string;

  private secret: string;

  private sdkInstance: Supernova;

  constructor(url: string, mapping: string, secret: string) {
    super();
    // Deconstruct url to WS ID / DS ID
    const parsedURL = new URL(url);
    const fragments = parsedURL.pathname.split('/');
    const isCloud = url.match(/\/\/(cloud|app).(dev\.|demo\.|staging\.|)supernova.io/)?.[1] === 'cloud';
    if (fragments.length < 5 || isCloud && (fragments[1] !== 'ws' || fragments[3] !== 'ds')) {
      throw new Error(
        'Design system URL is not properly formatted. Please copy URL from the cloud without modifying it and try again.',
      );
    } else {
      // eslint-disable-next-line prefer-destructuring
      this.workspaceHandle = isCloud ? fragments[2] : fragments[1].split('-')[0];
      // eslint-disable-next-line prefer-destructuring
      this.designSystemId = isCloud ? fragments[4].split('-')[0] : fragments[2].split('-')[0];
      this.secret = secret;
      this.mapping = mapping;
      this.sdkInstance = new Supernova(this.secret, this.networkInstanceFromURL(url), null);
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      // Create Supernova instance, fetch design system and version, checking if this is possible
      const accessor = await this.readWriteInstance();
      let payload: any;

      try {
        const data: any = await accessor.version.getTokenStudioData();
        payload = data.payload; // Discard all the other data that we get from the API and only focus on payload
      } catch (error) {
        // There is nothing to read, design system didn't have any tokens pushed before.
        return [];
      }
      return [
        {
          type: 'themes',
          path: `${SystemFilenames.THEMES}.json`,
          data: payload.$themes ?? [],
        },
        ...(payload.$metadata
          ? [
            {
              type: 'metadata' as const,
              path: `${SystemFilenames.METADATA}.json`,
              data: payload.$metadata,
            },
          ]
          : []),
        ...(Object.entries(payload).filter(([key]) => !Object.values<string>(SystemFilenames).includes(key)) as [
          string,
          AnyTokenSet<false>,
        ][]).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
          name,
          type: 'tokenSet',
          path: `${name}.json`,
          data: tokenSet,
        })),
      ];
    } catch (error) {
      console.error(error);
      return {
        errorMessage: ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR,
      };
    }
  }

  public async write(
    files: Array<RemoteTokenStorageFile<any>>,
  ): Promise<boolean> {
    // Create Supernova instance, fetch design system and version
    // Create writable Supernova instance
    const accessor = await this.readWriteInstance();
    const dataObject = {
      $themes: [],
    } as any;
    files.forEach((file) => {
      if (file.type === 'themes') {
        dataObject.$themes = [...(dataObject.$themes ?? []), ...file.data];
      } else if (file.type === 'tokenSet') {
        dataObject[file.name] = file.data;
      } else if (file.type === 'metadata') {
        dataObject.$metadata = {
          ...(dataObject.$metadata ?? []),
          ...file.data,
        };
      }
    });

    const mapObject = JSON.parse(this.mapping);
    const object: any = {
      connection: {
        name: 'name',
      },
      settings: {
        dryRun: false,
        preciseCopy: true,
        verbose: false,
      },
      mapping: mapObject,
      payload: dataObject,
    };

    const writer = accessor.version.writer();
    await writer.writeTokenStudioData(object);
    return true;
  }

  private networkInstanceFromURL(url: string): string {
    if (url.includes('cloud.supernova.io') || url.includes('app.supernova.io')) {
      return 'https://api.supernova.io/api';
    }
    if (url.includes('cloud.dev.supernova.io') || url.includes('app.dev.supernova.io')) {
      return 'https://api.dev.supernova.io/api';
    }
    if (url.includes('cloud.demo.supernova.io') || url.includes('app.demo.supernova.io')) {
      return 'https://api.demo.supernova.io/api';
    }
    if (url.includes('cloud.staging.supernova.io') || url.includes('app.staging.supernova.io')) {
      return 'https://api.staging.supernova.io/api';
    }
    throw new Error('Unsupported Supernova URL');
  }

  private async readWriteInstance(): Promise<{
    version: DesignSystemVersion;
    ds: DesignSystem;
  }> {
    // Create Supernova instance, fetch design system and version
    try {
      const designSystem = await this.sdkInstance.designSystem(this.designSystemId);
      const designSystemVersion = await designSystem!.activeVersion();
      if (designSystem && designSystemVersion) {
        return {
          ds: designSystem,
          version: designSystemVersion,
        };
      }
    } catch (error) {
      // Will throw always when something goes wrong
      Sentry.captureException(error);
      console.log(error);
    }
    throw new Error(ErrorMessages.SUPERNOVA_CREDENTIAL_ERROR);
  }
}
