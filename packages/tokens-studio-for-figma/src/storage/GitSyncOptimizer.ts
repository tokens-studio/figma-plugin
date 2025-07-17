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
    // First, convert data to files using the base class logic
    const files: RemoteTokenStorageFile<GitStorageSaveOptions>[] = [];

    // Convert tokens to files
    const tokenSetObjects = convertTokensToObject({ ...data.tokens }, saveOptions.storeTokenIdInJsonEditor);
    Object.entries(tokenSetObjects).forEach(([name, tokenSet]) => {
      files.push({
        type: 'tokenSet',
        name,
        path: `${name}.json`,
        data: tokenSet,
      });
    });

    // Add themes file
    files.push({
      type: 'themes',
      path: `${SystemFilenames.THEMES}.json`,
      data: data.themes,
    });

    // Add metadata file if present
    if ('metadata' in data && data.metadata) {
      files.push({
        type: 'metadata',
        path: `${SystemFilenames.METADATA}.json`,
        data: data.metadata,
      });
    }

    // Now filter the files based on changedState and detect deletions
    const filteredFiles: RemoteTokenStorageFile<GitStorageSaveOptions>[] = [];
    const filesToDelete: string[] = [];

    files.forEach((file) => {
      if (file.type === 'tokenSet') {
        const hasChanges = changedState.tokens[file.name];
        if (hasChanges && hasChanges.length > 0) {
          filteredFiles.push(file);
        }
      } else if (file.type === 'themes') {
        if (changedState.themes.length > 0) {
          filteredFiles.push(file);
        }
      } else if (file.type === 'metadata') {
        if (changedState.metadata) {
          filteredFiles.push(file);
        }
      }
    });

    // Check for deleted token sets by looking for REMOVE importType in changedState
    Object.entries(changedState.tokens).forEach(([tokenSetName, changes]) => {
      const hasRemovedTokens = changes.some((change: any) => change.importType === 'REMOVE');
      if (hasRemovedTokens) {
        // Check if the entire token set was removed (no corresponding file in current data)
        const currentFile = files.find((f) => f.type === 'tokenSet' && f.name === tokenSetName);
        if (!currentFile) {
          const filePath = `${tokenSetName}.json`;
          filesToDelete.push(filePath);
        }
      }
    });

    // Check for renamed token sets by detecting token sets that have REMOVE entries
    // but DON'T exist in current files (indicating they were the old names that got renamed)
    Object.entries(changedState.tokens).forEach(([tokenSetName, changes]) => {
      const hasRemovedTokens = changes.some((change: any) => change.importType === 'REMOVE');
      if (hasRemovedTokens) {
        // Check if this token set name does NOT exist in current files
        const currentFile = files.find((f) => f.type === 'tokenSet' && f.name === tokenSetName);
        if (!currentFile) {
          // This token set has REMOVE entries but doesn't exist in current files
          // This indicates it was the old name that got renamed to something else
          const oldFilePath = `${tokenSetName}.json`;
          filesToDelete.push(oldFilePath);
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
