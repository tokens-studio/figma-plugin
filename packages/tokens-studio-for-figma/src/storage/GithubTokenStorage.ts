import compact from 'just-compact';
import set from 'set-value';
import { Octokit } from '@octokit/rest';
import { RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import {
  GitMultiFileObject, GitSingleFileObject, GitTokenStorage,
} from './GitTokenStorage';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { joinPath } from '@/utils/string';

type ExtendedOctokitClient = Omit<Octokit, 'repos'> & {
  repos: Octokit['repos'] & {
    createOrUpdateFiles: (params: {
      owner: string
      repo: string
      branch: string
      createBranch?: boolean
      changes: {
        message: string
        files: Record<string, string>,
        filesToDelete?: string[],
        ignoreDeletionFailures?: boolean,
      }[]
    }) => ReturnType<Octokit['repos']['createOrUpdateFileContents']>
  }
};

export function getTreeMode(type: 'dir' | 'file' | string) {
  switch (type) {
    case 'dir':
      return '040000';
    default:
      return '100644';
  }
}

// @README https://github.com/octokit/octokit.js/issues/890
const octokitClientDefaultHeaders = {
  'If-None-Match': '',

};

export class GithubTokenStorage extends GitTokenStorage {
  private octokitClient: ExtendedOctokitClient;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl?: string,
  ) {
    super(secret, owner, repository, baseUrl);
    this.flags = {
      multiFileEnabled: false,
    };

    // eslint-disable-next-line
    const ExtendedOctokitConstructor = Octokit.plugin(require('octokit-commit-multiple-files'));
    this.octokitClient = new ExtendedOctokitConstructor({
      auth: this.secret,
      baseUrl: this.baseUrl || undefined,
    }) as ExtendedOctokitClient;
  }

  public async listBranches() {
    return this.octokitClient.paginate(this.octokitClient.repos.listBranches, {
      owner: this.owner,
      repo: this.repository,
      headers: octokitClientDefaultHeaders,
      per_page: 30, // Set to desired page size (max 100)
    });
  }

  public async getTreeShaForDirectory(path: string) {
    // @README this is necessary because to figure out the tree SHA we need to fetch the parent directory contents
    // however when pulling from the root directory we can  not do this, but we can take the SHA from the branch
    if (path === '') {
      const branches = await this.listBranches();
      const branch = branches?.find((entry) => entry.name === this.branch);
      if (!branch) throw new Error(`Branch not found, ${this.branch}`);
      return branch.commit.sha;
    }

    // get the parent directory content to find out the sha
    const parent = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
    const parentDirectoryTreeResponse = await this.octokitClient.rest.repos.getContent({
      owner: this.owner,
      repo: this.repository,
      path: parent,
      ref: this.branch,
      headers: octokitClientDefaultHeaders,
    });

    if (Array.isArray(parentDirectoryTreeResponse.data)) {
      const directory = parentDirectoryTreeResponse.data.find((item) => item.path === path);
      if (!directory) throw new Error(`Unable to find directory, ${path}`);
      return directory.sha;
    }

    // @README if the parent directory only contains a single subdirectory
    // it will not return an array with 1 item - but rather it will return the item itself
    if (parentDirectoryTreeResponse.data.path === path) {
      return parentDirectoryTreeResponse.data.sha;
    }

    throw new Error('Could not find directory SHA');
  }

  public async fetchBranches() {
    const branches = await this.listBranches();
    return branches?.map((branch) => branch.name);
  }

  public async createBranch(branch: string, source?: string) {
    try {
      const originRef = `heads/${source || this.branch}`;
      const newRef = `refs/heads/${branch}`;
      const originBranch = await this.octokitClient.git.getRef({
        owner: this.owner,
        repo: this.repository,
        ref: originRef,
        headers: octokitClientDefaultHeaders,
      });
      const newBranch = await this.octokitClient.git.createRef({
        owner: this.owner, repo: this.repository, ref: newRef, sha: originBranch.data.object.sha,
      });
      return !!newBranch.data.ref;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public async canWrite(): Promise<boolean> {
    if (!this.path.endsWith('.json') && !this.flags.multiFileEnabled) return false;
    const currentUser = await this.octokitClient.rest.users.getAuthenticated();
    if (!currentUser.data.login) return false;
    try {
      const canWrite = await this.octokitClient.rest.repos.getCollaboratorPermissionLevel({
        owner: this.owner,
        repo: this.repository,
        username: currentUser.data.login,
        headers: octokitClientDefaultHeaders,
      });
      return !!canWrite;
    } catch (e) {
      return false;
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      const normalizedPath = compact(this.path.split('/')).join('/');
      const response = await this.octokitClient.rest.repos.getContent({
        path: normalizedPath,
        owner: this.owner,
        repo: this.repository,
        ref: this.branch,
        headers: {
          ...octokitClientDefaultHeaders,
          // Setting this makes github return the raw file instead of a json object.
          Accept: 'application/vnd.github.raw',
        },
      });

      // read entire directory
      if (Array.isArray(response.data)) {
        const directorySha = await this.getTreeShaForDirectory(normalizedPath);
        const treeResponse = await this.octokitClient.rest.git.getTree({
          owner: this.owner,
          repo: this.repository,
          tree_sha: directorySha,
          recursive: 'true',
          headers: octokitClientDefaultHeaders,
        });
        if (treeResponse && treeResponse.data.tree.length > 0) {
          const jsonFiles = treeResponse.data.tree.filter((file) => (
            file.path?.endsWith('.json')
          )).sort((a, b) => (
            (a.path && b.path) ? a.path.localeCompare(b.path) : 0
          ));
          const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => (
            treeItem.path ? this.octokitClient.rest.repos.getContent({
              owner: this.owner,
              repo: this.repository,
              path: treeItem.path.startsWith(normalizedPath) ? treeItem.path : `${normalizedPath}/${treeItem.path}`,
              ref: this.branch,
              headers: {
                ...octokitClientDefaultHeaders,
                // Setting this makes github return the raw file instead of a json object.
                Accept: 'application/vnd.github.raw',
              },
            }) : Promise.resolve(null)
          )));
          return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
            const { path } = jsonFiles[index];
            if (
              path
              && fileContent?.data
              && !Array.isArray(fileContent?.data)
            ) {
              const filePath = path.startsWith(normalizedPath) ? path : `${normalizedPath}/${path}`;
              let name = filePath.substring(this.path.length).replace(/^\/+/, '');
              name = name.replace('.json', '');
              const parsed = JSON.parse(fileContent.data as unknown as string) as GitMultiFileObject;
              // @README we will need to ensure these reserved names

              if (name === SystemFilenames.THEMES) {
                return {
                  path: filePath,
                  type: 'themes',
                  data: parsed as ThemeObjectsList,
                };
              }

              if (name === SystemFilenames.METADATA) {
                return {
                  path: filePath,
                  type: 'metadata',
                  data: parsed as RemoteTokenStorageMetadata,
                };
              }

              return {
                path: filePath,
                name,
                type: 'tokenSet',
                data: parsed as AnyTokenSet<false>,
              };
            }
            return null;
          }));
        }
      } else if (response.data) {
        const data = response.data as unknown as string;
        if (IsJSONString(data)) {
          const parsed = JSON.parse(data) as GitSingleFileObject;
          return [
            {
              type: 'themes',
              path: `${this.path}/${SystemFilenames.THEMES}.json`,
              data: parsed.$themes ?? [],
            },
            ...(parsed.$metadata ? [
              {
                type: 'metadata' as const,
                path: this.path,
                data: parsed.$metadata,
              },
            ] : []),
            ...(Object.entries(parsed).filter(([key]) => (
              !Object.values<string>(SystemFilenames).includes(key)
            )) as [string, AnyTokenSet<false>][]).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
              name,
              type: 'tokenSet',
              path: `${this.path}/${name}.json`,
              data: tokenSet,
            })),
          ];
        }
        return {
          errorMessage: ErrorMessages.VALIDATION_ERROR,
        };
      }

      return [];
    } catch (e) {
      // Raise error (usually this is an auth error)
      console.error('Error', e);
      return [];
    }
  }

  public async createOrUpdate(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean, filesToDelete?: string[], ignoreDeletionFailures?: boolean): Promise<boolean> {
    const response = await this.octokitClient.repos.createOrUpdateFiles({
      branch,
      owner: this.owner,
      repo: this.repository,
      createBranch: shouldCreateBranch,
      changes: [
        {
          message,
          files: changeset,
          filesToDelete,
          ignoreDeletionFailures,
        },
      ],
    });
    return !!response;
  }

  /**
   * Get the current content of JSON files from the remote repository
   * @param jsonFiles Array of JSON file objects from the tree
   * @returns Map of file paths to their content
   */
  private async getRemoteFileContents(jsonFiles: Array<{ path?: string }>): Promise<Record<string, string>> {
    const remoteContents: Record<string, string> = {};

    try {
      // Fetch content for each JSON file
      const fileContents = await Promise.all(jsonFiles.map(async (file) => {
        if (!file.path) return null;

        try {
          const fileResponse = await this.octokitClient.rest.repos.getContent({
            owner: this.owner,
            repo: this.repository,
            path: joinPath(this.path, file.path),
            ref: this.branch,
            headers: {
              ...octokitClientDefaultHeaders,
              Accept: 'application/vnd.github.raw',
            },
          });

          const fullPath = joinPath(this.path, file.path);
          return {
            path: fullPath,
            content: fileResponse.data as unknown as string,
          };
        } catch (e) {
          console.warn(`Failed to fetch content for ${file.path}:`, e);
          return null;
        }
      }));

      fileContents.forEach((fileContent) => {
        if (fileContent) {
          remoteContents[fileContent.path] = fileContent.content;
        }
      });
    } catch (e) {
      console.warn('Failed to fetch remote file contents:', e);
    }

    return remoteContents;
  }

  /**
   * Convert flat array tokens to nested object format for comparison
   * @param flatTokens Array of tokens in flat format (name, value, type)
   * @returns Nested object format matching file structure
   */
  private convertFlatArrayToNestedObject(flatTokens: any[]): any {
    const nestedObj = {};

    flatTokens.forEach((token) => {
      if (token && token.name && typeof token.value !== 'undefined') {
        // Use set-value to create nested structure from dot notation
        const {
          name, value, type, description,
        } = token;

        // Create token object in current format (DTCG or Legacy)
        const tokenObj: any = {};

        // Add properties in the correct format
        if (type) {
          tokenObj.$type = type;
        }
        if (typeof value !== 'undefined') {
          tokenObj.$value = value;
        }
        if (description) {
          tokenObj.$description = description;
        }

        // Use set-value to create nested structure
        set(nestedObj, name, tokenObj);
      }
    });

    return nestedObj;
  }

  /**
   * Filter changeset using lastSyncedState comparison
   * @param changeset Local file changes
   * @param lastSyncedState JSON string of the last synced state
   * @returns Filtered changeset with only changed files, or null if comparison fails
   */
  private filterChangesetWithLastSyncedState(changeset: Record<string, string>, lastSyncedState: string): Record<string, string> | null {
    try {
      const parsedLastSyncedState = JSON.parse(lastSyncedState);
      if (!Array.isArray(parsedLastSyncedState) || parsedLastSyncedState.length < 1) {
        console.log('🔍 Invalid lastSyncedState format, falling back to full changeset');
        return null;
      }

      const [lastTokens, lastThemes] = parsedLastSyncedState;
      const filteredChangeset: Record<string, string> = {};

      console.log('🔍 LastSyncedState contains:');
      console.log(`  • Token sets: ${Object.keys(lastTokens || {}).join(', ')}`);
      console.log(`  • Themes: ${(lastThemes || []).length} themes`);

      Object.entries(changeset).forEach(([filePath, localContent]) => {
        let hasChanged = false;
        const fileName = filePath.split('/').pop()?.replace('.json', '') || '';

        console.log(`🔍 Checking file: ${filePath} (fileName: ${fileName})`);

        if (fileName === '$themes') {
          // Compare themes
          const lastThemesContent = JSON.stringify(lastThemes || [], null, 2);
          if (localContent.trim() !== lastThemesContent.trim()) {
            hasChanged = true;
            console.log(`  🔄 THEMES CHANGED: Content differs`);
            console.log(`    📏 Local: ${localContent.length} chars, Last: ${lastThemesContent.length} chars`);
          } else {
            console.log(`  ✅ THEMES UNCHANGED`);
          }
        } else if (fileName === '$metadata') {
          // Compare metadata - it should contain tokenSetOrder based on current token sets
          try {
            const localMetadata = JSON.parse(localContent);
            const expectedMetadata = {
              tokenSetOrder: Object.keys(lastTokens || {}),
            };

            if (JSON.stringify(localMetadata, null, 2) !== JSON.stringify(expectedMetadata, null, 2)) {
              hasChanged = true;
              console.log(`  🔄 METADATA CHANGED: Content differs from expected`);
              console.log(`    📏 Local: ${localContent.length} chars, Expected: ${JSON.stringify(expectedMetadata, null, 2).length} chars`);
            } else {
              console.log(`  ✅ METADATA UNCHANGED`);
            }
          } catch (e) {
            // If we can't parse metadata, update it to be safe
            hasChanged = true;
            console.log(`  🔄 METADATA: Failed to parse, updating (conservative approach)`);
          }
        } else {
          // Compare token sets
          const lastTokenSet = lastTokens[fileName];
          if (!lastTokenSet) {
            // New token set
            hasChanged = true;
            console.log(`  ✨ NEW TOKEN SET: ${fileName} (not in lastSyncedState)`);
          } else {
            // The lastSyncedState stores tokens in flat array format, but files are in nested object format
            // We need to convert the lastSyncedState format to match the file format for comparison
            let lastContentForComparison: string;

            try {
              const localJson = JSON.parse(localContent);

              // Check if local content is in nested object format (file format)
              if (typeof localJson === 'object' && !Array.isArray(localJson)) {
                // Local is in nested format, convert lastTokenSet (flat array) to nested format
                const convertedLastTokenSet = this.convertFlatArrayToNestedObject(lastTokenSet);
                lastContentForComparison = JSON.stringify(convertedLastTokenSet, null, 2);
                console.log(`    🔄 Converted lastSyncedState from flat array to nested object format for comparison`);
              } else if (Array.isArray(localJson)) {
                // Local is in flat array format, use lastTokenSet as-is
                lastContentForComparison = JSON.stringify(lastTokenSet, null, 2);
                console.log(`    � Using lastSyncedState in flat array format for comparison`);
              } else {
                // Fallback to direct comparison
                lastContentForComparison = JSON.stringify(lastTokenSet, null, 2);
                console.log(`    ⚠️ Unknown local format, using direct comparison`);
              }
            } catch (e) {
              // Fallback to direct comparison if parsing fails
              lastContentForComparison = JSON.stringify(lastTokenSet, null, 2);
              console.log(`    ⚠️ Failed to parse local content, using direct comparison`);
            }

            if (localContent.trim() !== lastContentForComparison.trim()) {
              hasChanged = true;
              console.log(`  🔄 TOKEN SET CHANGED: ${fileName}`);
              console.log(`    📏 Local: ${localContent.length} chars, Last: ${lastContentForComparison.length} chars`);

              // Show a detailed comparison for debugging
              if (localContent.length < 2000 && lastContentForComparison.length < 2000) {
                console.log(`    � Local preview: ${localContent.substring(0, 200)}${localContent.length > 200 ? '...' : ''}`);
                console.log(`    🌐 Last preview: ${lastContentForComparison.substring(0, 200)}${lastContentForComparison.length > 200 ? '...' : ''}`);
              }
            } else {
              console.log(`  ✅ TOKEN SET UNCHANGED: ${fileName}`);
            }
          }
        }

        if (hasChanged) {
          filteredChangeset[filePath] = localContent;
        }
      });

      return filteredChangeset;
    } catch (error) {
      console.warn('Failed to parse lastSyncedState for comparison:', error);
      return null;
    }
  }

  /**
   * Filter changeset to only include files that have actually changed
   * @param changeset Local file changes
   * @param remoteContents Current remote file contents
   * @returns Filtered changeset with only changed files
   */
  private filterChangedFiles(changeset: Record<string, string>, remoteContents: Record<string, string>): Record<string, string> {
    const filteredChangeset: Record<string, string> = {};

    console.log('🔍 Detailed file comparison:');
    Object.entries(changeset).forEach(([filePath, localContent]) => {
      const remoteContent = remoteContents[filePath];

      if (!remoteContent) {
        // New file
        filteredChangeset[filePath] = localContent;
        console.log(`  ✨ NEW: ${filePath} (${localContent.length} chars)`);
      } else {
        // Compare content
        const localTrimmed = localContent.trim();
        const remoteTrimmed = remoteContent.trim();

        if (localTrimmed !== remoteTrimmed) {
          filteredChangeset[filePath] = localContent;
          console.log(`  🔄 MODIFIED: ${filePath}`);
          console.log(`    📏 Local: ${localContent.length} chars, Remote: ${remoteContent.length} chars`);

          // Show a small diff preview for debugging
          if (localTrimmed.length < 200 && remoteTrimmed.length < 200) {
            console.log(`    📝 Local preview: ${localTrimmed.substring(0, 100)}${localTrimmed.length > 100 ? '...' : ''}`);
            console.log(`    🌐 Remote preview: ${remoteTrimmed.substring(0, 100)}${remoteTrimmed.length > 100 ? '...' : ''}`);
          }
        } else {
          console.log(`  ✅ UNCHANGED: ${filePath}`);
        }
      }
    });

    return filteredChangeset;
  }

  public async writeChangeset(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean, lastSyncedState?: string): Promise<boolean> {
    try {
      // Try to use lastSyncedState optimization first
      if (lastSyncedState && this.flags.multiFileEnabled && !this.path.endsWith('.json')) {
        console.log('🚀 GitHub Sync Optimization: Using lastSyncedState comparison instead of fetching from GitHub');

        // We still need to get the list of existing files for deletion detection
        const response = await this.octokitClient.rest.repos.getContent({
          owner: this.owner,
          repo: this.repository,
          path: this.path,
          ref: this.branch,
        });

        if (Array.isArray(response.data)) {
          const directoryTreeResponse = await this.octokitClient.rest.git.createTree({
            owner: this.owner,
            repo: this.repository,
            tree: response.data.map((item) => ({
              path: item.path,
              sha: item.sha,
              mode: getTreeMode(item.type),
            })),
          });

          if (directoryTreeResponse.data.tree[0]?.sha) {
            const treeResponse = await this.octokitClient.rest.git.getTree({
              owner: this.owner,
              repo: this.repository,
              tree_sha: directoryTreeResponse.data.tree[0].sha,
              recursive: 'true',
            });

            if (treeResponse.data.tree.length > 0) {
              const jsonFiles = treeResponse.data.tree.filter((file) => (
                file.path?.endsWith('.json')
              )).sort((a, b) => (
                (a.path && b.path) ? a.path.localeCompare(b.path) : 0
              ));

              // Use lastSyncedState to filter changeset instead of fetching remote content
              console.log('🔄 Comparing local changeset with lastSyncedState...');
              console.log('📝 Local changeset files:', Object.keys(changeset));

              // Parse lastSyncedState and compare with current changeset
              const filteredChangeset = this.filterChangesetWithLastSyncedState(changeset, lastSyncedState);

              if (filteredChangeset === null) {
                console.log('⚠️ Failed to use lastSyncedState optimization, falling back to remote comparison');
                // Fall through to the original implementation below
              } else {
                // Calculate files to delete
                const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => jsonFile.path && item === joinPath(this.path, jsonFile.path)))
                  .map((fileToDelete) => `${this.path.split('/')[0]}/${fileToDelete.path}`);

                // Log optimization results
                const unchangedFiles = Object.keys(changeset).filter((file) => !Object.keys(filteredChangeset).includes(file));
                const newFiles = Object.keys(filteredChangeset).filter((file) => !jsonFiles.some(jsonFile => joinPath(this.path, jsonFile.path || '') === file));
                const modifiedFiles = Object.keys(filteredChangeset).filter((file) => jsonFiles.some(jsonFile => joinPath(this.path, jsonFile.path || '') === file));

                console.log('📊 LastSyncedState Optimization Results:');
                console.log(`  • Total files in changeset: ${Object.keys(changeset).length}`);
                console.log(`  • Files with changes: ${Object.keys(filteredChangeset).length}`);
                console.log(`  • Files unchanged: ${unchangedFiles.length}`);

                if (newFiles.length > 0) {
                  console.log(`  • New files (${newFiles.length}):`, newFiles);
                }
                if (modifiedFiles.length > 0) {
                  console.log(`  • Modified files (${modifiedFiles.length}):`, modifiedFiles);
                }
                if (unchangedFiles.length > 0) {
                  console.log(`  • Unchanged files (${unchangedFiles.length}):`, unchangedFiles);
                }

                // If no files have changed, skip the commit
                if (Object.keys(filteredChangeset).length === 0) {
                  console.log('✅ No files have changed based on lastSyncedState, skipping commit');
                  return true;
                }

                if (filesToDelete.length > 0) {
                  console.log(`🗑️ Files to delete (${filesToDelete.length}):`, filesToDelete);
                }

                console.log('📤 Optimized GitHub API call using lastSyncedState:');
                console.log(`  • Files to create/update: ${Object.keys(filteredChangeset).length}`);
                console.log(`  • Files to delete: ${filesToDelete.length}`);
                console.log(`  • Commit message: "${message}"`);
                console.log(`  • Branch: ${branch}`);

                return await this.createOrUpdate(filteredChangeset, message, branch, shouldCreateBranch, filesToDelete, true);
              }
            }
          }
        }
      }

      // Original implementation (fallback or when optimization is not applicable)
      const response = await this.octokitClient.rest.repos.getContent({
        owner: this.owner,
        repo: this.repository,
        path: this.path,
        ref: this.branch,
      });

      if (Array.isArray(response.data)) {
        const directoryTreeResponse = await this.octokitClient.rest.git.createTree({
          owner: this.owner,
          repo: this.repository,
          tree: response.data.map((item) => ({
            path: item.path,
            sha: item.sha,
            mode: getTreeMode(item.type),
          })),
        });

        if (directoryTreeResponse.data.tree[0]?.sha) {
          const treeResponse = await this.octokitClient.rest.git.getTree({
            owner: this.owner,
            repo: this.repository,
            tree_sha: directoryTreeResponse.data.tree[0].sha,
            recursive: 'true',
          });

          if (treeResponse.data.tree.length > 0) {
            const jsonFiles = treeResponse.data.tree.filter((file) => (
              file.path?.endsWith('.json')
            )).sort((a, b) => (
              (a.path && b.path) ? a.path.localeCompare(b.path) : 0
            ));

            // Apply optimization only in multi-file mode
            let filteredChangeset = changeset;
            if (this.flags.multiFileEnabled && !this.path.endsWith('.json')) {
              console.log('🔍 GitHub Sync Optimization: Fetching remote content for comparison...');
              const remoteContents = await this.getRemoteFileContents(jsonFiles);
              console.log(`📁 Found ${Object.keys(remoteContents).length} remote files:`, Object.keys(remoteContents));

              console.log('🔄 Comparing local changeset with remote content...');
              console.log('📝 Local changeset files:', Object.keys(changeset));

              filteredChangeset = this.filterChangedFiles(changeset, remoteContents);

              // Log detailed comparison results
              const unchangedFiles = Object.keys(changeset).filter((file) => !Object.keys(filteredChangeset).includes(file));
              const newFiles = Object.keys(filteredChangeset).filter((file) => !remoteContents[file]);
              const modifiedFiles = Object.keys(filteredChangeset).filter((file) => remoteContents[file]);

              console.log('📊 Sync Analysis:');
              console.log(`  • Total files in changeset: ${Object.keys(changeset).length}`);
              console.log(`  • Files with changes: ${Object.keys(filteredChangeset).length}`);
              console.log(`  • Files unchanged: ${unchangedFiles.length}`);

              if (newFiles.length > 0) {
                console.log(`  • New files (${newFiles.length}):`, newFiles);
              }
              if (modifiedFiles.length > 0) {
                console.log(`  • Modified files (${modifiedFiles.length}):`, modifiedFiles);
              }
              if (unchangedFiles.length > 0) {
                console.log(`  • Unchanged files (${unchangedFiles.length}):`, unchangedFiles);
              }

              // If no files have changed, skip the commit
              if (Object.keys(filteredChangeset).length === 0) {
                console.log('✅ No files have changed, skipping commit');
                return true;
              }

              console.log('🚀 Filtered changeset to push:');
              Object.entries(filteredChangeset).forEach(([filePath, content]) => {
                const contentPreview = content.length > 100 ? `${content.substring(0, 100)}...` : content;
                console.log(`  📄 ${filePath} (${content.length} chars): ${contentPreview}`);
              });
            }

            const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => jsonFile.path && item === joinPath(this.path, jsonFile.path)))
              .map((fileToDelete) => `${this.path.split('/')[0]}/${fileToDelete.path}`);

            if (filesToDelete.length > 0) {
              console.log(`🗑️ Files to delete (${filesToDelete.length}):`, filesToDelete);
            }

            console.log('📤 Final GitHub API call:');
            console.log(`  • Files to create/update: ${Object.keys(filteredChangeset).length}`);
            console.log(`  • Files to delete: ${filesToDelete.length}`);
            console.log(`  • Commit message: "${message}"`);
            console.log(`  • Branch: ${branch}`);

            return await this.createOrUpdate(filteredChangeset, message, branch, shouldCreateBranch, filesToDelete, true);
          }
        }
      }

      return await this.createOrUpdate(changeset, message, branch, shouldCreateBranch);
    } catch {
      return await this.createOrUpdate(changeset, message, branch, shouldCreateBranch);
    }
  }

  public async getCommitSha(): Promise<string> {
    try {
      const normalizedPath = compact(this.path.split('/')).join('/');
      const response = await this.octokitClient.rest.repos.getContent({
        path: normalizedPath,
        owner: this.owner,
        repo: this.repository,
        ref: this.branch,
        headers: octokitClientDefaultHeaders,
      });
      // read entire directory
      if (Array.isArray(response.data)) {
        const directorySha = await this.getTreeShaForDirectory(normalizedPath);
        return directorySha;
      }
      return response.data.sha;
    } catch (e) {
      // Raise error (usually this is an auth error)
      console.error('Error', e);
      return '';
    }
  }
}
