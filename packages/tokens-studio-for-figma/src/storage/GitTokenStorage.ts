import { DeepTokensMap, ThemeObjectsList } from '@/types';
import { AnyTokenSet, SingleToken } from '@/types/tokens';
import { SystemFilenames } from '@/constants/SystemFilenames';
import { joinPath } from '@/utils/string';
import { RemoteTokenStorage, RemoteTokenStorageFile, RemoteTokenStorageMetadata } from './RemoteTokenStorage';
import { ErrorMessages } from '@/constants/ErrorMessages';

type StorageFlags = {
  multiFileEnabled: boolean
};

export type GitStorageSaveOptions = {
  commitMessage?: string,
};

export type GitStorageSaveOption = {
  commitMessage?: string,
  storeTokenIdInJsonEditor: boolean,
  useDeltaDiff?: boolean,
  lastSyncedState?: string
};

export type GitSingleFileObject = Record<string, (
  Record<string, SingleToken<false> | DeepTokensMap<false>>
)> & {
  $themes?: ThemeObjectsList
  $metadata?: RemoteTokenStorageMetadata
};

export type GitMultiFileObject = AnyTokenSet<false> | ThemeObjectsList | RemoteTokenStorageMetadata;

export abstract class GitTokenStorage extends RemoteTokenStorage<GitStorageSaveOptions, GitStorageSaveOption> {
  protected secret: string;

  protected owner: string;

  protected repository: string;

  protected branch: string = 'main';

  protected path: string = '';

  protected baseUrl: string | undefined = undefined;

  protected flags: StorageFlags = {
    multiFileEnabled: false,
  };

  protected username: string | undefined = undefined;

  constructor(
    secret: string,
    owner: string,
    repository: string,
    baseUrl?: string,
    username?: string,
  ) {
    super();
    this.secret = secret;
    this.owner = owner;
    this.repository = repository;
    this.baseUrl = baseUrl;
    this.username = username;
  }

  public selectBranch(branch: string) {
    this.branch = branch;
    return this;
  }

  public changePath(path: string) {
    this.path = joinPath(path);
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

  public writeChangesetWithDiff?(
    files: RemoteTokenStorageFile[],
    message: string,
    branch: string,
    shouldCreateBranch?: boolean,
    lastSyncedState?: string
  ): Promise<boolean>;

  public async write(files: RemoteTokenStorageFile[], saveOptions: GitStorageSaveOption): Promise<boolean> {
    const branches = await this.fetchBranches();
    if (!branches.length) return false;

    console.log('📦 GitTokenStorage: Starting write operation...');
    console.log(`   🔧 Delta diff enabled: ${!!saveOptions.useDeltaDiff}`);
    console.log(`   🧠 lastSyncedState available: ${!!saveOptions.lastSyncedState}`);
    console.log(`   📁 Multi-file enabled: ${this.flags.multiFileEnabled}`);
    console.log(`   📄 Path: ${this.path}`);
    console.log(`   🌿 Branch: ${this.branch}`);

    // Check if delta diff is enabled and supported
    if (saveOptions.useDeltaDiff && this.writeChangesetWithDiff) {
      console.log('⚡ GitTokenStorage: Using delta diff mode for optimized sync');
      return this.writeChangesetWithDiff(
        files,
        saveOptions.commitMessage ?? 'Commit from Figma',
        this.branch,
        !branches.includes(this.branch),
        saveOptions.lastSyncedState,
      );
    }

    // Fallback to traditional full sync
    console.log('🔄 GitTokenStorage: Using traditional full sync mode');
    const filesChangeset: Record<string, string> = {};
    if (this.path.endsWith('.json')) {
      console.log('📄 GitTokenStorage: Single file mode');
      filesChangeset[this.path] = JSON.stringify({
        ...files.reduce<GitSingleFileObject>((acc, file) => {
          if (file.type === 'tokenSet') {
            acc[file.name] = file.data;
          } else if (file.type === 'themes') {
            acc.$themes = [...acc.$themes ?? [], ...file.data];
          } else if (file.type === 'metadata') {
            acc.$metadata = { ...acc.$metadata ?? {}, ...file.data };
          }
          return acc;
        }, {}),
      }, null, 2);
    } else if (this.flags.multiFileEnabled) {
      console.log('📁 GitTokenStorage: Multi-file mode');
      files.forEach((file) => {
        if (file.type === 'tokenSet') {
          filesChangeset[joinPath(this.path, `${file.name}.json`)] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'themes') {
          filesChangeset[joinPath(this.path, `${SystemFilenames.THEMES}.json`)] = JSON.stringify(file.data, null, 2);
        } else if (file.type === 'metadata') {
          filesChangeset[joinPath(this.path, `${SystemFilenames.METADATA}.json`)] = JSON.stringify(file.data, null, 2);
        }
      });
    } else {
      console.log('❌ GitTokenStorage: Multi-file disabled but path is directory - this will fail');
      throw new Error(ErrorMessages.GIT_MULTIFILE_PERMISSION_ERROR);
    }
    
    console.log(`📤 GitTokenStorage: Traditional sync pushing ${Object.keys(filesChangeset).length} files`);
    console.log(`   📋 Files: ${Object.keys(filesChangeset).join(', ')}`);
    
    return this.writeChangeset(
      filesChangeset,
      saveOptions.commitMessage ?? 'Commit from Figma',
      this.branch,
      !branches.includes(this.branch),
    );
  }
}
