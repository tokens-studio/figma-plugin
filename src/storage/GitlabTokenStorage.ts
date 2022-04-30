import { Gitlab } from '@gitbeaker/browser';
import compact from 'just-compact';
import IsJSONString from '@/utils/isJSONString';
import {
  GitMultiFileObject, GitSingleFileObject, GitStorageMetadata, GitTokenStorage,
} from './GitTokenStorage';
import { RemoteTokenStorageFile } from './RemoteTokenStorage';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';

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

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl?: string,
  ) {
    super(secret, owner, repository, baseUrl);

    this.gitlabClient = new Gitlab({
      token: this.secret,
      host: this.baseUrl || undefined,
    });
  }

  public async assignProjectId() {
    const users = await this.gitlabClient.Users.username(this.owner);

    if (Array.isArray(users) && users.length > 0) {
      const projectsInPerson = await this.gitlabClient.Users.projects(users[0].id);
      const project = projectsInPerson.filter((p) => p.path === this.repository)[0];
      if (project) {
        this.projectId = project.id;
        this.groupId = project.namespace.id;
      }
    }

    if (!this.projectId) {
      const projectsInGroup = await this.gitlabClient.Groups.projects(this.owner);
      const project = projectsInGroup.filter((p) => p.path === this.repository)[0];
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
    try {
      if (!this.projectId) throw new Error('Project ID not assigned');
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
    if (!this.groupId || !this.projectId) throw new Error('Missing Project or Group ID');

    const currentUser = await this.gitlabClient.Users.current();

    try {
      if (!currentUser || currentUser.state !== 'active') return false;

      const groupPermission = await this.gitlabClient.GroupMembers.show(this.groupId, currentUser.id);
      return groupPermission.access_level >= GitLabAccessLevel.Developer;
    } catch (e) {
      try {
        const projectPermission = await this.gitlabClient.ProjectMembers.show(this.projectId, currentUser.id);
        return projectPermission.access_level >= GitLabAccessLevel.Developer;
      } catch (e) {
        console.error(e);
      }
    }

    return false;
  }

  public async read(): Promise<RemoteTokenStorageFile<GitStorageMetadata>[]> {
    if (!this.projectId) throw new Error('Missing Project ID');

    try {
      const trees = await this.gitlabClient.Repositories.tree(this.projectId, {
        path: this.path,
        ref: this.branch,
      });

      if (trees.length > 0 && this.flags.multiFileEnabled) {
        const jsonFiles = trees.filter((file) => (
          file.path.endsWith('.json')
        )).sort((a, b) => (
          (a.path && b.path) ? a.path.localeCompare(b.path) : 0
        ));

        const jsonFileContents = await Promise.all(jsonFiles.map((treeItem) => (
          this.gitlabClient.RepositoryFiles.showRaw(this.projectId!, treeItem.path, { ref: this.branch })
        )));

        return compact(jsonFileContents.map<RemoteTokenStorageFile<GitStorageMetadata> | null>((fileContent, index) => {
          const { path } = jsonFiles[index];
          if (IsJSONString(fileContent)) {
            const name = path.replace('.json', '').replace(this.path, '').replace(/^\//, '').replace(/\/$/, '');
            const parsed = JSON.parse(fileContent) as GitMultiFileObject;

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
      const data = await this.gitlabClient.RepositoryFiles.showRaw(this.projectId, this.path, { ref: this.branch });
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
    });
    const filesInTrees = tree.map((t) => t.path);

    const response = await this.gitlabClient.Commits.create(
      this.projectId,
      branch,
      message,
      Object.entries(changeset).map(([filePath, content]) => ({
        action: filesInTrees.includes(filePath) ? 'update' : 'create',
        filePath,
        content,
      })),
      shouldCreateBranch ? {
        startBranch: branches[0],
      } : undefined,
    );

    return !!response;
  }
}
