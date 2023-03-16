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

  private workspaceHandle: string;

  private designSystemId: string;

  private secret: string;

  private sdkInstance: Supernova;

  constructor(url: string, secret: string) {
    super();

    // Deconstruct url to WS ID / DS ID
    try {
      let parsedURL = new URL(url);
      let fragments = parsedURL.pathname.split('/');
      if (fragments.length < 5 || fragments[1] !== 'ws' || fragments[3] !== 'ds') {
        throw new Error('Design system URL is not properly formatted. Please copy URL from the cloud without modifying it and try again.');
      } else {
        this.workspaceHandle = fragments[2];
        this.designSystemId = fragments[4].split('-')[0];
        console.log(this.workspaceHandle);
        console.log(this.designSystemId);
        this.secret = secret;
        this.sdkInstance = new Supernova(this.secret, null, null);
      }
    } catch (error) {
      throw (error);
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      // Create Supernova instance, fetch design system and version, checking if this is possible
      const accessor = await this.readWriteInstance();

      // Always retrieve current tokens defined in the plugin
      return [];
    } catch (error) {
      throw new Error('There was an error connecting to Supernova. Check your API key / Design System URL.');
    }
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
      console.log('GOT INSTANCE');
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
      'Unable to connect to your design system. Provide valid access token and design systen ID and try again.',
    );
  }
}
