import { Gitlab } from '@gitbeaker/browser';
import compact from 'just-compact';
import type { CommitAction } from '@gitbeaker/core/dist/types/resources/Commits';
import IsJSONString from '@/utils/isJSONString';
import {
  GitMultiFileObject, GitSingleFileObject, GitTokenStorage,
} from './GitTokenStorage';
import { RemoteTokenstorageErrorMessage, RemoteTokenStorageFile, RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { ErrorMessages } from '@/constants/ErrorMessages';

enum GitLabAccessLevel {
  NoAccess = 0,
  MinimalAccess = 5,
  Guest = 10,
  Reporter = 20,
  Developer = 30,
  Maintainer = 40,
  Owner = 50,
}

export class GitlabTokenStorage extends GitTokenStorage {
  protected projectId: number | null = null;

  protected groupId: number | null = null;

  private gitlabClient: (typeof Gitlab)['prototype'];

  protected repoPathWithNamespace: string;

  constructor(
    secret: string,
    repository: string,
    repoPathWithNamespace: string,
    baseUrl?: string,
  ) {
    super(secret, '', repository, baseUrl);

    this.repoPathWithNamespace = repoPathWithNamespace;
    this.gitlabClient = new Gitlab({
      token: this.secret,
      host: this.baseUrl || undefined,
    });
  }

  public async assignProjectId() {
    const projects = await this.gitlabClient.Projects.search(this.repository, { membership: true });
    if (projects) {
      const project = projects.filter((p) => p.path_with_namespace === this.repoPathWithNamespace)[0];
      if (project) {
        this.projectId = project.id;
        this.groupId = project.namespace.id;
      }
    }

    if (!this.projectId) {
      throw new Error('Project not accessible');
    }
    return this;
  }

  public async fetchBranches() {
    if (!this.projectId) throw new Error('Project ID not assigned');
    const branches = await this.gitlabClient.Branches.all(this.projectId);
    return branches.map((branch) => branch.name);
  }

  public async createBranch(branch: string, source?: string) {
    if (!this.projectId) throw new Error('Project ID not assigned');
    try {
      const response = await this.gitlabClient.Branches.create(
        this.projectId,
        branch,
        `heads/${source || this.branch}`,
      );
      return !!response.name;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public async canWrite(): Promise<boolean> {
    if (!this.path.endsWith('.json') && !this.flags.multiFileEnabled) return false;
    if (!this.projectId) throw new Error('Project ID not assigned');

    const currentUser = await this.gitlabClient.Users.current();
    try {
      if (!currentUser || currentUser.state !== 'active') return false;
      const projectPermission = await this.gitlabClient.ProjectMembers.show(this.projectId, currentUser.id, {
        includeInherited: true,
      });
      return projectPermission.access_level >= GitLabAccessLevel.Developer;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    if (!this.projectId) throw new Error('Missing Project ID');

    try {
      const trees = await this.gitlabClient.Repositories.tree(this.projectId, {
        path: this.path,
        ref: this.branch,
        recursive: true,
      });

      if (!this.path.endsWith('.json')) {
        const jsonFiles = trees.filter((file) => (
          file.path.endsWith('.json')
        )).sort((a, b) => (
          (a.path && b.path) ? a.path.localeCompare(b.path) : 0
        ));

        const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => (
          this.gitlabClient.RepositoryFiles.showRaw(this.projectId!, treeItem.path, { ref: this.branch })
        )));

        return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
          const { path } = jsonFiles[index];
          if (IsJSONString(fileContent)) {
            const name = path.replace('.json', '').replace(this.path, '').replace(/^\//, '').replace(/\/$/, '');
            const parsed = JSON.parse(fileContent) as GitMultiFileObject;

            if (name === SystemFilenames.THEMES) {
              return {
                path,
                type: 'themes',
                data: parsed as ThemeObjectsList,
              };
            }

            if (name === SystemFilenames.METADATA) {
              return {
                path,
                type: 'metadata',
                data: parsed as RemoteTokenStorageMetadata,
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

      const data = await this.gitlabClient.RepositoryFiles.showRaw(this.projectId, this.path, { ref: this.branch });
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
    } catch (err) {
      // Raise error (usually this is an auth error)
      console.error(err);
    }
    return [];
  }

  public async writeChangeset(changeset: Record<string, string>, message: string, branch: string, shouldCreateBranch?: boolean): Promise<boolean> {
    if (!this.projectId) throw new Error('Missing Project ID');

    const branches = await this.fetchBranches();

    const rootPath = this.path.endsWith('.json')
      ? this.path.split('/').slice(0, -1).join('/')
      : this.path;
    const tree = await this.gitlabClient.Repositories.tree(this.projectId, {
      path: rootPath,
      ref: branch,
      recursive: true,
    });
    const jsonFiles = tree.filter((file) => (
      file.path.endsWith('.json')
    )).sort((a, b) => (
      (a.path && b.path) ? a.path.localeCompare(b.path) : 0
    )).map((jsonFile) => jsonFile.path);

    let gitlabActions: CommitAction[] = Object.entries(changeset).map(([filePath, content]) => ({
      action: jsonFiles.includes(filePath) ? 'update' : 'create',
      filePath,
      content,
    }));

    if (!this.path.endsWith('.json')) {
      const filesToDelete = jsonFiles.filter((jsonFile) => !Object.keys(changeset).some((item) => item.endsWith(jsonFile)));
      gitlabActions = gitlabActions.concat(filesToDelete.map((filePath) => ({
        action: 'delete',
        filePath,
      })));
    }

    const response = await this.gitlabClient.Commits.create(
      this.projectId,
      branch,
      message,
      gitlabActions,
      shouldCreateBranch ? {
        startBranch: branches[0],
      } : undefined,
    );
    return !!response;
  }

  public async getLatestCommitDate(): Promise<Date | null> {
    if (!this.projectId) throw new Error('Missing Project ID');

    try {
      if (!this.path.endsWith('.json')) {
        const trees = await this.gitlabClient.Repositories.tree(this.projectId, {
          path: this.path,
          ref: this.branch,
          recursive: true,
        });
        const jsonFiles = trees.filter((file) => (
          file.path.endsWith('.json')
        )).sort((a, b) => (
          (a.path && b.path) ? a.path.localeCompare(b.path) : 0
        ));

        const file = await this.gitlabClient.RepositoryFiles.show(this.projectId!, jsonFiles[0].path, this.branch);
        const commit = await this.gitlabClient.Commits.show(this.projectId, file.commit_id);
        return commit.committed_date ?? null;
      }
      const file = await this.gitlabClient.RepositoryFiles.show(this.projectId, this.path, this.branch);
      const commit = await this.gitlabClient.Commits.show(this.projectId, file.commit_id);
      return commit.committed_date ?? null;
    } catch (e) {
      console.error('Error', e);
      return null;
    }
  }
}
