import compact from 'just-compact';
import { Bitbucket } from 'bitbucket';
import { decodeBase64 } from '@/utils/string';
import { RemoteTokenStorageFile } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import {
  GitMultiFileObject, GitSingleFileObject, GitStorageMetadata, GitTokenStorage,
} from './GitTokenStorage';

type BitbucketClient = typeof Bitbucket;

// TODO??
// type ExtendedBitbucketClient = Omit<Bitbucket, 'repositories'> & {
//   repos: Bitbucket['repositories'] & {
//     createOrUpdateFiles: (params: {
//       owner: string;
//       repo: string;
//       branch: string;
//       createBranch?: boolean;
//       changes: {
//         message: string;
//         files: Record<string, string>;
//       }[];
//     }) => ReturnType<Bitbucket['repositories']['createOrUpdateFileContents']>;
//   };
// };

function getTreeMode(type: 'dir' | 'file' | string) {
  switch (type) {
    case 'dir':
      return '040000';
    default:
      return '100644';
  }
}

export class BitbucketTokenStorage extends GitTokenStorage {
  private bitbucketClient;

  constructor(secret: string, owner: string, repository: string, baseUrl?: string) {
    super(secret, owner, repository, baseUrl);
    this.flags = {
      multiFileEnabled: false,
    };

    // eslint-disable-next-line
    this.bitbucketClient = new Bitbucket({
      auth: {
        username: this.owner,
        password: this.secret,
      },
      baseUrl: this.baseUrl || undefined,
    });
  }

  // https://bitbucketjs.netlify.app/#api-repositories-repositories_listBranches OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-repositories-workspace-repo-slug-refs-get
  public async fetchBranches() {
    const branches = await this.bitbucketClient.repositories.listBranches({
      workspace: this.owner,
      repo_slug: this.repository,
    });

    return branches.data.values?.map((branch) => branch.name);
  }

  // https://bitbucketjs.netlify.app/#api-repositories-repositories_createBranch OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-repositories-workspace-repo-slug-refs-branches-post
  public async createBranch(branch: string, source?: string) {
    try {
      const originRef = `refs/${source || this.branch}`;
      const newRef = `refs/${branch}`;
      const originBranch = await this.bitbucketClient.listRefs({
        workspace: this.owner,
        repo_slug: this.repository,
        ref: originRef,
      });
      // TODO: createRef is not implemented on Bitbucket Cloud
      const newBranch = await this.bitbucketClient.git.createRef({
        workspace: this.owner,
        repo_slug: this.repository,
        ref: newRef,
        sha: originBranch.data.object.sha,
      });
      return !!newBranch.data.ref;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // https://bitbucketjs.netlify.app/#api-users-users_getAuthedUser OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-users/?utm_source=%2Fbitbucket%2Fapi%2F2%2Freference%2Fresource%2Fuser&utm_medium=302#api-user-get
  // this would be best: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-permissions-config-users-selected-user-id-get
  public async canWrite(): Promise<boolean> {
    const currentUser = await this.bitbucketClient.getAuthedUser();
    if (!currentUser.data.account_id) return false;
    try {
      const { permission } = await this.bitbucketClient.listPermissions().data.values[0];
      // TODO: double check logic here
      const canWrite = !!(permission === 'admin' || 'write');
      return !!canWrite;
    } catch (e) {
      return false;
    }
  }

  // https://bitbucketjs.netlify.app/#api-source-source_readRoot OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get
  // Equivalent to directly hitting /2.0/repositories/{username}/{repo_slug}/src/{commit}/{path} without having to know the name or SHA1 of the repo's main branch.
  public async read(): Promise<RemoteTokenStorageFile<GitStorageMetadata>[]> {
    try {
      const response = await this.bitbucketClient.source.readRoot({
        workspace: this.owner,
        repo_slug: this.repository,
        // path: this.path,
        // ref: this.branch,
      });

      // read entire directory
      if (Array.isArray(response.data.values) && this.flags.multiFileEnabled) {
        //  To walk the entire directory tree, parse each response and follow the self links of each commit_directory object
        const directoryResponse = response.data.values.filter((file) => file.type === 'commit_file');

        const jsonFiles = directoryResponse
          .filter((file) => file.path?.endsWith('.json'))
          .sort((a: { path: string }, b: { path: any }) => (a.path && b.path ? a.path.localeCompare(b.path) : 0));

        const DirectoryNameSplit = this.path.split('/');
        const RootDirectoryName = DirectoryNameSplit[0];
        let subDirectoryName: string;

        if (DirectoryNameSplit.length > 1) {
          subDirectoryName = `${DirectoryNameSplit.splice(1, DirectoryNameSplit.length - 1).join('/')}/`;
        } else {
          subDirectoryName = '';
        }

        const jsonFileContents = await Promise.all(
          jsonFiles.map((treeItem) => (treeItem.path
            ? this.bitbucketClient.repositories.get({
              workspace: this.owner,
              repo_slug: this.repository,
              path: `${RootDirectoryName}/${treeItem.path}`,
              ref: this.branch,
            })
            : Promise.resolve(null))),
        );

        return compact(
          jsonFileContents.map<RemoteTokenStorageFile<GitStorageMetadata> | null>((fileContent, index) => {
            const { path } = jsonFiles[index];

            if (path && fileContent?.data && !Array.isArray(fileContent?.data) && 'content' in fileContent.data) {
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
          }),
        );
      }
      if ('content' in response.data) {
        const data = decodeBase64(response.data.content);
        if (IsJSONString(data)) {
          const parsed = JSON.parse(data) as GitSingleFileObject;
          return [
            {
              type: 'themes',
              path: `${this.path}/$themes.json`,
              data: parsed.$themes ?? [],
            },
            ...(Object.entries(parsed).filter(([key]) => key !== '$themes') as [string, AnyTokenSet<false>][]).map<
            RemoteTokenStorageFile<GitStorageMetadata>
            >(([name, tokenSet]) => ({
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

  public async writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch?: boolean,
  ): Promise<boolean> {
    const response = await this.bitbucketClient.repos.createOrUpdateFiles({
      branch,
      owner: this.owner,
      repo: this.repository,
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
