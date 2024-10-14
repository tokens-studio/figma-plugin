/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/indent */
/* eslint "@typescript-eslint/no-unused-vars": off */
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
import { ErrorMessages } from '@/constants/ErrorMessages';

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

  constructor(secret: string, owner: string, repository: string, baseUrl?: string, username?: string) {
    super(secret, owner, repository, baseUrl, username);
    this.flags = {
      multiFileEnabled: false,
    };

    this.bitbucketClient = new Bitbucket({
      auth: {
        username: this.username || this.owner, // technically username is required, but we'll use owner as a fallback
        password: this.secret,
      },
      baseUrl: this.baseUrl || undefined,
    });
  }

  // https://bitbucketjs.netlify.app/#api-repositories-repositories_listBranches OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-repositories-workspace-repo-slug-refs-get
  public async fetchBranches(): Promise<string[]> {
    const branches = await this.bitbucketClient.repositories.listBranches({
      workspace: this.owner,
      repo_slug: this.repository,
    });

    if (!branches || !branches.data) {
      return ['No data'];
    }
    // README we'll have to account for paginated branches somehow, this only returns
    // the first 10 branches which is fine for now
    return branches.data!.values!.map((branch) => branch.name) as string[];
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
      console.error(err);
      return false;
    }
  }

  // https://bitbucketjs.netlify.app/#api-users-users_getAuthedUser OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-users/?utm_source=%2Fbitbucket%2Fapi%2F2%2Freference%2Fresource%2Fuser&utm_medium=302#api-user-get
  // this would be best: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-permissions-config-users-selected-user-id-get
  public async canWrite(): Promise<boolean> {
    const currentUser = await this.bitbucketClient.users.getAuthedUser({});
    if (!currentUser.data.account_id) return false;
    try {
      const { data } = await this.bitbucketClient.repositories.listPermissions({});
      const permission = data.values?.[0]?.permission;

      const canWrite = !!(permission === 'admin' || 'write');
      return !!canWrite;
    } catch (e) {
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
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${btoa(`${this.username}:${this.secret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to read from Bitbucket: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.values && Array.isArray(data.values)) {
      let jsonFiles = data.values.filter((file: any) => file.path.endsWith('.json'));

      const subDirectoryFiles = await Promise.all(
        data.values
          .filter((file: any) => file.type === 'commit_directory')
          .map(async (directory: any) => await this.fetchJsonFilesFromDirectory(directory.links.self.href)),
      );

      jsonFiles = jsonFiles.concat(...subDirectoryFiles);
      return jsonFiles;
        }
      return data;
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    const normalizedPath = compact(this.path.split('/')).join('/');

    try {
      const url = `https://api.bitbucket.org/2.0/repositories/${this.owner}/${this.repository}/src/${this.branch}/${normalizedPath}`;
      const jsonFiles = await this.fetchJsonFilesFromDirectory(url);

      if (Array.isArray(jsonFiles)) {
      const jsonFileContents = await Promise.all(
        jsonFiles.map((file: any) => fetch(file.links.self.href, {
            headers: {
              Authorization: `Basic ${btoa(`${this.username}:${this.secret}`)}`,
            },
          }).then((rsp) => rsp.text())),
      );
        // Process the content of each JSON file
        return jsonFileContents.map((fileContent, index) => {
          const { path } = jsonFiles[index];
          const filePath = path.startsWith(this.path) ? path : `${this.path}/${path}`;
          let name = filePath.substring(this.path.length).replace(/^\/+/, '');
          name = name.replace('.json', '');
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
        });
      } else if (jsonFiles) {
        const parsed = jsonFiles as GitSingleFileObject;
        return [
          {
            type: 'themes',
            path: `${this.path}/${SystemFilenames.THEMES}.json`,
            data: parsed.$themes ?? [],
          },
          ...(parsed.$metadata
            ? [
                {
                  type: 'metadata' as const,
                  path: this.path,
                  data: parsed.$metadata,
                },
              ]
            : []),
          ...(
            Object.entries(parsed).filter(([key]) => !Object.values<string>(SystemFilenames).includes(key)) as [
              string,
              AnyTokenSet<false>,
            ][]
          ).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
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
    } catch (e) {
      console.error('Error', e);
      return [];
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
