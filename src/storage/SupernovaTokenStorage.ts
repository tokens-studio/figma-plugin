import {
  DesignSystem,
  DesignSystemVersion,
  DTPluginToSupernovaMap,
  DTPluginToSupernovaMapType,
  DTPluginToSupernovaSettings,
  Supernova,
  SupernovaToolsDesignTokensPlugin,
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

      // Always retrieve current tokens defined in the plugin, as Supernova can't yet reconstruct the tokens properly
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

    const dataObject = {
      $themes: [],
    } as any;
    files.forEach((file) => {
      if (file.type === 'themes') {
        dataObject.$themes = [
          ...(dataObject.$themes ?? []),
          ...file.data,
        ];
      } else if (file.type === 'tokenSet') {
        dataObject[file.name] = file.data;
      }
    });

    const syncTool = new SupernovaToolsDesignTokensPlugin(accessor.version);
    const settings: DTPluginToSupernovaSettings = {
      dryRun: false,
      preciseCopy: true,
      verbose: false,
    };
    const rawMaps = [{
      tokensTheme: null,
      tokenSets: ['core', 'light'],
      supernovaBrand: 'Default',
      supernovaTheme: null,
    }];

    const maps = new Array<DTPluginToSupernovaMap>();
    for (const map of rawMaps) {
      maps.push({
        type: map.tokenSets ? DTPluginToSupernovaMapType.set : DTPluginToSupernovaMapType.theme,
        pluginSets: map.tokenSets ?? null,
        pluginTheme: map.tokensTheme ?? null,
        bindToBrand: map.supernovaBrand,
        bindToTheme: map.supernovaTheme ?? null,
        nodes: null,
        processedNodes: null,
        processedGroups: null,
      });
    }
    const result = await syncTool.synchronizeTokensFromData(dataObject, maps, settings);
    return result;
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
        console.log('Obtained design system');
        return {
          ds: designSystem,
          version: designSystemVersion,
        };
      }
    } catch (error) {
      // Will throw always when something goes wrong
      console.log('Could not obtain design system');
      console.log(error);
    }
    throw new Error(
      'Unable to connect to your design system. Provide valid access token and design systen ID and try again.',
    );
  }
}
