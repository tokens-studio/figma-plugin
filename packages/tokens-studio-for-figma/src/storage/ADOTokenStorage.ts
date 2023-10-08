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

const apiVersion = 'api-version=6.0';

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
  gitResource: 'refs' | 'items' | 'pushes'
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

  protected source: string = 'main';

  constructor({
    baseUrl: orgUrl = '',
    secret,
    id: repositoryId,
    name: projectId,
  }: Pick<
  Extract<StorageTypeCredentials, { provider: StorageProviderType.ADO }>,
  'baseUrl' | 'secret' | 'id' | 'name'
  >) {
    super(secret, '', repositoryId, orgUrl);
    this.orgUrl = orgUrl;
    this.projectId = projectId;
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
    return res;
  }

  public async canWrite(): Promise<boolean> {
    if (!this.path.endsWith('.json') && !this.flags.multiFileEnabled) return false;

    const { status } = await this.fetchGit({
      gitResource: 'refs',
      orgUrl: this.orgUrl,
      params: {
        filter: 'heads',
      },
      projectId: this.projectId,
      repositoryId: this.repository,
      token: this.secret,
    });
    return status === 200;
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
    const branches = [];
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
    return shouldCreateBranch ? branches.get(this.source)?.objectId : branches.get(branch)?.objectId;
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
      return await response.json();
    } catch (e) {
      console.log(e);
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
    }
    return [];
  }

  private async postPushes({
    branch, changes, commitMessage = 'Commit from Figma', oldObjectId,
  }: PostPushesArgs): Promise<GitInterfaces.GitPush> {
    const response = await this.fetchGit({
      body: JSON.stringify({
        refUpdates: [
          {
            name: `refs/heads/${branch}`,
            oldObjectId,
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
    return response;
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
