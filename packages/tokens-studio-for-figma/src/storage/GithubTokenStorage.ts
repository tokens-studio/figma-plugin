import compact from 'just-compact';
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
import { isEqual } from '@/utils/isEqual';

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
   * Compares local files with remote files and returns only the changed files
   */
  private async getChangedFiles(localFiles: RemoteTokenStorageFile[]): Promise<{
    changedFiles: Record<string, string>;
    filesToDelete: string[];
  }> {
    try {
      const remoteFiles = await this.read();
      
      if (Array.isArray(remoteFiles) && remoteFiles.length > 0) {
        const changedFiles: Record<string, string> = {};
        const filesToDelete: string[] = [];
        
        // Create a map of remote files for easy lookup
        const remoteFileMap = new Map<string, RemoteTokenStorageFile>();
        remoteFiles.forEach(file => {
          if (file.type === 'tokenSet') {
            remoteFileMap.set(file.name, file);
          } else if (file.type === 'themes') {
            remoteFileMap.set(SystemFilenames.THEMES, file);
          } else if (file.type === 'metadata') {
            remoteFileMap.set(SystemFilenames.METADATA, file);
          }
        });

        // Check each local file against remote
        localFiles.forEach(localFile => {
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
            changedFiles[localPath] = JSON.stringify(localFile.data, null, 2);
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

        return { changedFiles, filesToDelete };
      }
    } catch (error) {
      console.warn('Failed to read remote files for delta diff, falling back to full sync:', error);
    }

    // Fallback: if we can't read remote files, return all local files as changed
    const fallbackChangedFiles: Record<string, string> = {};
    
    localFiles.forEach(file => {
      let filePath: string;
      
      if (this.path.endsWith('.json')) {
        // Single file mode - combine all data into one file
        if (Object.keys(fallbackChangedFiles).length === 0) {
          const singleFileData: GitSingleFileObject = {};
          
          localFiles.forEach(localFile => {
            if (localFile.type === 'tokenSet') {
              singleFileData[localFile.name] = localFile.data;
            } else if (localFile.type === 'themes') {
              singleFileData.$themes = localFile.data;
            } else if (localFile.type === 'metadata') {
              singleFileData.$metadata = localFile.data;
            }
          });
          
          fallbackChangedFiles[this.path] = JSON.stringify(singleFileData, null, 2);
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
    });

    return { changedFiles: fallbackChangedFiles, filesToDelete: [] };
  }

  /**
   * Enhanced writeChangeset that only pushes changed files
   */
  public async writeChangesetWithDiff(files: RemoteTokenStorageFile[], message: string, branch: string, shouldCreateBranch?: boolean): Promise<boolean> {
    try {
      const { changedFiles, filesToDelete } = await this.getChangedFiles(files);
      
      // If no files changed, skip the push
      if (Object.keys(changedFiles).length === 0 && filesToDelete.length === 0) {
        console.log('No files changed, skipping push');
        return true;
      }

      console.log(`Delta diff: Pushing ${Object.keys(changedFiles).length} changed files and deleting ${filesToDelete.length} files`);
      
      return this.createOrUpdate(changedFiles, message, branch, shouldCreateBranch, filesToDelete, true);
    } catch (error) {
      console.warn('Delta diff failed, falling back to traditional sync:', error);
      
      // Fallback to traditional writeChangeset behavior
      const filesChangeset: Record<string, string> = {};
      
      if (this.path.endsWith('.json')) {
        // Single file mode
        const singleFileData: GitSingleFileObject = {};
        
        files.forEach(file => {
          if (file.type === 'tokenSet') {
            singleFileData[file.name] = file.data;
          } else if (file.type === 'themes') {
            singleFileData.$themes = [...(singleFileData.$themes ?? []), ...file.data];
          } else if (file.type === 'metadata') {
            singleFileData.$metadata = { ...(singleFileData.$metadata ?? {}), ...file.data };
          }
        });
        
        filesChangeset[this.path] = JSON.stringify(singleFileData, null, 2);
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
      }
      
      return this.writeChangeset(filesChangeset, message, branch, shouldCreateBranch);
    }
  }

  public async writeChangeset(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean): Promise<boolean> {
    try {
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

        if (directoryTreeResponse.data.tree[0].sha) {
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

            const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => jsonFile.path && item === joinPath(this.path, jsonFile?.path)))
              .map((fileToDelete) => (`${this.path.split('/')[0]}/${fileToDelete.path}` ?? ''));
            return await this.createOrUpdate(changeset, message, branch, shouldCreateBranch, filesToDelete, true);
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
