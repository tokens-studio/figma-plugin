import compact from 'just-compact';
import { Octokit } from '@octokit/rest';
import { decodeBase64 } from '@/utils/string/ui';
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
        headers: octokitClientDefaultHeaders,
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
              headers: octokitClientDefaultHeaders,
            }) : Promise.resolve(null)
          )));
          return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
            const { path } = jsonFiles[index];
            if (
              path
              && fileContent?.data
              && !Array.isArray(fileContent?.data)
              && 'content' in fileContent.data
            ) {
              const filePath = path.startsWith(normalizedPath) ? path : `${normalizedPath}/${path}`;
              let name = filePath.substring(this.path.length).replace(/^\/+/, '');
              name = name.replace('.json', '');
              const parsed = JSON.parse(decodeBase64(fileContent.data.content)) as GitMultiFileObject;
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
      } else if ('content' in response.data) {
        const data = decodeBase64(response.data.content);
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
