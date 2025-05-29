import compact from 'just-compact';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import type { AnyTokenList, SingleToken } from '@/types/tokens';
import convertTokensToObject from '@/utils/convertTokensToObject';
import parseTokenValues from '@/utils/parseTokenValues';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';

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
  SaveOptions extends RemoteStorageSaveOptions = { storeTokenIdInJsonEditor: boolean; useDeltaDiff?: boolean; lastSyncedState?: string },
> {
  public abstract write(files: RemoteTokenStorageFile<Metadata>[], saveOptions?: SaveOptions): Promise<boolean>;
  public abstract read(): Promise<RemoteTokenStorageFile<Metadata>[] | RemoteTokenstorageErrorMessage>;

  /**
   * Compares current raw tokens/themes data with lastSyncedState using same logic as remoteTokens.tsx
   * This happens BEFORE converting to files, avoiding format mismatch issues
   */
  protected checkIfDataChanged(data: RemoteTokenStorageData<Metadata>, lastSyncedState?: string): boolean {
    if (!lastSyncedState) {
      console.log('🔄 Delta Diff: No lastSyncedState available, treating as changed');
      return true; // No lastSyncedState means we should push (normal behavior)
    }

    console.log('🧠 Delta Diff: Comparing raw tokens/themes with lastSyncedState...');

    try {
      // Create current state string using EXACT same format as remoteTokens.tsx
      // This uses the raw tokens/themes data before any transformation
      const currentStateString = JSON.stringify(
        compact([data.tokens, data.themes, TokenFormat.format]),
        null,
        2,
      );

      console.log(`📊 Delta Diff: Current state string length: ${currentStateString.length}`);
      console.log(`📊 Delta Diff: Last synced state length: ${lastSyncedState.length}`);

      // Simple string comparison
      const statesMatch = currentStateString === lastSyncedState;
      console.log(`🔍 Delta Diff: States match: ${statesMatch}`);

      if (statesMatch) {
        console.log('✅ Delta Diff: No changes detected in raw data - skipping push entirely!');
        return false; // No changes
      }

      console.log('📝 Delta Diff: Changes detected in raw data, proceeding with push...');
      return true; // Changes detected
    } catch (error) {
      console.warn('❌ Delta Diff: Comparison failed, treating as changed:', error);
      return true; // Fallback to pushing when comparison fails
    }
  }

  public async save(data: RemoteTokenStorageData<Metadata>, saveOptions: SaveOptions): Promise<boolean> {
    console.log('💾 RemoteTokenStorage: Starting save operation...');
    console.log(`   🔧 Delta diff enabled: ${!!saveOptions.useDeltaDiff}`);
    console.log(`   🧠 lastSyncedState available: ${!!saveOptions.lastSyncedState}`);

    // Check if delta diff is enabled and if data has changed
    if (saveOptions.useDeltaDiff) {
      const hasChanges = this.checkIfDataChanged(data, saveOptions.lastSyncedState);

      if (!hasChanges) {
        console.log('✨ Delta Diff: No changes detected - skipping push entirely!');
        console.log('   💡 This saves significant time and API calls');
        return true; // Return success without doing anything
      }
    }

    console.log('📤 RemoteTokenStorage: Proceeding with file conversion and push...');

    const files: RemoteTokenStorageFile<Metadata>[] = [];
    // First we'll convert the incoming data into files
    // in this generic implementation we will ignore whether multi file is enabled or not (ie for Github)
    // how these "files" are written is up to the read and write implementation
    const tokenSetObjects = convertTokensToObject({ ...data.tokens }, saveOptions.storeTokenIdInJsonEditor);
    Object.entries(tokenSetObjects).forEach(([name, tokenSet]) => {
      files.push({
        type: 'tokenSet',
        name,
        path: `${name}.json`,
        data: tokenSet,
      });
    });

    // we will also include a separate file for the themes called $themes
    files.push({
      type: 'themes',
      path: `${SystemFilenames.THEMES}.json`,
      data: data.themes,
    });

    if ('metadata' in data && data.metadata) {
      files.push({
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: data.metadata,
      });
    }

    console.log(`📋 RemoteTokenStorage: Converted to ${files.length} files, proceeding with write...`);
    return this.write(files, saveOptions);
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
