import { DesignSystem, DesignSystemVersion, Supernova } from '@supernovaio/supernova-sdk';
import * as pjs from '../../package.json';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { notifyUI } from '../plugin/notifiers';

export type SupernovaMetadata = {
  version: string
  updatedAt: string
};

type SupernovaData = SupernovaMetadata & {
  values: Record<string, Record<string, SingleToken<false> | DeepTokensMap<false>>>
  $themes?: ThemeObjectsList,
};

export class SupernovaTokenStorage extends RemoteTokenStorage<SupernovaMetadata> {
  private designSystemId: string;

  private secret: string;

  private sdkInstance: Supernova;

  constructor(id: string, secret: string) {
    super();
    this.designSystemId = id;
    this.secret = secret;
    this.sdkInstance = new Supernova(this.secret, null, null);
  }

  public async read(): Promise<RemoteTokenStorageFile<SupernovaMetadata>[]> {
    const accessor = await this.readWriteInstance();
    // TODO Read
    return [];
  }

  public async write(files: RemoteTokenStorageFile<SupernovaMetadata>[]): Promise<boolean> {
    // Create Supernova instance, fetch design system and version
    const accessor = await this.readWriteInstance();

    const dataObject: SupernovaData = {
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

    // TODO write

    return false;
  }

  private async readWriteInstance(): Promise<{
    version: DesignSystemVersion,
    ds: DesignSystem,
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
      console.log(error);
    }
    throw new Error('Unable to connect to your design system. Provide valid access token and design systen ID and try again.');
  }
}
