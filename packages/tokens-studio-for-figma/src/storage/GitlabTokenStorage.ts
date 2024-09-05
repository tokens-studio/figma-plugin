import { Gitlab } from '@gitbeaker/rest';
import compact from 'just-compact';
import type { CommitAction } from '@gitbeaker/rest';
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

  protected source?: string;

  protected previousSourceBranch?: string;

  constructor(
    secret: string,
    repository: string,
    repoPathWithNamespace: string,
    baseUrl?: string,
    branch = 'main',
    previousSourceBranch = 'main',
  ) {
    super(secret, '', repository, baseUrl);

    this.repoPathWithNamespace = repoPathWithNamespace;
    this.gitlabClient = new Gitlab({
      token: this.secret,
      host: this.baseUrl || undefined,
      rateLimits: {
        // 4 requests per second = 250 requests per minute (GitLab API limit for raw endpoints: https://docs.gitlab.com/ee/administration/settings/rate_limits_on_raw_endpoints.html)
        '/projects/*/repository/files/*/raw': 4,
      },
    });
    this.source = branch;
    this.previousSourceBranch = previousSourceBranch;
  }

  public async assignProjectId() {
    const projects = await this.gitlabClient.Projects.all({
      membership: true,
      search: this.repository,
      simple: true,
    });
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

    const currentUser = await this.gitlabClient.Users.showCurrentUser();
    try {
      if (!currentUser || currentUser.state !== 'active') return false;
      const projectPermission = await this.gitlabClient.ProjectMembers.show(this.projectId, currentUser.id, {
        includeInherited: true,
      });
      return Number(projectPermission.access_level.toString()) >= GitLabAccessLevel.Developer;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  public async read(): Promise<RemoteTokenStorageFile[] | RemoteTokenstorageErrorMessage> {
    if (!this.projectId) throw new Error('Missing Project ID');

    try {
      if (!this.path.endsWith('.json')) {
        const trees = await this.gitlabClient.Repositories.allRepositoryTrees(this.projectId, {
          path: this.path,
          ref: this.branch,
          recursive: true,
        });

        const jsonFiles = trees.filter((file) => (
          file.path.endsWith('.json')
        )).sort((a, b) => (
          (a.path && b.path) ? a.path.localeCompare(b.path) : 0
        ));

        const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => (
          this.gitlabClient.RepositoryFiles.showRaw(this.projectId!, treeItem.path, this.branch)
        )));

        return compact(jsonFileContents.map<RemoteTokenStorageFile | null>((fileContent, index) => {
          const { path } = jsonFiles[index];
          if (typeof fileContent === 'string' && IsJSONString(fileContent)) {
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

      const data = await this.gitlabClient.RepositoryFiles.showRaw(this.projectId, this.path, this.branch);
      const stringData = typeof data === 'string' ? data : await data.text();

      if (IsJSONString(stringData)) {
        const parsed = JSON.parse(stringData) as GitSingleFileObject;
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
    if (shouldCreateBranch && !branches.includes(branch)) {
      const sourceBranch = this.previousSourceBranch || this.source;
      await this.createBranch(branch, sourceBranch);
    }
    // Directories cannot be created empty (Source: https://gitlab.com/gitlab-org/gitlab/-/issues/247503)
    const pathToCreate = this.path.endsWith('.json') ? this.path : `${this.path}/.gitkeep`;
    try {
      await this.gitlabClient.RepositoryFiles.show(this.projectId, pathToCreate, branch);
    } catch (e) {
      await this.gitlabClient.RepositoryFiles.create(
        this.projectId,
        pathToCreate,
        branch,
        '{}',
        'Initial commit',
      );
    }

    const tree = await this.gitlabClient.Repositories.allRepositoryTrees(this.projectId, {
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

    try {
      const response = await this.gitlabClient.Commits.create(
        this.projectId,
        branch,
        message,
        gitlabActions,
      );
      return !!response;
    } catch (e: any) {
      if (e.cause.description && String(e.cause.description).includes(ErrorMessages.GITLAB_PUSH_TO_PROTECTED_BRANCH_ERROR)) {
        throw new Error(ErrorMessages.GITLAB_PUSH_TO_PROTECTED_BRANCH_ERROR);
      }
      throw new Error(e);
    }
  }

  public async getLatestCommitDate(): Promise<Date | null> {
    if (!this.projectId) throw new Error('Missing Project ID');

    try {
      if (!this.path.endsWith('.json')) {
        const trees = await this.gitlabClient.Repositories.allRepositoryTrees(this.projectId, {
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
        const commit = await this.gitlabClient.Commits.show(this.projectId, file.commit_id.toString());
        const committedDate = new Date(commit.committed_date?.toString() ?? '');
        return committedDate ?? null;
      }
      const file = await this.gitlabClient.RepositoryFiles.show(this.projectId, this.path, this.branch);
      const commit = await this.gitlabClient.Commits.show(this.projectId, file.commit_id.toString());
      const committedDate = new Date(commit.committed_date?.toString() ?? '');
      return committedDate ?? null;
    } catch (e) {
      console.error('Error', e);
      return null;
    }
  }
}
