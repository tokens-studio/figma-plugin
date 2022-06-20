import compact from 'just-compact';
import { Octokit } from '@octokit/rest';
import { decodeBase64 } from '@/utils/string';
import { RemoteTokenStorageFile } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import {
  GitMultiFileObject, GitSingleFileObject, GitStorageMetadata, GitTokenStorage,
} from './GitTokenStorage';

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

function getTreeMode(type: 'dir' | 'file' | string) {
  switch (type) {
    case 'dir':
      return '040000';
    default:
      return '100644';
  }
}

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

  public async fetchBranches() {
    const branches = await this.octokitClient.repos.listBranches({
      owner: this.owner,
      repo: this.repository,
    });
    return branches.data.map((branch) => branch.name);
  }

  public async createBranch(branch: string, source?: string) {
    try {
      const originRef = `heads/${source || this.branch}`;
      const newRef = `refs/heads/${branch}`;
      const originBranch = await this.octokitClient.git.getRef({
        owner: this.owner, repo: this.repository, ref: originRef,
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
    const currentUser = await this.octokitClient.rest.users.getAuthenticated();
    if (!currentUser.data.login) return false;
    try {
      const canWrite = await this.octokitClient.rest.repos.getCollaboratorPermissionLevel({
        owner: this.owner,
        repo: this.repository,
        username: currentUser.data.login,
      });
      return !!canWrite;
    } catch (e) {
      return false;
    }
  }

  public async read(): Promise<RemoteTokenStorageFile<GitStorageMetadata>[]> {
    try {
      const response = await this.octokitClient.rest.repos.getContent({
        owner: this.owner,
        repo: this.repository,
        path: this.path,
        ref: this.branch,
      });

      // read entire directory
      if (Array.isArray(response.data) && this.flags.multiFileEnabled) {
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
            const DirectoryNameSplit = this.path.split('/');
            const RootDirectoryName = DirectoryNameSplit[0];
            let subDirectoryName: string;
            if (DirectoryNameSplit.length > 1) {
              subDirectoryName = `${DirectoryNameSplit.splice(1, DirectoryNameSplit.length - 1).join('/')}/`;
            } else {
              subDirectoryName = '';
            }

            const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => (
              treeItem.path ? this.octokitClient.rest.repos.getContent({
                owner: this.owner,
                repo: this.repository,
                path: `${RootDirectoryName}/${treeItem.path}`,
                ref: this.branch,
              }) : Promise.resolve(null)
            )));
            return compact(jsonFileContents.map<RemoteTokenStorageFile<GitStorageMetadata> | null>((fileContent, index) => {
              const { path } = jsonFiles[index];

              if (
                path
                && fileContent?.data
                && !Array.isArray(fileContent?.data)
                && 'content' in fileContent.data
              ) {
                let name = path.replace(subDirectoryName, '');
                name = name.replace('.json', '');
                const parsed = JSON.parse(decodeBase64(fileContent.data.content)) as GitMultiFileObject;
                // @REAMDE we will need to ensure these reserved names
                if (name === '$themes') {
                  return {
                    path,
                    type: 'themes',
                    data: parsed as ThemeObjectsList,
                  };
                }

                return {
                  path,
                  name,
                  type: 'tokenSet',
                  data: parsed as AnyTokenSet<false>,
                };
              }

              return null;
            }));
          }
        }
      } else if ('content' in response.data) {
        const data = decodeBase64(response.data.content);
        if (IsJSONString(data)) {
          const parsed = JSON.parse(data) as GitSingleFileObject;
          return [
            {
              type: 'themes',
              path: `${this.path}/$themes.json`,
              data: parsed.$themes ?? [],
            },
            ...(Object.entries(parsed).filter(([key]) => key !== '$themes') as [string, AnyTokenSet<false>][]).map<RemoteTokenStorageFile<GitStorageMetadata>>(([name, tokenSet]) => ({
              name,
              type: 'tokenSet',
              path: `${this.path}/${name}.json`,
              data: tokenSet,
            })),
          ];
        }
      }

      return [];
    } catch (e) {
      // Raise error (usually this is an auth error)
      console.log('Error', e);
      return [];
    }
  }

  private async createOrUpdate(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean, filesToDelete?: string[], ignoreDeletionFailures?: boolean): Promise<boolean> {
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

      if (Array.isArray(response.data) && this.flags.multiFileEnabled) {
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

            const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => jsonFile.path && item.endsWith(jsonFile?.path)))
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
}
