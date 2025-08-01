import { RemoteTokenStorageFile, RemoteTokenStorageData } from './RemoteTokenStorage';
import { GitStorageSaveOptions, GitStorageSaveOption } from './GitTokenStorage';
import { SystemFilenames } from '@/constants/SystemFilenames';
import convertTokensToObject from '@/utils/convertTokensToObject';

export type OptimizedSyncResult = {
  filteredFiles: RemoteTokenStorageFile<GitStorageSaveOptions>[];
  filesToDelete: string[];
  hasChanges: boolean;
};

export type ChangedState = {
  tokens: Record<string, any[]>;
  themes: any[];
  metadata: any;
};

/**
 * Shared Git sync optimization utility that filters files based on changed state
 * and detects files that need to be deleted. Can be used by any Git-based storage provider.
 */
export class GitSyncOptimizer {
  /**
   * Analyzes the changed state and returns optimized file operations
   * @param data Current token data to save
   * @param saveOptions Save options including commit message
   * @param changedState Object containing information about what has changed
   * @returns Optimized sync result with filtered files and deletions
   */
  public static optimizeSync(
    data: RemoteTokenStorageData<GitStorageSaveOptions>,
    saveOptions: GitStorageSaveOption,
    changedState: ChangedState,
  ): OptimizedSyncResult {
    // Convert data to files and filter based on changedState in a single pass
    const filteredFiles: RemoteTokenStorageFile<GitStorageSaveOptions>[] = [];
    const filesToDelete: string[] = [];

    // Convert tokens to files and filter based on changes
    const tokenSetObjects = convertTokensToObject({ ...data.tokens }, saveOptions.storeTokenIdInJsonEditor);
    Object.entries(tokenSetObjects).forEach(([name, tokenSet]) => {
      const hasChanges = changedState.tokens[name];
      if (hasChanges && hasChanges.length > 0) {
        filteredFiles.push({
          type: 'tokenSet',
          name,
          path: `${name}.json`,
          data: tokenSet,
        });
      }
    });

    // Add themes file if there are theme changes
    if (changedState.themes.length > 0) {
      filteredFiles.push({
        type: 'themes',
        path: `${SystemFilenames.THEMES}.json`,
        data: data.themes,
      });
    }

    // Add metadata file if present and has changes
    if ('metadata' in data && data.metadata && changedState.metadata) {
      filteredFiles.push({
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: data.metadata,
      });
    }

    // Check for deleted token sets by looking for REMOVE importType in changedState
    Object.entries(changedState.tokens).forEach(([tokenSetName, changes]) => {
      const hasRemovedTokens = changes.some((change: any) => change.importType === 'REMOVE');
      if (hasRemovedTokens) {
        const existsInCurrentData = tokenSetName in data.tokens;
        if (!existsInCurrentData) {
          const filePath = `${tokenSetName}.json`;
          filesToDelete.push(filePath);
        }
      }
    });

    // Check for removed themes
    const hasRemovedThemes = changedState.themes.some((theme: any) => theme.importType === 'REMOVE');
    if (hasRemovedThemes) {
      // Themes file should already be included above if there are changes
    }

    const hasChanges = filteredFiles.length > 0 || filesToDelete.length > 0;

    return {
      filteredFiles,
      filesToDelete,
      hasChanges,
    };
  }

  /**
   * Creates a changeset for multi-file Git operations
   * @param files Files to include in the changeset
   * @param basePath Base path for the repository
   * @returns Record of file paths to file contents
   */
  public static createMultiFileChangeset(
    files: RemoteTokenStorageFile<GitStorageSaveOptions>[],
    basePath: string,
  ): Record<string, string> {
    const filesChangeset: Record<string, string> = {};

    files.forEach((file) => {
      if (file.type === 'tokenSet') {
        filesChangeset[`${basePath}/${file.name}.json`] = JSON.stringify(file.data, null, 2);
      } else if (file.type === 'themes') {
        filesChangeset[`${basePath}/${SystemFilenames.THEMES}.json`] = JSON.stringify(file.data, null, 2);
      } else if (file.type === 'metadata') {
        filesChangeset[`${basePath}/${SystemFilenames.METADATA}.json`] = JSON.stringify(file.data, null, 2);
      }
    });

    return filesChangeset;
  }

  /**
   * Prepares file deletion paths with the base path prefix
   * @param filesToDelete Array of file names to delete
   * @param basePath Base path for the repository
   * @returns Array of full file paths to delete
   */
  public static prepareFileDeletions(filesToDelete: string[], basePath: string): string[] {
    return filesToDelete.map((fileName) => `${basePath}/${fileName}`);
  }
}
