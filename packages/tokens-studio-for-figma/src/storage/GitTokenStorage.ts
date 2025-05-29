import compact from 'just-compact';
import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { joinPath } from '@/utils/string';
import { isEqual } from '@/utils/isEqual';
import { TokenFormat } from '@/plugin/TokenFormatStoreClass';
import { RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';

type StorageFlags = {
  multiFileEnabled: boolean
};

export type GitStorageSaveOptions = {
  commitMessage?: string,
};

export type GitStorageSaveOption = {
  commitMessage?: string,
  storeTokenIdInJsonEditor: boolean,
  useDeltaDiff?: boolean,
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
    shouldCreateBranch?: boolean
  ): Promise<boolean>;

  /**
   * Compares local files with last synced state to determine which files need updating
   * This avoids the need to fetch remote files on every push, saving API calls and time
   */
  protected async getChangedFiles(localFiles: RemoteTokenStorageFile[], lastSyncedState?: string): Promise<{
    changedFiles: Record<string, string>;
    filesToDelete: string[];
  }> {
    console.log('🔍 Delta Diff: Starting file comparison...');
    console.log(`📁 Local files to process: ${localFiles.length}`);

    try {
      // If we have lastSyncedState, use it instead of fetching remote files
      if (lastSyncedState) {
        console.log('⚡ Delta Diff: Using lastSyncedState for comparison (fastest path)');
        const result = this.getChangedFilesFromSyncedState(localFiles, lastSyncedState);
        console.log('✅ Delta Diff: lastSyncedState comparison complete');
        return result;
      }

      // Fallback to fetching remote files if no lastSyncedState available
      console.log('🌐 Delta Diff: No lastSyncedState available, fetching remote files (slower fallback)');
      const remoteFiles = await this.read();

      if (Array.isArray(remoteFiles) && remoteFiles.length > 0) {
        console.log(`📥 Delta Diff: Fetched ${remoteFiles.length} remote files for comparison`);
        const changedFiles: Record<string, string> = {};
        const filesToDelete: string[] = [];

        // Create a map of remote files for easy lookup
        const remoteFileMap = new Map<string, RemoteTokenStorageFile>();
        remoteFiles.forEach((file) => {
          if (file.type === 'tokenSet') {
            remoteFileMap.set(file.name, file);
          } else if (file.type === 'themes') {
            remoteFileMap.set(SystemFilenames.THEMES, file);
          } else if (file.type === 'metadata') {
            remoteFileMap.set(SystemFilenames.METADATA, file);
          }
        });

        // Check each local file against remote
        localFiles.forEach((localFile) => {
          let key: string;
          let localPath: string;

          if (localFile.type === 'tokenSet') {
            key = localFile.name;
            localPath = this.path.endsWith('.json') ? this.path : joinPath(this.path, `${localFile.name}.json`);
          } else if (localFile.type === 'themes') {
            key = SystemFilenames.THEMES;
            localPath = this.path.endsWith('.json') ? this.path : joinPath(this.path, `${SystemFilenames.THEMES}.json`);
          } else if (localFile.type === 'metadata') {
            key = SystemFilenames.METADATA;
            localPath = this.path.endsWith('.json') ? this.path : joinPath(this.path, `${SystemFilenames.METADATA}.json`);
          } else {
            return; // Skip unknown file types
          }

          const remoteFile = remoteFileMap.get(key);

          // If remote file doesn't exist or content is different, mark as changed
          if (!remoteFile || !isEqual(localFile.data, remoteFile.data)) {
            const reason = !remoteFile ? 'new file' : 'content changed';
            console.log(`📝 Delta Diff: File changed - ${key} (${reason})`);
            changedFiles[localPath] = JSON.stringify(localFile.data, null, 2);
          } else {
            console.log(`✅ Delta Diff: File unchanged - ${key}`);
          }

          // Remove from remote map to track deletions
          remoteFileMap.delete(key);
        });

        // Files remaining in remoteFileMap should be deleted
        if (this.flags.multiFileEnabled && !this.path.endsWith('.json')) {
          remoteFileMap.forEach((remoteFile, key) => {
            if (remoteFile.type === 'tokenSet') {
              filesToDelete.push(joinPath(this.path, `${key}.json`));
            } else if (remoteFile.type === 'themes') {
              filesToDelete.push(joinPath(this.path, `${SystemFilenames.THEMES}.json`));
            } else if (remoteFile.type === 'metadata') {
              filesToDelete.push(joinPath(this.path, `${SystemFilenames.METADATA}.json`));
            }
          });
        }

        console.log(`📊 Delta Diff: Remote comparison complete - ${Object.keys(changedFiles).length} changed, ${filesToDelete.length} to delete`);
        return { changedFiles, filesToDelete };
      }
      console.log('📂 Delta Diff: No remote files found, treating all local files as new');
    } catch (error) {
      console.warn('❌ Delta Diff: Failed to compare with remote/synced state, falling back to full sync:', error);
    }

    // Fallback: if we can't compare, return all local files as changed
    console.log('🔄 Delta Diff: Using fallback - all files marked as changed');
    return this.getFallbackChangedFiles(localFiles);
  }

  /**
   * Simple comparison using the exact same logic as remoteTokens.tsx
   * Creates current state string in same format as lastSyncedState and compares
   */
  protected getChangedFilesFromSyncedState(localFiles: RemoteTokenStorageFile[], lastSyncedState: string): {
    changedFiles: Record<string, string>;
    filesToDelete: string[];
  } {
    console.log('🧠 Delta Diff: Comparing with lastSyncedState using same logic as remoteTokens.tsx...');
    
    try {
      // Build current state using EXACT same logic as remoteTokens.tsx lines 161-165
      const currentTokens: Record<string, any> = {};
      let currentThemes: any = [];
      
      // Extract tokens and themes from local files
      localFiles.forEach((file) => {
        if (file.type === 'tokenSet') {
          currentTokens[file.name] = file.data;
        } else if (file.type === 'themes') {
          currentThemes = file.data;
        }
      });
      
      // Create current state string using EXACT same format as remoteTokens.tsx
      const currentStateString = JSON.stringify(
        compact([currentTokens, currentThemes, TokenFormat.format]),
        null,
        2,
      );
      
      console.log(`📊 Delta Diff: Current state string length: ${currentStateString.length}`);
      console.log(`📊 Delta Diff: Last synced state length: ${lastSyncedState.length}`);
      
      // Simple string comparison
      const statesMatch = currentStateString === lastSyncedState;
      console.log(`🔍 Delta Diff: States match: ${statesMatch}`);
      
      const changedFiles: Record<string, string> = {};
      const filesToDelete: string[] = [];
      
      // If states don't match, we need to push all files
      if (!statesMatch) {
        console.log('📝 Delta Diff: Changes detected, marking all files for push...');
        
        localFiles.forEach((file) => {
          let filePath: string;
          
          if (this.path.endsWith('.json')) {
            // Single file mode - combine all data into one file
            if (Object.keys(changedFiles).length === 0) {
              const singleFileData: GitSingleFileObject = {};
              
              localFiles.forEach((localFile) => {
                if (localFile.type === 'tokenSet') {
                  singleFileData[localFile.name] = localFile.data;
                } else if (localFile.type === 'themes') {
                  singleFileData.$themes = localFile.data;
                } else if (localFile.type === 'metadata') {
                  singleFileData.$metadata = localFile.data;
                }
              });
              
              changedFiles[this.path] = JSON.stringify(singleFileData, null, 2);
              console.log(`📄 Delta Diff: Single file marked for push: ${this.path}`);
            }
            return;
          }
          
          // Multi-file mode
          if (file.type === 'tokenSet') {
            filePath = joinPath(this.path, `${file.name}.json`);
          } else if (file.type === 'themes') {
            filePath = joinPath(this.path, `${SystemFilenames.THEMES}.json`);
          } else if (file.type === 'metadata') {
            filePath = joinPath(this.path, `${SystemFilenames.METADATA}.json`);
          } else {
            return;
          }
          
          changedFiles[filePath] = JSON.stringify(file.data, null, 2);
          console.log(`📁 Delta Diff: File marked for push: ${filePath}`);
        });
      } else {
        console.log(`✅ Delta Diff: No changes detected - skipping push entirely!`);
      }

      console.log(`📊 Delta Diff: Comparison complete - ${Object.keys(changedFiles).length} files to push, ${filesToDelete.length} to delete`);
      return { changedFiles, filesToDelete };
      
    } catch (error) {
      console.warn('❌ Delta Diff: String comparison failed, falling back to full sync:', error);
      return this.getFallbackChangedFiles(localFiles);
    }
  }

  /**
   * Fallback method that returns all local files as changed
   */
  protected getFallbackChangedFiles(localFiles: RemoteTokenStorageFile[]): {
    changedFiles: Record<string, string>;
    filesToDelete: string[];
  } {
    console.log('🔄 Delta Diff: Using fallback method - marking all files as changed');
    const fallbackChangedFiles: Record<string, string> = {};
    
    localFiles.forEach((file) => {
      let filePath: string;
      
      if (this.path.endsWith('.json')) {
        // Single file mode - combine all data into one file
        if (Object.keys(fallbackChangedFiles).length === 0) {
          const singleFileData: GitSingleFileObject = {};
          
          localFiles.forEach((localFile) => {
            if (localFile.type === 'tokenSet') {
              singleFileData[localFile.name] = localFile.data;
            } else if (localFile.type === 'themes') {
              singleFileData.$themes = localFile.data;
            } else if (localFile.type === 'metadata') {
              singleFileData.$metadata = localFile.data;
            }
          });
          
          fallbackChangedFiles[this.path] = JSON.stringify(singleFileData, null, 2);
          console.log(`📄 Delta Diff: Fallback single file: ${this.path}`);
        }
        return;
      }
      
      // Multi-file mode
      if (file.type === 'tokenSet') {
        filePath = joinPath(this.path, `${file.name}.json`);
      } else if (file.type === 'themes') {
        filePath = joinPath(this.path, `${SystemFilenames.THEMES}.json`);
      } else if (file.type === 'metadata') {
        filePath = joinPath(this.path, `${SystemFilenames.METADATA}.json`);
      } else {
        return;
      }
      
      fallbackChangedFiles[filePath] = JSON.stringify(file.data, null, 2);
      console.log(`📁 Delta Diff: Fallback file: ${filePath}`);
    });

    console.log(`📊 Delta Diff: Fallback complete - ${Object.keys(fallbackChangedFiles).length} files marked as changed`);
    return { changedFiles: fallbackChangedFiles, filesToDelete: [] };
  }

  /**
   * Enhanced writeChangeset that only pushes changed files
   * This method should be implemented by subclasses to provide delta diff functionality
   */
  public async writeChangesetWithDiff(
    files: RemoteTokenStorageFile[], 
    message: string, 
    branch: string, 
    shouldCreateBranch?: boolean, 
    lastSyncedState?: string
  ): Promise<boolean> {
    console.log('🚀 Delta Diff: Starting optimized sync process...');
    console.log(`📋 Input: ${files.length} files, branch: ${branch}, message: "${message}"`);
    
    try {
      const { changedFiles, filesToDelete } = await this.getChangedFiles(files, lastSyncedState);
      
      // If no files changed, skip the push
      if (Object.keys(changedFiles).length === 0 && filesToDelete.length === 0) {
        console.log('✨ Delta Diff: No changes detected - skipping push entirely!');
        console.log('   💡 This saves significant time and API calls');
        return true;
      }

      console.log('🎯 Delta Diff: Changes detected, proceeding with optimized push...');
      console.log(`   📝 Files to push: ${Object.keys(changedFiles).length}`);
      console.log(`   🗑️ Files to delete: ${filesToDelete.length}`);
      console.log(`   💡 Skipped files: ${files.length - Object.keys(changedFiles).length - filesToDelete.length}`);
      
      if (Object.keys(changedFiles).length > 0) {
        console.log(`   📋 Push list: ${Object.keys(changedFiles).join(', ')}`);
      }
      if (filesToDelete.length > 0) {
        console.log(`   🗑️ Delete list: ${filesToDelete.join(', ')}`);
      }
      
      // Use the regular writeChangeset method - subclasses can override this behavior
      const result = await this.writeChangeset(changedFiles, message, branch, shouldCreateBranch);
      
      if (result) {
        console.log('✅ Delta Diff: Optimized push completed successfully!');
        const totalFiles = files.length;
        const pushedFiles = Object.keys(changedFiles).length + filesToDelete.length;
        const skippedFiles = totalFiles - Object.keys(changedFiles).length;
        const efficiency = totalFiles > 0 ? Math.round((skippedFiles / totalFiles) * 100) : 0;
        console.log(`   📊 Efficiency: ${efficiency}% of files skipped (${skippedFiles}/${totalFiles})`);
      } else {
        console.log('❌ Delta Diff: Push failed');
      }
      
      return result;
    } catch (error) {
      console.warn('❌ Delta Diff: Optimization failed, falling back to traditional sync:', error);
      console.log('🔄 Delta Diff: Attempting full file sync as fallback...');
      
      // Fallback to traditional writeChangeset behavior
      const filesChangeset: Record<string, string> = {};
      
      if (this.path.endsWith('.json')) {
        // Single file mode
        const singleFileData: GitSingleFileObject = {};
        
        files.forEach((file) => {
          if (file.type === 'tokenSet') {
            singleFileData[file.name] = file.data;
          } else if (file.type === 'themes') {
            singleFileData.$themes = [...(singleFileData.$themes ?? []), ...file.data];
          } else if (file.type === 'metadata') {
            singleFileData.$metadata = { ...(singleFileData.$metadata ?? {}), ...file.data };
          }
        });
        
        filesChangeset[this.path] = JSON.stringify(singleFileData, null, 2);
        console.log(`📄 Delta Diff: Fallback single file: ${this.path}`);
      } else if (this.flags.multiFileEnabled) {
        // Multi-file mode
        files.forEach((file) => {
          if (file.type === 'tokenSet') {
            filesChangeset[joinPath(this.path, `${file.name}.json`)] = JSON.stringify(file.data, null, 2);
          } else if (file.type === 'themes') {
            filesChangeset[joinPath(this.path, `${SystemFilenames.THEMES}.json`)] = JSON.stringify(file.data, null, 2);
          } else if (file.type === 'metadata') {
            filesChangeset[joinPath(this.path, `${SystemFilenames.METADATA}.json`)] = JSON.stringify(file.data, null, 2);
          }
        });
        console.log(`📁 Delta Diff: Fallback multi-files: ${Object.keys(filesChangeset).join(', ')}`);
      }
      
      console.log(`🔄 Delta Diff: Fallback pushing ${Object.keys(filesChangeset).length} files (traditional method)`);
      const result = await this.writeChangeset(filesChangeset, message, branch, shouldCreateBranch);
      
      if (result) {
        console.log('✅ Delta Diff: Fallback sync completed successfully');
      } else {
        console.log('❌ Delta Diff: Fallback sync also failed');
      }
      
      return result;
    }
  }

  public async write(files: RemoteTokenStorageFile[], saveOptions: GitStorageSaveOption): Promise<boolean> {
    const branches = await this.fetchBranches();
    if (!branches.length) return false;

    console.log('📦 GitTokenStorage: Starting write operation...');
    console.log(`   🔧 Delta diff enabled: ${!!saveOptions.useDeltaDiff}`);
    console.log(`   🧠 lastSyncedState available: ${!!saveOptions.lastSyncedState}`);
    console.log(`   📁 Multi-file enabled: ${this.flags.multiFileEnabled}`);
    console.log(`   📄 Path: ${this.path}`);
    console.log(`   🌿 Branch: ${this.branch}`);

    // Check if delta diff is enabled
    if (saveOptions.useDeltaDiff) {
      console.log('⚡ GitTokenStorage: Using delta diff mode for optimized sync');
      return this.writeChangesetWithDiff(
        files,
        saveOptions.commitMessage ?? 'Commit from Figma',
        this.branch,
        !branches.includes(this.branch),
        saveOptions.lastSyncedState,
      );
    }

    // Fallback to traditional full sync
    console.log('🔄 GitTokenStorage: Using traditional full sync mode');
    const filesChangeset: Record<string, string> = {};
    if (this.path.endsWith('.json')) {
      console.log('📄 GitTokenStorage: Single file mode');
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
      console.log('📁 GitTokenStorage: Multi-file mode');
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
      console.log('❌ GitTokenStorage: Multi-file disabled but path is directory - this will fail');
      throw new Error(ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR);
    }
    
    console.log(`📤 GitTokenStorage: Traditional sync pushing ${Object.keys(filesChangeset).length} files`);
    console.log(`   📋 Files: ${Object.keys(filesChangeset).join(', ')}`);
    
    return this.writeChangeset(
      filesChangeset,
      saveOptions.commitMessage ?? 'Commit from Figma',
      this.branch,
      !branches.includes(this.branch),
    );
  }
}
