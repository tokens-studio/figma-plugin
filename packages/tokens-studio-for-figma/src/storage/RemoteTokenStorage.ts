import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import type { AnyTokenList, SingleToken } from '@/types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import parseTokenValues from '@/utils/parseTokenValues';
import { SystemFilenames } from '@/constants/SystemFilenames';

export type RemoteTokenStorageMetadata = {
  tokenSetOrder?: string[];
  tokenSetsData?: Record<string, { isDynamic?: boolean }>;
};

export type RemoteTokenStorageData<Metadata> = {
  tokens: Record<string, AnyTokenList>;
  themes: ThemeObjectsList;
  metadata?: (RemoteTokenStorageMetadata & Metadata) | null;
};

export interface RemoteTokenStorageSingleTokenSetFile {
  type: 'tokenSet';
  path: string;
  name: string;
  data: Record<string, SingleToken<false> | DeepTokensMap<false>>; // @README we save tokens without their name, but rather key them by their name
}

export interface RemoteTokenStorageThemesFile {
  type: 'themes';
  path: string;
  data: ThemeObjectsList;
}

export interface RemoteTokenStorageMetadataFile<Metadata = unknown> {
  type: 'metadata';
  path: string;
  data: RemoteTokenStorageMetadata & Metadata;
}

export interface RemoteTokenstorageErrorMessage {
  errorMessage: string;
}

export type RemoteTokenStorageFile<Metadata = unknown> =
  | RemoteTokenStorageSingleTokenSetFile
  | RemoteTokenStorageThemesFile
  | RemoteTokenStorageMetadataFile<Metadata>;

type RemoteStorageSaveOptions = {
  storeTokenIdInJsonEditor: boolean;
  useDeltaDiff?: boolean;
  lastSyncedState?: string;
};

export abstract class RemoteTokenStorage<
  Metadata = unknown,
  SaveOptions extends RemoteStorageSaveOptions = {
    storeTokenIdInJsonEditor: boolean;
    useDeltaDiff?: boolean;
    lastSyncedState?: string;
  },
> {
  public abstract write(files: RemoteTokenStorageFile<Metadata>[], saveOptions?: SaveOptions): Promise<boolean>;
  public abstract read(): Promise<RemoteTokenStorageFile<Metadata>[] | RemoteTokenstorageErrorMessage>;

  /**
   * Compares current raw tokens/themes data with lastSyncedState to identify which specific files changed
   * This happens BEFORE converting to files, avoiding format mismatch issues
   * Returns the list of files that actually need to be pushed
   */
  protected getChangedFiles(data: RemoteTokenStorageData<Metadata>, lastSyncedState?: string): {
    changedTokenSets: Set<string>;
    themesChanged: boolean;
    metadataChanged: boolean;
    skipEntireSync: boolean;
  } {
    if (!lastSyncedState) {
      console.log('🔄 Delta Diff: No lastSyncedState available, treating all files as changed');
      return {
        changedTokenSets: new Set(Object.keys(data.tokens)),
        themesChanged: true,
        metadataChanged: !!data.metadata,
        skipEntireSync: false,
      };
    }

    console.log('🧠 Delta Diff: Comparing raw tokens/themes with lastSyncedState by token set...');

    try {
      // Parse the lastSyncedState to get previous tokens and themes
      const lastSyncedData = JSON.parse(lastSyncedState);
      if (!Array.isArray(lastSyncedData) || lastSyncedData.length < 2) {
        console.warn('❌ Delta Diff: Invalid lastSyncedState format, treating all files as changed');
        return {
          changedTokenSets: new Set(Object.keys(data.tokens)),
          themesChanged: true,
          metadataChanged: !!data.metadata,
          skipEntireSync: false,
        };
      }

      const [previousTokens, previousThemes] = lastSyncedData;
      const changedTokenSets = new Set<string>();

      // Compare each token set individually
      console.log('🔍 Delta Diff: Comparing token sets...');
      const currentTokenSetNames = new Set(Object.keys(data.tokens));
      const previousTokenSetNames = new Set(Object.keys(previousTokens || {}));

      // Check for new or changed token sets
      for (const tokenSetName of currentTokenSetNames) {
        if (!previousTokenSetNames.has(tokenSetName)) {
          console.log(`📝 Delta Diff: New token set detected: ${tokenSetName}`);
          changedTokenSets.add(tokenSetName);
        } else {
          // Compare the token set content
          const currentTokenSet = JSON.stringify(data.tokens[tokenSetName], null, 2);
          const previousTokenSet = JSON.stringify(previousTokens[tokenSetName], null, 2);

          if (currentTokenSet !== previousTokenSet) {
            console.log(`📝 Delta Diff: Changed token set detected: ${tokenSetName}`);
            changedTokenSets.add(tokenSetName);
          } else {
            console.log(`✅ Delta Diff: Token set unchanged: ${tokenSetName}`);
          }
        }
      }

      // Check for deleted token sets (these would need special handling)
      for (const tokenSetName of previousTokenSetNames) {
        if (!currentTokenSetNames.has(tokenSetName)) {
          console.log(`🗑️ Delta Diff: Deleted token set detected: ${tokenSetName} (Note: deletion handling may be needed)`);
          // Note: We don't add deleted sets to changedTokenSets since they don't exist to push
        }
      }

      // Compare themes
      const currentThemesString = JSON.stringify(data.themes, null, 2);
      const previousThemesString = JSON.stringify(previousThemes, null, 2);
      const themesChanged = currentThemesString !== previousThemesString;

      if (themesChanged) {
        console.log('📝 Delta Diff: Themes changed');
      } else {
        console.log('✅ Delta Diff: Themes unchanged');
      }

      // For metadata, we'll assume it changed if it exists (metadata is usually small)
      const metadataChanged = !!data.metadata;

      console.log(`📊 Delta Diff: Summary - ${changedTokenSets.size} token sets changed, themes: ${themesChanged}, metadata: ${metadataChanged}`);

      // If nothing changed at all, we can skip the entire sync
      const skipEntireSync = changedTokenSets.size === 0 && !themesChanged && !metadataChanged;

      if (skipEntireSync) {
        console.log('✨ Delta Diff: No changes detected anywhere - skipping push entirely!');
      } else {
        console.log(`🎯 Delta Diff: Will push ${changedTokenSets.size} token sets${themesChanged ? ' + themes' : ''}${metadataChanged ? ' + metadata' : ''}`);
        if (changedTokenSets.size > 0) {
          console.log(`   📋 Changed token sets: ${Array.from(changedTokenSets).join(', ')}`);
        }
      }

      return {
        changedTokenSets,
        themesChanged,
        metadataChanged,
        skipEntireSync,
      };
    } catch (error) {
      console.warn('❌ Delta Diff: Comparison failed, treating all files as changed:', error);
      return {
        changedTokenSets: new Set(Object.keys(data.tokens)),
        themesChanged: true,
        metadataChanged: !!data.metadata,
        skipEntireSync: false,
      };
    }
  }

  public async save(data: RemoteTokenStorageData<Metadata>, saveOptions: SaveOptions): Promise<boolean> {
    console.log('💾 RemoteTokenStorage: Starting save operation...');
    console.log(`   🔧 Delta diff enabled: ${!!saveOptions.useDeltaDiff}`);
    console.log(`   🧠 lastSyncedState available: ${!!saveOptions.lastSyncedState}`);

    const filesToPush: RemoteTokenStorageFile<Metadata>[] = [];

    // Check if delta diff is enabled and determine which files need to be pushed
    if (saveOptions.useDeltaDiff) {
      const {
        changedTokenSets,
        themesChanged,
        metadataChanged,
        skipEntireSync,
      } = this.getChangedFiles(data, saveOptions.lastSyncedState);

      if (skipEntireSync) {
        console.log('✨ Delta Diff: No changes detected - skipping push entirely!');
        console.log('   💡 This saves significant time and API calls');
        return true; // Return success without doing anything
      }

      console.log('📤 RemoteTokenStorage: Building optimized file list for changed items only...');

      // Convert only the changed data into files
      const tokenSetObjects = convertTokensToObject({ ...data.tokens }, saveOptions.storeTokenIdInJsonEditor);

      // Add only changed token sets
      for (const tokenSetName of changedTokenSets) {
        if (tokenSetObjects[tokenSetName]) {
          filesToPush.push({
            type: 'tokenSet',
            name: tokenSetName,
            path: `${tokenSetName}.json`,
            data: tokenSetObjects[tokenSetName],
          });
          console.log(`   📝 Adding changed token set: ${tokenSetName}`);
        }
      }

      // Add themes if changed
      if (themesChanged) {
        filesToPush.push({
          type: 'themes',
          path: `${SystemFilenames.THEMES}.json`,
          data: data.themes,
        });
        console.log('   📝 Adding changed themes');
      }

      // Add metadata if changed (and exists)
      if (metadataChanged && data.metadata) {
        filesToPush.push({
          type: 'metadata',
          path: `${SystemFilenames.METADATA}.json`,
          data: data.metadata,
        });
        console.log('   📝 Adding metadata');
      }

      console.log(`🎯 Delta Diff: Optimized push - ${filesToPush.length} files instead of potentially many more`);
    } else {
      console.log('📤 RemoteTokenStorage: Delta diff disabled, converting all files...');

      // Original behavior - convert all data into files
      const tokenSetObjects = convertTokensToObject({ ...data.tokens }, saveOptions.storeTokenIdInJsonEditor);
      Object.entries(tokenSetObjects).forEach(([name, tokenSet]) => {
        filesToPush.push({
          type: 'tokenSet',
          name,
          path: `${name}.json`,
          data: tokenSet,
        });
      });

      // we will also include a separate file for the themes called $themes
      filesToPush.push({
        type: 'themes',
        path: `${SystemFilenames.THEMES}.json`,
        data: data.themes,
      });

      if ('metadata' in data && data.metadata) {
        filesToPush.push({
          type: 'metadata',
          path: `${SystemFilenames.METADATA}.json`,
          data: data.metadata,
        });
      }
    }

    console.log(`📋 RemoteTokenStorage: Proceeding with write of ${filesToPush.length} files...`);
    return this.write(filesToPush, saveOptions);
  }

  public async retrieve(): Promise<RemoteResponseData<Metadata> | null> {
    const data: RemoteTokenStorageData<Metadata> = {
      themes: [],
      tokens: {},
    };

    // start by reading the files from the remote source
    // it is up to the remote storage implementation to split it up into "File" objects
    const files = await this.read();
    // successfully fetch data
    if (Array.isArray(files)) {
      if (files.length === 0) {
        return null;
      }
      files.forEach((file) => {
        if (file.type === 'themes') {
          data.themes = [...data.themes, ...file.data];
        } else if (file.type === 'tokenSet') {
          data.tokens = {
            ...data.tokens,
            ...parseTokenValues({ [file.name]: file.data }),
          };
        } else if (file.type === 'metadata') {
          data.metadata = {
            ...data.metadata,
            ...file.data,
          };
        }
      });
      return {
        status: 'success',
        ...data,
      };
    }
    return {
      status: 'failure',
      ...files,
    };
  }
}
