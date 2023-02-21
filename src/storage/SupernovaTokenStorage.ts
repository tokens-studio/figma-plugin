import {
  DesignSystem,
  DesignSystemVersion,
  Supernova,
  TokenJSONBuilder,
} from '@supernovaio/supernova-sdk';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenstorageErrorMessage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { GitSingleFileObject } from './GitTokenStorage';

export type SupernovaStorageSaveOptions = {
  commitMessage?: string;
};

export class SupernovaTokenStorage extends RemoteTokenStorage<SupernovaStorageSaveOptions> {
  private designSystemId: string;

  private secret: string;

  private sdkInstance: Supernova;

  constructor(id: string, secret: string) {
    super();
    this.designSystemId = id;
    this.secret = secret;
    this.sdkInstance = new Supernova(this.secret, null, null);
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    throw new Error('Not supported for reading');
  }

  public async write(files: Array<RemoteTokenStorageFile<any>>, saveOptions?: SupernovaStorageSaveOptions): Promise<boolean> {
    // Create Supernova instance, fetch design system and version
    const accessor = await this.readWriteInstance();
    // Use jSON token tool to synchronize tokens back to Supernova
    // For now, they should be synchronized to the first brand, but that will be configurable later on
    const brands = await accessor.version.brands();
    // const brand = brands[0];
    // const tool = new SupernovaToolsDesignTokensPlugin(this.sdkInstance, accessor.version, brand);

    console.log(brands);
    console.log(files);
    return false;

    // Create definition as JSON, single file mode
    /*
    const jsonDefinition = JSON.stringify({
      ...files.reduce<GitSingleFileObject>((acc, file) => {
        if (file.type === 'tokenSet') {
          acc[file.name] = file.data;
        }
        if (file.type === 'themes') {
          acc.$themes = [...acc.$themes ?? [], ...file.data];
        }
        return acc;
      }, {}),
    }, null, 2); 
    // Merge remote with definition
    const incomingTokenPack = tool.loadTokensFromDefinition(jsonDefinition);
    await tool.mergeWithRemoteSource(incomingTokenPack.processedNodes, true);
    return true;
    */
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
      console.log(error);
    }
    throw new Error(
      'Unable to connect to your design system. Provide valid access token and design systen ID and try again.'
    );
  }
}
