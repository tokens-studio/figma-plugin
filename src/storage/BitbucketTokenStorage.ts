import compact from 'just-compact';
import { Bitbucket } from 'bitbucket';
import * as BitbucketClient from 'bitbucket';
import { decodeBase64 } from '@/utils/string';
import { RemoteTokenStorageFile } from './RemoteTokenStorage';
import IsJSONString from '@/utils/isJSONString';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import {
  GitMultiFileObject, GitSingleFileObject, GitStorageMetadata, GitTokenStorage,
} from './GitTokenStorage';

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

  // https://bitbucketjs.netlify.app/#api-source-source_readRoot OR
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get
  // Equivalent to directly hitting /2.0/repositories/{username}/{repo_slug}/src/{commit}/{path} without having to know the name or SHA1 of the repo's main branch.
  public async read(): Promise<RemoteTokenStorageFile<GitStorageMetadata>[]> {
    try {
      const response = await this.bitbucketClient.repositories.get({
        workspace: this.owner,
        repo_slug: this.repository,
        // path: this.path,
        // ref: this.branch,
      });
      // TODO: implement read directory

      return [];
    } catch (e) {
      // Raise error (usually this is an auth error)
      console.log('Error', e);
      return [];
    }
  }

  // https://bitbucketjs.netlify.app/#api-repositories-repositories_createSrcFileCommit
  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-post
  public async createOrUpdateFiles({ owner, repo, branch, changes }: CreatedOrUpdatedFileType) {
    const response = await this.bitbucketClient.repositories.createSrcFileCommit({
      branch,
      _body: changes[0].files,
      message: changes[0].message,
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
