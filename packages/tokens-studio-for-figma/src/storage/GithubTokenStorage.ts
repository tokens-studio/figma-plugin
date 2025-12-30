import compact from 'just-compact';
import { Octokit } from '@octokit/rest';
import {
  RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata, RemoteTokenStorageData,
} from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import {
  GitMultiFileObject, GitSingleFileObject, GitTokenStorage, GitStorageSaveOption, GitStorageSaveOptions,
} from './GitTokenStorage';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { GitSyncOptimizer, ChangedState } from './GitSyncOptimizer';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { retryWithBackoff } from '@/utils/retryWithBackoff';
import { isMissingFileError } from './utils/handleMissingFileError';

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
      baseUrl: this.normalizeGitHubEnterpriseBaseUrl(this.baseUrl),
    }) as ExtendedOctokitClient;
  }

  /**
   * Normalizes the GitHub Enterprise base URL to ensure it has the /api/v3 suffix
   * @param baseUrl - The base URL provided by the user
   * @returns The normalized base URL with /api/v3 suffix, or undefined for GitHub.com
   */
  private normalizeGitHubEnterpriseBaseUrl(baseUrl?: string): string | undefined {
    if (!baseUrl || baseUrl === '') {
      return undefined; // Use default GitHub.com API
    }

    // Remove trailing slashes
    const normalized = baseUrl.trim().replace(/\/+$/, '');

    // If it already has /api/v3, return as-is
    if (normalized.endsWith('/api/v3')) {
      return normalized;
    }

    // Add /api/v3 for GitHub Enterprise Server
    return `${normalized}/api/v3`;
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
      const response = await retryWithBackoff(
        () => this.octokitClient.rest.repos.getContent({
          path: normalizedPath,
          owner: this.owner,
          repo: this.repository,
          ref: this.branch,
          headers: {
            ...octokitClientDefaultHeaders,
            // Setting this makes github return the raw file instead of a json object.
            Accept: 'application/vnd.github.raw',
          },
        }),
        {
          maxRetries: 3,
          initialDelayMs: 100,
        },
      );

      // read entire directory
      if (Array.isArray(response.data)) {
        const directorySha = await this.getTreeShaForDirectory(normalizedPath);
        const treeResponse = await retryWithBackoff(
          () => this.octokitClient.rest.git.getTree({
            owner: this.owner,
            repo: this.repository,
            tree_sha: directorySha,
            recursive: 'true',
            headers: octokitClientDefaultHeaders,
          }),
          {
            maxRetries: 3,
            initialDelayMs: 100,
          },
        );
        if (treeResponse && treeResponse.data.tree.length > 0) {
          const jsonFiles = treeResponse.data.tree.filter((file) => (
            file.path?.endsWith('.json')
          )).sort((a, b) => (
            (a.path && b.path) ? a.path.localeCompare(b.path) : 0
          ));
          const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => {
            if (!treeItem.path) return Promise.resolve(null);

            const itemPath = treeItem.path;
            return retryWithBackoff(
              () => this.octokitClient.rest.repos.getContent({
                owner: this.owner,
                repo: this.repository,
                path: itemPath.startsWith(normalizedPath) ? itemPath : `${normalizedPath}/${itemPath}`,
                ref: this.branch,
                headers: {
                  ...octokitClientDefaultHeaders,
                  // Setting this makes github return the raw file instead of a json object.
                  Accept: 'application/vnd.github.raw',
                },
              }),
              {
                maxRetries: 3,
                initialDelayMs: 100,
              },
            );
          }));
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

              const tokenSet = parsed as AnyTokenSet<false>;
              if (Object.keys(tokenSet).length === 0) {
                return null;
              }

              return {
                path: filePath,
                name,
                type: 'tokenSet',
                data: tokenSet,
              };
            }
            return null;
          }));
        }
      } else if (response.data) {
        const data = response.data as unknown as string;
        if (IsJSONString(data)) {
          try {
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
          } catch (parseError) {
            return this.handleError(parseError, StorageProviderType.GITHUB);
          }
        }
        return {
          errorMessage: ErrorMessages.VALIDATION_ERROR,
        };
      }

      return [];
    } catch (e) {
      console.error('Error', e);
      // For specific GitHub 404 errors (file/directory not found), return empty array to allow creation
      if (isMissingFileError(e)) {
        return [];
      }
      return this.handleError(e, StorageProviderType.GITHUB);
    }
  }

  public async createOrUpdate(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean, filesToDelete?: string[], ignoreDeletionFailures?: boolean): Promise<boolean> {
    const response = await retryWithBackoff(
      () => this.octokitClient.repos.createOrUpdateFiles({
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
      }),
      {
        maxRetries: 3,
        initialDelayMs: 100,
      },
    );
    return !!response;
  }

  /**
   * Optimized save method that only pushes changed files based on changedState
   * @param data Token data to save
   * @param saveOptions Save options including commit message
   * @param changedState Object containing information about what has changed
   * @returns Promise<boolean> indicating success
   */
  public async saveOptimized(
    data: RemoteTokenStorageData<GitStorageSaveOptions>,
    saveOptions: GitStorageSaveOption,
    changedState: ChangedState,
  ): Promise<boolean> {
    // Use the shared Git sync optimizer
    const { filteredFiles, filesToDelete, hasChanges } = GitSyncOptimizer.optimizeSync(
      data,
      saveOptions,
      changedState,
    );

    if (!hasChanges) {
      return true;
    }

    // Use a custom write method that handles both files and deletions
    return this.writeOptimized(filteredFiles, saveOptions, filesToDelete);
  }

  private async writeOptimized(files: RemoteTokenStorageFile<GitStorageSaveOptions>[], saveOptions: GitStorageSaveOption, filesToDelete: string[]): Promise<boolean> {
    const branches = await this.fetchBranches();
    if (!branches.length) return false;

    // Use shared utilities to create changeset and prepare file deletions
    const filesChangeset = GitSyncOptimizer.createMultiFileChangeset(files, this.path);
    const filesToDeleteWithPath = GitSyncOptimizer.prepareFileDeletions(filesToDelete, this.path);

    return this.createOrUpdate(
      filesChangeset,
      saveOptions.commitMessage ?? 'Commit from Figma',
      this.branch,
      !branches.includes(this.branch),
      filesToDeleteWithPath,
      true,
    );
  }

  public async writeChangeset(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean): Promise<boolean> {
    return await this.createOrUpdate(changeset, message, branch, shouldCreateBranch, [], true);
  }

  public async getCommitSha(): Promise<string> {
    try {
      const normalizedPath = compact(this.path.split('/')).join('/');
      const response = await retryWithBackoff(
        () => this.octokitClient.rest.repos.getContent({
          path: normalizedPath,
          owner: this.owner,
          repo: this.repository,
          ref: this.branch,
          headers: octokitClientDefaultHeaders,
        }),
        {
          maxRetries: 3,
          initialDelayMs: 100,
        },
      );
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
