import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { joinPath } from '@/utils/string';
import {
  RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenStorageMetadata, RemoteTokenStorageSingleTokenSetFile,
} from './RemoteTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { tryParseJson } from '@/utils/tryParseJson';
import { LastSyncedState } from '@/utils/compareLastSyncedState';

type StorageFlags = {
  multiFileEnabled: boolean
};

export type GitStorageSaveOptions = {
  commitMessage?: string,
};

export type GitStorageSaveOption = {
  commitMessage?: string,
  storeTokenIdInJsonEditor: boolean,
  lastSyncedState?: string
};

export type GitSingleFileObject = Record<string, (
  Record<string, SingleToken<false> | DeepTokensMap<false>>
)> & {
  $themes?: ThemeObjectsList
  $metadata?: RemoteTokenStorageMetadata
};

export type GitMultiFileObject = AnyTokenSet<false> | ThemeObjectsList | RemoteTokenStorageMetadata;

export abstract class GitTokenStorage extends RemoteTokenStorage<GitStorageSaveOptions, GitStorageSaveOption> {
  protected secret: string;

  protected owner: string;

  protected repository: string;

  protected branch: string = 'main';

  protected path: string = '';

  protected baseUrl: string | undefined = undefined;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  protected username: string | undefined = undefined;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl?: string,
    username?: string,
  ) {
    super();
    this.secret = secret;
    this.owner = owner;
    this.repository = repository;
    this.baseUrl = baseUrl;
    this.username = username;
  }

  public selectBranch(branch: string) {
    this.branch = branch;
    return this;
  }

  public changePath(path: string) {
    this.path = joinPath(path);
    return this;
  }

  public enableMultiFile() {
    this.flags.multiFileEnabled = true;
    return this;
  }

  public disableMultiFile() {
    this.flags.multiFileEnabled = false;
    return this;
  }

  public abstract fetchBranches(): Promise<string[]>;
  public abstract createBranch(branch: string, source?: string): Promise<boolean>;
  public abstract canWrite(): Promise<boolean>;
  public abstract writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch?: boolean,
    lastSyncedState?: string
  ): Promise<boolean>;

  /**
   * Generate a filtered changeset by comparing current files with lastSyncedState
   * @param files Current files to be saved
   * @param lastSyncedState JSON string of the last synced state
   * @returns Filtered changeset containing only changed files
   */
  protected generateFilteredChangesetFromLastSyncedState(
    files: RemoteTokenStorageFile[],
    lastSyncedState: string,
  ): Record<string, string> | null {
    try {
      const parsedLastSyncedState = tryParseJson<LastSyncedState>(lastSyncedState);
      if (!parsedLastSyncedState) {
        console.log('🔍 Unable to parse lastSyncedState, falling back to full changeset');
        return null;
      }

      const [lastTokens, lastThemes] = parsedLastSyncedState;
      const filteredChangeset: Record<string, string> = {};

      console.log('🔍 GitHub Sync Optimization: Comparing with lastSyncedState...');

      if (this.path.endsWith('.json')) {
        // Single file mode - compare entire file content
        const currentFileContent = JSON.stringify({
          ...files.reduce<GitSingleFileObject>((acc, file) => {
            if (file.type === 'tokenSet') {
              acc[file.name] = file.data;
            } else if (file.type === 'themes') {
              acc.$themes = [...acc.$themes ?? [], ...file.data];
            } else if (file.type === 'metadata') {
              acc.$metadata = { ...acc.$metadata ?? {}, ...file.data };
            }
            return acc;
          }, {}),
        }, null, 2);

        // For single file mode, we need to reconstruct what the last synced file would look like
        const lastSyncedFileContent = JSON.stringify({
          ...lastTokens,
          ...(lastThemes ? { $themes: lastThemes } : {}),
        }, null, 2);

        if (currentFileContent.trim() !== lastSyncedFileContent.trim()) {
          filteredChangeset[this.path] = currentFileContent;
          console.log(`  🔄 MODIFIED: ${this.path} (single file mode)`);
        } else {
          console.log(`  ✅ UNCHANGED: ${this.path} (single file mode)`);
        }
      } else if (this.flags.multiFileEnabled) {
        // Multi-file mode - compare individual files
        files.forEach((file) => {
          let hasChanged = false;
          let filePath = '';
          let currentContent = '';

          if (file.type === 'tokenSet') {
            filePath = joinPath(this.path, `${file.name}.json`);
            currentContent = JSON.stringify(file.data, null, 2);

            // Compare with last synced token set
            const lastTokenSet = lastTokens[file.name];
            if (!lastTokenSet) {
              // New token set
              hasChanged = true;
              console.log(`  ✨ NEW: ${filePath} (new token set)`);
            } else {
              const lastContent = JSON.stringify(lastTokenSet, null, 2);
              if (currentContent.trim() !== lastContent.trim()) {
                hasChanged = true;
                console.log(`  🔄 MODIFIED: ${filePath} (token set changed)`);
              } else {
                console.log(`  ✅ UNCHANGED: ${filePath} (token set)`);
              }
            }
          } else if (file.type === 'themes') {
            filePath = joinPath(this.path, `${SystemFilenames.THEMES}.json`);
            currentContent = JSON.stringify(file.data, null, 2);

            // Compare with last synced themes
            const lastThemesContent = JSON.stringify(lastThemes || [], null, 2);
            if (currentContent.trim() !== lastThemesContent.trim()) {
              hasChanged = true;
              console.log(`  🔄 MODIFIED: ${filePath} (themes changed)`);
            } else {
              console.log(`  ✅ UNCHANGED: ${filePath} (themes)`);
            }
          } else if (file.type === 'metadata') {
            filePath = joinPath(this.path, `${SystemFilenames.METADATA}.json`);
            currentContent = JSON.stringify(file.data, null, 2);

            // For metadata, we always include it if it exists since it's not part of lastSyncedState
            // This is a conservative approach to ensure metadata is always up to date
            hasChanged = true;
            console.log(`  🔄 MODIFIED: ${filePath} (metadata - always updated)`);
          }

          if (hasChanged && filePath && currentContent) {
            filteredChangeset[filePath] = currentContent;
          }
        });

        // Check for deleted token sets (exist in lastSyncedState but not in current files)
        const tokenSetFiles = files.filter((file): file is RemoteTokenStorageSingleTokenSetFile => file.type === 'tokenSet');
        const currentTokenSetNames = tokenSetFiles.map((file) => file.name);

        Object.keys(lastTokens).forEach((tokenSetName) => {
          if (!currentTokenSetNames.includes(tokenSetName)) {
            console.log(`  🗑️ DELETED: ${tokenSetName} (token set removed)`);
            // Note: Actual file deletion will be handled by the writeChangeset implementation
          }
        });
      }

      const changedFilesCount = Object.keys(filteredChangeset).length;
      const totalFilesCount = files.length;

      console.log('📊 LastSyncedState Comparison Results:');
      console.log(`  • Total files: ${totalFilesCount}`);
      console.log(`  • Files with changes: ${changedFilesCount}`);
      console.log(`  • Files unchanged: ${totalFilesCount - changedFilesCount}`);

      if (changedFilesCount === 0) {
        console.log('✅ No files have changed based on lastSyncedState comparison');
      } else {
        console.log('🚀 Filtered changeset based on lastSyncedState:');
        Object.keys(filteredChangeset).forEach((filePath) => {
          console.log(`  📄 ${filePath}`);
        });
      }

      return filteredChangeset;
    } catch (error) {
      console.warn('🔍 Error comparing with lastSyncedState, falling back to full changeset:', error);
      return null;
    }
  }

  public async write(files: RemoteTokenStorageFile[], saveOptions: GitStorageSaveOption): Promise<boolean> {
    const branches = await this.fetchBranches();
    if (!branches.length) return false;

    const filesChangeset: Record<string, string> = {};
    if (this.path.endsWith('.json')) {
      filesChangeset[this.path] = JSON.stringify({
        ...files.reduce<GitSingleFileObject>((acc, file) => {
          if (file.type === 'tokenSet') {
            acc[file.name] = file.data;
          } else if (file.type === 'themes') {
            acc.$themes = [...acc.$themes ?? [], ...file.data];
          } else if (file.type === 'metadata') {
            acc.$metadata = { ...acc.$metadata ?? {}, ...file.data };
          }
          return acc;
        }, {}),
      }, null, 2);
    } else if (this.flags.multiFileEnabled) {
      files.forEach((file) => {
        if (file.type === 'tokenSet') {
          filesChangeset[joinPath(this.path, `${file.name}.json`)] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'themes') {
          filesChangeset[joinPath(this.path, `${SystemFilenames.THEMES}.json`)] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'metadata') {
          filesChangeset[joinPath(this.path, `${SystemFilenames.METADATA}.json`)] = JSON.stringify(file.data, null, 2);
        }
      });
    } else {
      // When path is a directory and multiFile is disabled return
      throw new Error(ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR);
    }
    return this.writeChangeset(
      filesChangeset,
      saveOptions.commitMessage ?? 'Commit from Figma',
      this.branch,
      !branches.includes(this.branch),
      saveOptions.lastSyncedState,
    );
  }
}
