import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import compact from 'just-compact';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeCredentials } from '@/types/StorageType';
import { GitTokenStorage } from './GitTokenStorage';
import {
  RemoteTokenstorageErrorMessage,
  RemoteTokenStorageFile, RemoteTokenStorageMetadataFile, RemoteTokenStorageSingleTokenSetFile, RemoteTokenStorageThemesFile,
} from './RemoteTokenStorage';
import { multiFileSchema, complexSingleFileSchema } from './schemas';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { AnyTokenSet } from '@/types/tokens';
import { retryHttpRequest } from '@/utils/retryWithBackoff';
import { isMissingFileError } from './utils/handleMissingFileError';

const apiVersion = 'api-version=7.0';

enum ChangeType {
  add = 'add',
  edit = 'edit',
  delete = 'delete',
}
enum ContentType {
  rawtext = 'rawtext',
}

interface FetchGit {
  body?: string
  gitResource: 'refs' | 'items' | 'pushes' | 'commits'
  method?: 'GET' | 'POST'
  orgUrl?: string
  params?: Record<string, string | boolean>
  projectId?: string
  repositoryId: string
  token: string
}

type PostPushesArgs = {
  branch: string
  changes: Record<string, any>
  commitMessage?: string
  oldObjectId?: string
};

type PostRefsArgs = {
  name: string
  oldObjectId: string
  newObjectId: string
};

export class ADOTokenStorage extends GitTokenStorage {
  protected orgUrl: string;

  protected projectId?: string;

  protected source: string;

  protected previousSourceBranch?: string;

  constructor({
    baseUrl: orgUrl = '',
    secret,
    id: repositoryId,
    name: projectId,
    branch,
    previousSourceBranch = 'main',
  }: Pick<
  Extract<StorageTypeCredentials, { provider: StorageProviderType.ADO }>,
  'baseUrl' | 'secret' | 'id' | 'name' | 'branch' | 'previousSourceBranch'
  >) {
    super(secret, '', repositoryId, orgUrl);
    this.orgUrl = orgUrl;
    this.projectId = projectId;
    this.previousSourceBranch = previousSourceBranch;
    this.source = branch;
  }

  public setSource(source: string) {
    this.source = source;
  }

  public async fetchGit({
    body,
    gitResource,
    orgUrl,
    params,
    projectId,
    repositoryId,
    token,
    method = 'GET',
  }: FetchGit): Promise<Response> {
    const paramString = params
      ? Object.entries(params).reduce<string>((acc, [key, value]) => `${acc}${key}=${value}&`, '') + apiVersion
      : apiVersion;
    const input = `${orgUrl}/${projectId ? `${projectId}/` : ''}_apis/git/repositories/${repositoryId}/${gitResource}?${paramString}`;

    // Use shared retry logic for network resilience
    return retryHttpRequest(
      async () => {
        const res = await fetch(
          input,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${btoa(`:${token}`)}`,
            },
            body,
          },
        );

        // Check for HTTP error status codes
        if (!res.ok) {
          const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
          (error as any).response = res;
          throw error;
        }

        return res;
      },
    );
  }

  public async canWrite(): Promise<boolean> {
    if (!this.path.endsWith('.json') && !this.flags.multiFileEnabled) return false;

    try {
      const response = await this.fetchGit({
        gitResource: 'refs',
        orgUrl: this.orgUrl,
        params: {
          filter: 'heads',
        },
        projectId: this.projectId,
        repositoryId: this.repository,
        token: this.secret,
      });
      return response.status === 200;
    } catch (error: any) {
      if (error.response) {
        return error.response.status === 200;
      }
      return false;
    }
  }

  private async getRefs(filter: string = 'heads'): Promise<{ count: number, value: GitInterfaces.GitRef[] }> {
    try {
      const response = await this.fetchGit({
        gitResource: 'refs',
        orgUrl: this.orgUrl,
        params: { filter },
        projectId: this.projectId,
        repositoryId: this.repository,
        token: this.secret,
      });
      return await response.json();
    } catch (e) {
      console.log(e);
      return { count: 0, value: [] };
    }
  }

  private async postRefs(body: PostRefsArgs) {
    try {
      const response = await this.fetchGit({
        method: 'POST',
        gitResource: 'refs',
        orgUrl: this.orgUrl,
        body: JSON.stringify([body]),
        projectId: this.projectId,
        repositoryId: this.repository,
        token: this.secret,
      });
      return await response.json();
    } catch (e) {
      console.log(e);
      return { count: 0, value: [] };
    }
  }

  public async fetchBranches() {
    const { value } = await this.getRefs();
    const branches:string[] = [];
    for (const val of value) {
      if (val.name) {
        branches.push(val.name.replace(/^refs\/heads\//, ''));
      }
    }
    return branches;
  }

  public async createBranch(branch: string, source: string = this.branch): Promise<boolean> {
    const { value } = await this.getRefs(`heads/${source}`);
    if (value[0]?.objectId) {
      const response = await this.postRefs({
        name: `refs/heads/${branch}`,
        oldObjectId: '0000000000000000000000000000000000000000',
        newObjectId: value[0].objectId,
      });
      return response?.value[0]?.success ?? false;
    }
    return false;
  }

  private async getOldObjectId(branch: string, shouldCreateBranch: boolean) {
    const { value } = await this.getRefs();
    const branches = new Map<string, GitInterfaces.GitRef>();
    for (const val of value) {
      if (val.name) {
        branches.set(val.name.replace(/^refs\/heads\//, ''), val);
      }
    }
    const sourceBranch = this.previousSourceBranch || this.source;
    return shouldCreateBranch ? branches.get(sourceBranch)?.objectId : branches.get(branch)?.objectId;
  }

  private itemsDefault(): Omit<FetchGit, 'body' | 'params'> {
    return {
      gitResource: 'items',
      orgUrl: this.orgUrl,
      projectId: this.projectId,
      repositoryId: this.repository,
      token: this.secret,
    };
  }

  private async getItem(path: string = this.path): Promise<any> {
    try {
      // @README setting includeContent to true
      // enables downloading the content instead
      const response = await this.fetchGit({
        ...this.itemsDefault(),
        params: {
          path,
          'versionDescriptor.version': this.branch,
          'versionDescriptor.versionType': 'branch',
          includeContent: true,
        },
      });

      // Check for network issues related to Azure DevOps IP transition
      if (!response.ok) {
        if (response.status === 0 || response.status >= 500 || response.status === 502 || response.status === 503 || response.status === 504) {
          // eslint-disable-next-line no-console
          console.error('ADO getItem - Possible network/DNS issue due to Azure DevOps IP transition');
        }

        return {};
      }

      const result = await response.json();

      // Check for empty responses (common during network issues)
      if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
        return {};
      }

      return result;
    } catch (e) {
      return {};
    }
  }

  private async getItems(): Promise<{ count: number, value?: GitInterfaces.GitItem[] }> {
    try {
      const response = await this.fetchGit({
        ...this.itemsDefault(),
        params: {
          scopePath: this.path.replace(/[^/]+\.json$/, ''),
          recursionLevel: 'full',
          ...(this.source && {
            'versionDescriptor.version': this.source,
            'versionDescriptor.versionType': 'branch',
          }),
        },
      });
      return await response.json();
    } catch (e) {
      console.log(e);
      return { count: 0, value: [] };
    }
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    try {
      if (!this.path.endsWith('.json')) {
        const { value } = await this.getItems();
        const jsonFiles = value
          ?.filter((file) => (file.path?.endsWith('.json')))
          .sort((a, b) => (
            (a.path && b.path) ? a.path.localeCompare(b.path) : 0
          )) ?? [];

        if (!jsonFiles.length) return [];

        const jsonFileContents = await Promise.all(
          jsonFiles.map(async ({ path }) => {
            const res = await this.getItem(path);
            const validationResult = await multiFileSchema.safeParseAsync(res);
            if (validationResult.success) {
              return validationResult.data;
            }
            return null;
          }),
        );
        return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
          const { path } = jsonFiles[index];
          if (fileContent) {
            const name = path?.replace(this.path, '')?.replace(/^\/+/, '')?.replace('.json', '');
            if (name === SystemFilenames.THEMES && Array.isArray(fileContent)) {
              return {
                path,
                type: 'themes',
                data: fileContent,
              } as RemoteTokenStorageThemesFile;
            }

            if (!Array.isArray(fileContent)) {
              if (name === SystemFilenames.METADATA) {
                return {
                  path,
                  type: 'metadata',
                  data: fileContent,
                } as RemoteTokenStorageMetadataFile;
              }

              return {
                path,
                name,
                type: 'tokenSet',
                data: fileContent,
              } as RemoteTokenStorageSingleTokenSetFile;
            }
          }

          return null;
        }));
      }

      const singleItem = await this.getItem();
      const singleItemValidationResult = await complexSingleFileSchema.safeParseAsync(singleItem);

      if (singleItemValidationResult.success) {
        const { $themes = [], $metadata, ...data } = singleItemValidationResult.data;

        return [
          {
            type: 'themes',
            path: this.path,
            data: $themes,
          },
          ...($metadata ? [
            {
              type: 'metadata' as const,
              path: this.path,
              data: $metadata,
            },
          ] : []),
          ...(Object.entries(data).filter(([key]) => (
            !Object.values<string>(SystemFilenames).includes(key)
          )) as [string, AnyTokenSet<false>][]).map<RemoteTokenStorageFile>(([name, tokenSet]) => ({
            name,
            type: 'tokenSet',
            path: this.path,
            data: !Array.isArray(tokenSet) ? tokenSet : {},
          })),
        ];
      }
      if (singleItem.errorCode === 0) {
        return [];
      }
      return {
        errorMessage: ErrorMessages.VALIDATION_ERROR,
      };
    } catch (e) {
      console.log(e);
      // For specific ADO 404 errors (file/directory not found), return empty array to allow creation
      if (isMissingFileError(e)) {
        return [];
      }
      return this.handleError(e, StorageProviderType.ADO);
    }
  }

  private async postPushes({
    branch, changes, commitMessage = 'Commit from Figma', oldObjectId,
  }: PostPushesArgs): Promise<GitInterfaces.GitPush> {
    // We need to get the latest commit ID to push to the correct branch
    const commitsResponse = await this.fetchGit({
      gitResource: 'commits',
      method: 'GET',
      orgUrl: this.orgUrl,
      projectId: this.projectId,
      repositoryId: this.repository,
      token: this.secret,
      params: {
        'searchCriteria.$top': '1',
        'searchCriteria.itemVersion.version': branch,
      },
    }).then((res) => res.json());

    if (!commitsResponse.value) {
      const errorMessage = commitsResponse.message || ErrorMessages.ADO_CREDENTIAL_ERROR;
      throw new Error(errorMessage);
    }

    const latestCommitId = commitsResponse.value[0]?.commitId;

    const pushesResponse = await this.fetchGit({
      body: JSON.stringify({
        refUpdates: [
          {
            name: `refs/heads/${branch}`,
            oldObjectId: latestCommitId ?? oldObjectId,
          },
        ],
        commits: [
          {
            comment: commitMessage,
            changes,
          },
        ],
      }),
      gitResource: 'pushes',
      method: 'POST',
      orgUrl: this.orgUrl,
      projectId: this.projectId,
      repositoryId: this.repository,
      token: this.secret,
    });
    return pushesResponse;
  }

  public async writeChangeset(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch: boolean = false): Promise<boolean> {
    const oldObjectId = await this.getOldObjectId(this.source, shouldCreateBranch);
    const { value } = await this.getItems();
    const tokensOnRemote = value?.map((val) => val.path) ?? [];
    const changesForUpdateOrCreate = Object.entries(changeset)
      .map(([path, content]) => {
        const formattedPath = path.startsWith('/') ? path : `/${path}`;
        return ({
          changeType: tokensOnRemote.includes(formattedPath) ? ChangeType.edit : ChangeType.add,
          item: {
            path: formattedPath,
          },
          newContent: {
            content,
            contentType: ContentType.rawtext,
          },
        });
      });

    // Create branch in remote if it does not already exist
    const existingBranches = await this.fetchBranches();
    if (!existingBranches.includes(branch)) {
      await this.createBranch(branch, this.previousSourceBranch);
    }

    if (!this.path.endsWith('.json')) {
      const jsonFiles = value?.filter((file) => (file.path?.endsWith('.json')))?.map((val) => val.path) ?? [];
      const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => jsonFile && jsonFile.endsWith(item)))
        .map((fileToDelete) => (fileToDelete ?? ''));
      const changesForDelete = filesToDelete.map((path) => {
        const formattedPath = path.startsWith('/') ? path : `/${path}`;
        return ({
          changeType: ChangeType.delete,
          item: {
            path: formattedPath,
          },
        });
      });
      const changes = changesForDelete.concat(changesForUpdateOrCreate);

      const response = await this.postPushes({
        branch,
        changes,
        commitMessage: message,
        oldObjectId,
      });

      return !!response;
    }

    const response = await this.postPushes({
      branch,
      changes: changesForUpdateOrCreate,
      commitMessage: message,
      oldObjectId,
    });
    return !!response;
  }
}
