import { Buffer } from 'buffer';
import { t } from 'i18next';
import { GitTokenStorage } from './GitTokenStorage';
import { RemoteTokenStorageFile, RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import { AnyTokenSet } from '@/types/tokens';
import { ThemeObjectsList } from '@/types';
import { encodeGiteaPath, GiteaError, normalizeGiteaUrl } from './gitea';

type Repository = { default_branch: string; empty: boolean; permissions?: { push?: boolean } };
type Branch = { name: string; commit: { id: string; timestamp?: string } };
type Entry = { type: string; path: string; sha: string; content?: string; encoding?: string; lfs_oid?: string };
type StoredFile = { sha: string; content: string; managed: boolean };
type Mutation = { operation: 'create' | 'update' | 'delete'; path: string; content?: string; sha?: string };

// Survives client recreation by provider hooks. Only a successful pull clears an uncertain mutation.
const uncertainWrites = new Set<string>();

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isBranch(value: unknown): value is Branch {
  return isObject(value) && typeof value.name === 'string' && !!value.name
    && isObject(value.commit) && typeof value.commit.id === 'string' && !!value.commit.id;
}

function isTokenSet(value: unknown, inheritedType = false): boolean {
  if (!isObject(value)) return false;
  const hasType = inheritedType || typeof value.type === 'string' || typeof value.$type === 'string';
  if (('value' in value || '$value' in value) && hasType) return true;
  return Object.values(value).some((child) => isTokenSet(child, hasType));
}

function validatePath(path: unknown): asserts path is string {
  if (typeof path !== 'string' || path.startsWith('/') || path.split('/').some((part) => part === '.' || part === '..') || path.includes('\\')) {
    throw new GiteaError('malformed');
  }
}

export class GiteaTokenStorage extends GitTokenStorage {
  public defaultBranch = 'main';

  public lastCommitSha?: string;

  private expectedCommitSha?: string;

  private readonly api: string;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl: string,
    expectedCommitSha?: string,
    private readonly previousSourceBranch?: string,
  ) {
    super(secret, owner, repository, normalizeGiteaUrl(baseUrl));
    this.api = `${this.baseUrl}/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
    this.expectedCommitSha = expectedCommitSha;
  }

  private get identity() {
    return `${this.api}/${this.branch}/${this.path}`;
  }

  private async request<T>(suffix: string, body?: unknown, attempt = 0): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${this.api}${suffix}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          Authorization: `token ${this.secret}`,
          Accept: 'application/json',
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        if (body !== undefined && (response.status >= 500 || response.status === 408)) throw new GiteaError('uncertain', response.status);
        if (response.status === 401) throw new GiteaError('authentication', 401);
        if (response.status === 403) throw new GiteaError('permission', 403);
        if (response.status === 404) throw new GiteaError('not-found', 404);
        if (response.status === 429) throw new GiteaError('rate-limit', 429);
        if (response.status >= 500) throw new GiteaError('server', response.status);
        throw new GiteaError('conflict', response.status);
      }
      try {
        // Contents listing is unpaginated in Gitea 1.25. Never accept a partial listing.
        if (response.headers.get('link')?.includes('rel="next"') && !suffix.startsWith('/branches?')) throw new GiteaError('malformed');
        return (await response.json()) as T;
      } catch (error) {
        throw new GiteaError(body === undefined ? 'malformed' : 'uncertain');
      }
    } catch (error) {
      const failure = error instanceof GiteaError ? error : new GiteaError(body === undefined ? 'transport' : 'uncertain');
      if (failure.code === 'uncertain') uncertainWrites.add(this.identity);
      // Safe reads only; mutations can have committed even when no response is readable.
      if (body === undefined && attempt < 1 && (failure.code === 'transport' || failure.code === 'server')) {
        return this.request<T>(suffix, undefined, attempt + 1);
      }
      throw failure;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async repositoryInfo() {
    const repo = await this.request<Repository>('');
    if (!isObject(repo) || typeof repo.default_branch !== 'string' || typeof repo.empty !== 'boolean'
      || (!repo.empty && !repo.default_branch)
      || (repo.permissions !== undefined && (!isObject(repo.permissions)
        || (repo.permissions.push !== undefined && typeof repo.permissions.push !== 'boolean')))) {
      throw new GiteaError('malformed');
    }
    this.defaultBranch = repo.default_branch;
    if (repo.empty) {
      throw new Error(
        t('storage:giteaEmptyRepository', {
          defaultValue: 'Initialize the Gitea repository with a first commit and branch before connecting.',
        }),
      );
    }
    return repo;
  }

  private async branchInfo(branch = this.branch) {
    const result = await this.request<Branch>(`/branches/${encodeURIComponent(branch)}`);
    if (!isBranch(result) || result.name !== branch) throw new GiteaError('malformed');
    return result;
  }

  public async getCommitSha(): Promise<string> {
    return (await this.branchInfo()).commit.id;
  }

  public async getLatestCommitDate(): Promise<Date | null> {
    const { timestamp } = (await this.branchInfo()).commit;
    return timestamp ? new Date(timestamp) : null;
  }

  public async fetchBranches(): Promise<string[]> {
    await this.repositoryInfo();
    const names: string[] = [];
    // Stop on an empty page, rather than assuming the server honored our requested limit.
    for (let page = 1; page <= 1000; page += 1) {
      const result = await this.request<Branch[]>(`/branches?limit=100&page=${page}`);
      if (!Array.isArray(result) || result.some((branch) => !isObject(branch) || typeof branch.name !== 'string' || !branch.name)) {
        throw new GiteaError('malformed');
      }
      if (!result.length) return names;
      const pageNames = result.map((branch) => branch.name);
      if (new Set(pageNames).size !== pageNames.length || pageNames.some((name) => names.includes(name))) throw new GiteaError('malformed');
      names.push(...pageNames);
    }
    throw new GiteaError('malformed');
  }

  public async createBranch(branch: string, source = this.branch): Promise<boolean> {
    if (uncertainWrites.has(this.identity)) throw new GiteaError('uncertain');
    const result = await this.request<Branch>('/branches', { new_branch_name: branch, old_branch_name: source });
    if (!isBranch(result) || result.name !== branch) {
      uncertainWrites.add(this.identity);
      throw new GiteaError('uncertain');
    }
    return true;
  }

  public async canWrite(): Promise<boolean> {
    if (!this.path.endsWith('.json') && !this.flags.multiFileEnabled) return false;
    return (await this.repositoryInfo()).permissions?.push === true;
  }

  private async loadFiles(ref: string): Promise<Map<string, StoredFile>> {
    validatePath(this.path);
    const entries: Entry[] = [];
    const visit = async (path: string, root = false): Promise<void> => {
      let result: Entry | Entry[];
      try {
        result = await this.request<Entry | Entry[]>(
          `/contents${path ? `/${encodeGiteaPath(path)}` : ''}?ref=${encodeURIComponent(ref)}`,
        );
      } catch (error) {
        // Repo and ref have already been checked independently by caller.
        if (root && error instanceof GiteaError && error.status === 404) return;
        throw error;
      }
      if (Array.isArray(result)) {
        if (this.path.endsWith('.json')) throw new GiteaError('malformed');
        for (const entry of result) {
          if (!isObject(entry) || !['file', 'dir', 'symlink', 'submodule'].includes(entry.type)) throw new GiteaError('malformed');
          validatePath(entry.path);
          const prefix = path ? `${path}/` : '';
          if (!entry.path.startsWith(prefix) || entry.path.slice(prefix.length).includes('/')) throw new GiteaError('malformed');
          if (entry.type === 'dir') await visit(entry.path);
          else if (entry.type === 'file' && entry.path.endsWith('.json')) await visit(entry.path);
        }
      } else if (isObject(result) && result.type === 'file' && result.path === path && typeof result.sha === 'string' && result.sha) {
        if ((root && !this.path.endsWith('.json')) || result.encoding !== 'base64' || typeof result.content !== 'string' || result.lfs_oid) throw new GiteaError('malformed');
        entries.push(result);
      } else if (!(isObject(result) && result.path === path && ['symlink', 'submodule'].includes(result.type))) {
        throw new GiteaError('malformed');
      }
    };
    await visit(this.path, true);
    const files = new Map<string, StoredFile>();
    const parsed = new Map<string, unknown>();
    for (const entry of entries) {
      try {
        const content = Buffer.from(entry.content!, 'base64').toString('utf8');
        parsed.set(entry.path, JSON.parse(content));
        files.set(entry.path, { sha: entry.sha, content, managed: this.path.endsWith('.json') });
      } catch (error) {
        throw new GiteaError('malformed');
      }
    }
    if (!this.path.endsWith('.json')) {
      const metadataPath = this.path ? `${this.path}/$metadata.json` : '$metadata.json';
      const metadata = parsed.get(metadataPath);
      const order = isObject(metadata) && Array.isArray(metadata.tokenSetOrder) ? metadata.tokenSetOrder : [];
      parsed.forEach((data, path) => {
        const name = path.slice(this.path ? this.path.length + 1 : 0, -5);
        const managed = name === '$themes' || name === '$metadata' || isTokenSet(data) || order.includes(name);
        files.get(path)!.managed = managed;
      });
    }
    return files;
  }

  public async read(): Promise<RemoteTokenStorageFile[]> {
    await this.repositoryInfo();
    const ref = await this.getCommitSha();
    const files = await this.loadFiles(ref);
    const result: RemoteTokenStorageFile[] = [];
    for (const [path, file] of [...files].filter(([, entry]) => entry.managed)) {
      const data = JSON.parse(file.content);
      if (this.path.endsWith('.json')) {
        if (!isObject(data)) throw new GiteaError('malformed');
        Object.entries(data).forEach(([name, value]) => {
          if (name === '$themes') {
            if (!Array.isArray(value)) throw new GiteaError('malformed');
            result.push({ type: 'themes', path, data: value as ThemeObjectsList });
          } else if (name === '$metadata') {
            if (!isObject(value)) throw new GiteaError('malformed');
            result.push({ type: 'metadata', path, data: value as RemoteTokenStorageMetadata });
          } else {
            if (!isObject(value)) throw new GiteaError('malformed');
            result.push({
              type: 'tokenSet', path, name, data: value as AnyTokenSet<false>,
            });
          }
        });
      } else {
        const name = path.slice(this.path ? this.path.length + 1 : 0, -5);
        if (name === '$themes') {
          if (!Array.isArray(data)) throw new GiteaError('malformed');
          result.push({ type: 'themes', path, data });
        } else if (name === '$metadata') {
          if (!isObject(data)) throw new GiteaError('malformed');
          result.push({ type: 'metadata', path, data });
        } else {
          if (!isObject(data)) throw new GiteaError('malformed');
          result.push({
            type: 'tokenSet', path, name, data: data as AnyTokenSet<false>,
          });
        }
      }
    }
    this.lastCommitSha = ref;
    this.expectedCommitSha = ref;
    uncertainWrites.delete(this.identity);
    return result;
  }

  public async writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch = false,
  ): Promise<boolean> {
    if (uncertainWrites.has(this.identity)) throw new GiteaError('uncertain');
    await this.repositoryInfo();
    const source = shouldCreateBranch ? this.previousSourceBranch || this.defaultBranch : branch;
    const head = (await this.branchInfo(source)).commit.id;
    if (!this.expectedCommitSha || head !== this.expectedCommitSha) throw new GiteaError('conflict');
    const current = await this.loadFiles(head);
    const operations: Mutation[] = [];
    for (const [path, content] of Object.entries(changeset)) {
      validatePath(path);
      if (this.path.endsWith('.json') ? path !== this.path : this.path && !path.startsWith(`${this.path}/`)) throw new GiteaError('malformed');
      const previous = current.get(path);
      // Do not claim unrelated JSON files just because a token set has the same name.
      if (previous && !previous.managed) throw new GiteaError('conflict');
      if (previous?.content !== content) {
        operations.push({
          operation: previous ? 'update' : 'create',
          path,
          content: Buffer.from(content, 'utf8').toString('base64'),
          ...(previous ? { sha: previous.sha } : {}),
        });
      }
    }
    if (!this.path.endsWith('.json')) {
      current.forEach((file, path) => {
        if (file.managed && !Object.prototype.hasOwnProperty.call(changeset, path)) operations.push({ operation: 'delete', path, sha: file.sha });
      });
    }
    // The API has per-file SHA preconditions, not a branch revision CAS. Verify again to narrow the race.
    if ((await this.branchInfo(source)).commit.id !== head) throw new GiteaError('conflict');
    if (!operations.length && !shouldCreateBranch) {
      this.lastCommitSha = head;
      return true;
    }
    if (!operations.length) {
      await this.createBranch(branch, source);
      this.lastCommitSha = head;
      return true;
    }
    const result = await this.request<{ commit: { sha: string } }>('/contents', {
      branch: source,
      ...(shouldCreateBranch ? { new_branch: branch } : {}),
      message,
      files: operations,
    });
    if (!isObject(result) || !isObject(result.commit) || typeof result.commit.sha !== 'string' || !result.commit.sha) {
      uncertainWrites.add(this.identity);
      throw new GiteaError('uncertain');
    }
    this.lastCommitSha = result.commit.sha;
    this.expectedCommitSha = result.commit.sha;
    return true;
  }
}
