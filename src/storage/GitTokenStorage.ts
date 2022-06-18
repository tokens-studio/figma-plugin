import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { RemoteTokenStorage, RemoteTokenStorageFile } from './RemoteTokenStorage';

type StorageFlags = {
  multiFileEnabled: boolean
};

export type GitStorageSaveOptions = {
  commitMessage?: string
};

export type GitStorageMetadata = {
  tokenSetOrder?: string[]
};

export type GitSingleFileObject = Record<string, (
  Record<string, SingleToken<false> | DeepTokensMap<false>>
)> & {
  $themes?: ThemeObjectsList
  $metadata?: GitStorageMetadata
};

export type GitMultiFileObject = AnyTokenSet<false> | ThemeObjectsList | GitStorageMetadata;

export abstract class GitTokenStorage extends RemoteTokenStorage<GitStorageMetadata, GitStorageSaveOptions> {
  protected secret: string;

  protected owner: string;

  protected repository: string;

  protected branch: string = 'main';

  protected path: string = '/';

  protected baseUrl: string | undefined = undefined;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl?: string,
  ) {
    super();
    this.secret = secret;
    this.owner = owner;
    this.repository = repository;
    this.baseUrl = baseUrl;
  }

  public selectBranch(branch: string) {
    this.branch = branch;
    return this;
  }

  public changePath(path: string) {
    this.path = path;
    return this;
  }

  public enableMultiFile() {
    this.flags.multiFileEnabled = true;
    return this;
  }

  public disableMultiFile() {
    this.flags.multiFileEnabled = false;
    return this;
  }

  public abstract fetchBranches(): Promise<string[]>;
  public abstract createBranch(branch: string, source?: string): Promise<boolean>;
  public abstract canWrite(): Promise<boolean>;
  public abstract writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch?: boolean
  ): Promise<boolean>;

  public async write(files: RemoteTokenStorageFile<GitStorageMetadata>[], saveOptions: GitStorageSaveOptions): Promise<boolean> {
    const branches = await this.fetchBranches();
    if (!branches) return false;

    const filesChangeset: Record<string, string> = {};
    if (this.path.endsWith('.json')) {
      filesChangeset[this.path] = JSON.stringify({
        ...files.reduce<GitSingleFileObject>((acc, file) => {
          if (file.type === 'tokenSet') {
            acc[file.name] = file.data;
          } else if (file.type === 'themes') {
            acc.$themes = [...acc.$themes ?? [], ...file.data];
          } else if (file.type === 'metadata') {
            acc.$metadata = file.data;
          }
          return acc;
        }, {}),
      }, null, 2);
    } else if (this.flags.multiFileEnabled) {
      files.forEach((file) => {
        if (file.type === 'tokenSet') {
          filesChangeset[`${this.path}/${file.name}.json`] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'themes') {
          filesChangeset[`${this.path}/$themes.json`] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'metadata') {
          filesChangeset[`${this.path}/$metadata.json`] = JSON.stringify(file.data, null, 2);
        }
      });
    }

    return this.writeChangeset(
      filesChangeset,
      saveOptions.commitMessage ?? 'Commit from Figma',
      this.branch,
      !branches.includes(this.branch),
    );
  }
}
