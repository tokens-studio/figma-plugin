import { Bitbucket, Schema } from 'bitbucket';
import compact from 'just-compact';
import {
  RemoteTokenStorageFile,
  RemoteTokenStorageMetadata,
  RemoteTokenstorageErrorMessage,
} from './RemoteTokenStorage';
import { GitMultiFileObject, GitSingleFileObject, GitTokenStorage } from './GitTokenStorage';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { retryHttpRequest } from '@/utils/retryWithBackoff';
import { isMissingFileError } from './utils/handleMissingFileError';

type CreatedOrUpdatedFileType = {
  owner: string;
  repo: string;
  branch: string;
  createBranch?: boolean;
  changes: {
    message: string;
    files: Record<string, string>;
  }[];
};

type FetchJsonResult = any[] | Record<string, any>;

export class BitbucketTokenStorage extends GitTokenStorage {
  private bitbucketClient;

  private apiToken?: string;

  constructor(secret: string, owner: string, repository: string, baseUrl?: string, username?: string, apiToken?: string) {
    super(secret, owner, repository, baseUrl, username);
    this.apiToken = apiToken || secret; // Use apiToken if provided, otherwise fall back to secret for backward compatibility
    this.flags = {
      multiFileEnabled: false,
    };

    // For API tokens, Bitbucket expects Atlassian account email as username and the token as password
    const authConfig = {
      username: this.username || this.owner, // This should be the Atlassian account email for API tokens
      password: this.apiToken,
    };

    this.bitbucketClient = new Bitbucket({
      auth: authConfig,
      baseUrl: this.baseUrl || undefined,
    });
  }

  // https://bitbucketjs.netlify.app/#api-repositories-repositories_listBranches OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-repositories-workspace-repo-slug-refs-get
  public async fetchBranches(): Promise<string[]> {
    try {
      const authString = `${this.username || this.owner}:${this.apiToken}`;
      const authHeader = `Basic ${btoa(authString)}`;
      const branches: string[] = [];
      let url = `https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}/refs/branches?pagelen=100`;
      while (url) {
        const response = await fetch(url, {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('BITBUCKET_UNAUTHORIZED');
          }
          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.values && Array.isArray(data.values)) {
          branches.push(...data.values.map((branch: any) => branch.name));
        }
        url = data.next || null;
      }
      return branches;
    } catch (error) {
      if (error instanceof Error && error.message === 'BITBUCKET_UNAUTHORIZED') {
        throw error;
      }
      throw new Error('Error fetching branches');
    }
  }

  /**
   * Creates a new branch in the repository.
   *
   * [Bibucket API reference](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-repositories-workspace-repo-slug-refs-branches-post)
   * [bitbucketjs API reference](https://bitbucketjs.netlify.app/#api-repositories-repositories_createBranch)
   *
   * @param branch - The name of the new branch to create.
   * @param source - The name of the branch to create the new branch from. If not provided, the current branch is used.
   *
   * @returns A promise that resolves to a boolean indicating whether the branch was successfully created.
   *
   * @throws Will throw an error if the origin branch could not be retrieved.
   */
  public async createBranch(branch: string, source?: string) {
    try {
      const originBranch = await this.bitbucketClient.repositories.listRefs({
        workspace: this.owner,
        repo_slug: this.repository,
        pagelen: 100,
      });

      const sourceBranchName = source || this.branch;
      const sourceBranch = originBranch.data.values.find(
        (branchValue: Schema.Branch) => branchValue.name === sourceBranchName,
      );

      if (
        !originBranch.data
        || !originBranch.data.values
        || !sourceBranch
        || !sourceBranch.target
        || !sourceBranch.target.hash
      ) {
        throw new Error('Could not retrieve origin branch');
      }

      const newBranch = await this.bitbucketClient.refs.createBranch({
        workspace: this.owner,
        _body: {
          name: branch, // branch name
          target: {
            hash: sourceBranch.target.hash, // hash of the commit the new branch should point to
          },
        },
        repo_slug: this.repository,
      });

      return newBranch.status === 201;
    } catch (err) {
      return false;
    }
  }

  // https://bitbucketjs.netlify.app/#api-users-users_getAuthedUser OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-users/?utm_source=%2Fbitbucket%2Fapi%2F2%2Freference%2Fresource%2Fuser&utm_medium=302#api-user-get
  // this would be best: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-permissions-config-users-selected-user-id-get
  public async canWrite(): Promise<boolean> {
    try {
      // Use direct HTTP call for API token authentication
      const authString = `${this.username || this.owner}:${this.apiToken}`;
      const authHeader = `Basic ${btoa(authString)}`;

      // First get current user
      const userResponse = await fetch('https://api.bitbucket.org/2.0/user', {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        // Throw authentication errors instead of returning false
        if (userResponse.status === 401) {
          throw new Error('BITBUCKET_UNAUTHORIZED');
        }
        return false;
      }

      const userData = await userResponse.json();
      if (!userData.account_id) return false;

      // Check repository permissions
      const permResponse = await fetch(`https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}`, {
        headers: {
          Authorization: authHeader,
        },
      });

      if (!permResponse.ok) {
        if (permResponse.status === 401) {
          throw new Error('BITBUCKET_UNAUTHORIZED');
        }
        return false;
      }

      // If we can access the repository, assume we have write access
      // (API tokens are typically created with specific permissions)
      return true;
    } catch (e) {
      // Re-throw authentication errors
      if (e instanceof Error && e.message === 'BITBUCKET_UNAUTHORIZED') {
        throw e;
      }
      return false;
    }
  }

  /**
   * Reads the content of the files in a Bitbucket repository.
   *
   * Fetches the content of the files in a Bitbucket repository specified by the `owner`, `repository`, and `branch` properties.
   * Filters out the JSON files and processes their content.
   *
   * Returns a promise that resolves to an array of `RemoteTokenStorageFile` objects, if successful.
   * Each `RemoteTokenStorageFile` object represents a file in the repository and contains the file's path, name, type, and data.
   *
   * @returns A promise that resolves to an array of `RemoteTokenStorageFile` objects or a `RemoteTokenstorageErrorMessage` object.
   * @throws Will throw an error if the operation fails.
   */

  private async fetchJsonFilesFromDirectory(url: string): Promise<FetchJsonResult> {
    let allJsonFiles: any[] = [];
    let nextPageUrl: string | null = `${url}?pagelen=100`;

    while (nextPageUrl) {
      const currentUrl = nextPageUrl; // TypeScript guard to ensure non-null
      const authHeader = `Basic ${btoa(`${this.username || this.owner}:${this.apiToken}`)}`;

      const response = await retryHttpRequest<Response>(
        () => fetch(currentUrl, {
          headers: {
            Authorization: authHeader,
          },
          cache: 'no-cache',
        }),
      );

      if (!response.ok) {
        throw new Error(`Failed to read from Bitbucket: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.values && Array.isArray(data.values)) {
        const jsonFiles = data.values.filter((file: any) => file.path.endsWith('.json'));
        allJsonFiles = allJsonFiles.concat(jsonFiles);

        // Fetch files from subdirectories recursively
        const subDirectoryFiles = await Promise.all(
          data.values
            .filter((file: any) => file.type === 'commit_directory')
            .map(async (directory: any) => await this.fetchJsonFilesFromDirectory(directory.links.self.href)),
        );

        allJsonFiles = allJsonFiles.concat(...subDirectoryFiles);
      }

      nextPageUrl = data.next || null;
    }

    return allJsonFiles;
  }

  private async fetchJsonFile(url: string): Promise<GitSingleFileObject> {
    const authHeader = `Basic ${btoa(`${this.username || this.owner}:${this.apiToken}`)}`;

    const response = await retryHttpRequest<Response>(
      () => fetch(url, {
        headers: {
          Authorization: authHeader,
        },
        cache: 'no-cache',
      }),
    );

    if (!response.ok) {
      throw new Error(`Failed to read from Bitbucket: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  }

  /**
   * Get the commit SHA for a branch. For branches with slashes, we need to use the commit SHA
   * instead of the branch name in the src endpoint due to Bitbucket API limitations.
   */
  private async getBranchCommitSha(branchName: string): Promise<string> {
    try {
      const authString = `${this.username || this.owner}:${this.apiToken}`;
      const authHeader = `Basic ${btoa(authString)}`;

      const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}/refs/branches/${encodeURIComponent(branchName)}`, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get branch info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.target.hash;
    } catch (error) {
      console.warn(`Could not get commit SHA for branch ${branchName}, falling back to branch name:`, error);
      return branchName;
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    const normalizedPath = compact(this.path.split('/')).join('/');

    try {
      // For branches with slashes, use commit SHA instead of branch name due to Bitbucket API limitations
      const branchRef = this.branch.includes('/')
        ? await this.getBranchCommitSha(this.branch)
        : encodeURIComponent(this.branch);
      const url = `https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}/src/${branchRef}/${normalizedPath}`;

      if (this.path.endsWith('.json')) {
        const jsonFile = await this.fetchJsonFile(url);

        return [
          {
            type: 'themes',
            path: `${SystemFilenames.THEMES}.json`,
            data: jsonFile.$themes ?? [],
          },
          ...(jsonFile.$metadata
            ? [
              {
                type: 'metadata' as const,
                path: `${SystemFilenames.METADATA}.json`,
                data: jsonFile.$metadata,
              },
            ]
            : []),
          ...(
            Object.entries(jsonFile).filter(([key]) => !Object.values<string>(SystemFilenames).includes(key)) as [
              string,
              AnyTokenSet<false>,
            ][]
          ).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
            name,
            type: 'tokenSet',
            path: `${name}.json`,
            data: tokenSet,
          })),
        ];
      }

      // Multi file (directory path)
      {
        const jsonFiles = await this.fetchJsonFilesFromDirectory(url);

        const authString = `${this.username || this.owner}:${this.apiToken}`;
        const jsonFileContents = await Promise.allSettled(
          jsonFiles.map((file: any) => {
            const fileUrl = `https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}/src/${branchRef}/${file.path}`;
            return retryHttpRequest<Response>(
              () => fetch(fileUrl, {
                headers: {
                  Authorization: `Basic ${btoa(authString)}`,
                },
                cache: 'no-cache',
              }),
            ).then((rsp) => {
              if (!rsp.ok) {
                throw new Error(`Failed to read file ${file.path}: ${rsp.status} ${rsp.statusText}`);
              }
              return rsp.text();
            });
          }),
        );
        return jsonFileContents.map((result, index) => {
          const { path } = jsonFiles[index];
          const filePath = path.startsWith(this.path) ? path : `${this.path}/${path}`;
          let name = filePath.substring(this.path.length).replace(/^\/+/, '');
          name = name.replace('.json', '');

          try {
            let fileContent: string;
            if (result.status === 'fulfilled') {
              fileContent = result.value;
            } else {
              throw new Error(`Failed to fetch file ${path}`);
            }

            const parsed = JSON.parse(fileContent) as GitMultiFileObject;

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
          } catch (parseError) {
            console.error(`[Bitbucket Sync] Failed to parse JSON file '${path}': ${parseError instanceof Error ? parseError.message : parseError}`);
            throw parseError;
          }
        });
      }
    } catch (e) {
      console.error('Error', e);
      // For specific Bitbucket 404 errors (file/directory not found), return empty array to allow creation
      if (isMissingFileError(e)) {
        return [];
      }
      return this.handleError(e, StorageProviderType.BITBUCKET);
    }
  }

  /**
   * Create or update files in a Bitbucket repository.
   *
   * [Bitbucket API reference](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-post)
   *
   * @param {Object} params - The parameters for creating or updating files.
   * @param {string} params.owner - The owner of the repository.
   * @param {string} params.repo - The repository where the files will be created or updated.
   * @param {string} params.branch - The branch where the files will be created or updated.
   * @param {Array} params.changes - An array of changes to be made. Each change is an object that includes a message and files.
   * @param {string} params.changes[].message - The commit message for the change.
   * @param {Object} params.changes[].files - The files to be created or updated. This is a Record<string, string> where the key is the filename and the value is the new content.
   *
   * @returns {Promise} A promise that resolves to the response from the Bitbucket API.
   *
   * @example
   * const params = {
   *   owner: 'owner',
   *   repo: 'repo',
   *   branch: 'branch',
   *   changes: [
   *     {
   *       message: 'Initial commit',
   *       files: {
   *         'data/tokens.json': JSON.stringify(data),
   *       },
   *     },
   *   ],
   * };
   * const response = await createOrUpdateFiles(params);
   */
  public async createOrUpdateFiles({
    owner, repo, branch, changes,
  }: CreatedOrUpdatedFileType) {
    const { message, files } = changes[0];

    const data = new FormData();

    const normalizedPath = compact(this.path.split('/')).join('/');
    let deletedTokenSets: string[] = [];

    if (!normalizedPath.endsWith('.json') && this.flags.multiFileEnabled) {
      try {
        const branchRef = branch.includes('/')
          ? await this.getBranchCommitSha(branch)
          : encodeURIComponent(branch);
        const url = `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/src/${branchRef}/${normalizedPath}`;
        const existingFiles = await this.fetchJsonFilesFromDirectory(url);

        const existingTokenSets: Record<string, boolean> = {};
        if (Array.isArray(existingFiles)) {
          existingFiles.forEach((file) => {
            if (file.path.endsWith('.json') && !file.path.startsWith('$')) {
              const tokenSetName = file.path.replace('.json', '');
              existingTokenSets[tokenSetName] = true;
            }
          });
        }

        const localTokenSets = Object.keys(files);

        deletedTokenSets = Object.keys(existingTokenSets).filter(
          (tokenSet) => !localTokenSets.includes(tokenSet) && !tokenSet.startsWith('$'),
        );
      } catch (e) {
        // Do nothing as the folder is not yet created
      }
    }

    // @README the files object is Record<string, string> here
    // with the key equal to the filename and the value equal to the new content
    // this actually doesn't take into account deletions - but we can consider this later
    // as per the Bitbucket API we basically need to add these key value pairs to the FormData object "as-is"
    Object.entries(files).forEach(([file, content]) => {
      data.append(file, content);
      // we will also add all the "files" parameters so we can perform deletions later down the line
      // as per the doc - any specified path in "files" whithout a content definition elsewhere in the FormData will be deleted
      // @NOTE we can actually add the files parameter multiple times - this is fine and Bitbucket will pick this up correctly
      data.append('files', file);
    });

    deletedTokenSets.forEach((tokenSet) => {
      data.append('files', `${tokenSet}.json`); // Mark for deletion
    });

    const response = await this.bitbucketClient.repositories.createSrcFileCommit({
      _body: data,
      branch,
      message,
      repo_slug: repo,
      workspace: owner,
    });

    return response;
  }

  public async writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch?: boolean,
  ): Promise<boolean> {
    const response = this.createOrUpdateFiles({
      owner: this.owner,
      repo: this.repository,
      branch,
      createBranch: shouldCreateBranch,
      changes: [
        {
          message,
          files: changeset,
        },
      ],
    });
    return !!response;
  }
}
