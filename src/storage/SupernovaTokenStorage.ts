import { DesignSystem, DesignSystemVersion, Supernova, SupernovaToolsDesignTokensPlugin, TokenJSONBuilder } from '@supernovaio/supernova-sdk';
import * as pjs from '../../package.json';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';
import { notifyUI } from '../plugin/notifiers';
import { GitSingleFileObject, GitStorageMetadata } from './GitTokenStorage'

export type SupernovaMetadata = {};

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
    console.log("+++ READ");
    const accessor = await this.readWriteInstance();
    // Use JSON token builder from Supernova SDK to create token representation.
    // For now, we will represent it as single-file representation
    const tool = new TokenJSONBuilder(this.sdkInstance, accessor.version);
    const representation = await tool.figmaTokensRepresentation(true) as GitSingleFileObject;
    const baseRepresentation = {
      Supernova: { ...representation },
    } as GitSingleFileObject;
    console.log(representation);
    return [
      {
        type: 'themes',
        path: 'themes/$themes.json', // TODO: Theming support
        data: [],
      },
      ...(Object.entries(baseRepresentation).filter(([key]) => key !== '$themes') as [string, AnyTokenSet<false>][]).map<RemoteTokenStorageFile<SupernovaMetadata>>(([name, tokenSet]) => ({
        name,
        type: 'tokenSet',
        path: 'base/tokenset.json', // TODO: Theming support
        data: tokenSet,
      })),
    ];
  }

  public async write(files: RemoteTokenStorageFile<SupernovaMetadata>[]): Promise<boolean> {
    // Create Supernova instance, fetch design system and version
    const accessor = await this.readWriteInstance();
    // Use jSON token tool to synchronize tokens back to Supernova
    // For now, they should be synchronized to the first brand, but that will be configurable later on
    const brands = await accessor.version.brands();
    const brand = brands[0];
    const tool = new SupernovaToolsDesignTokensPlugin(this.sdkInstance, accessor.version, brand);
    // Create definition as JSON, single file mode
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
