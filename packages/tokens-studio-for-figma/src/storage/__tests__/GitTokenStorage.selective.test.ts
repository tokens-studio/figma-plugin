import { GitTokenStorage, GitStorageSaveOption } from '../GitTokenStorage';
import { RemoteTokenStorageFile } from '../RemoteTokenStorage';

// Mock implementation for testing
class MockGitTokenStorage extends GitTokenStorage {
  public writeChangesetCalls: Array<{
    changeset: Record<string, string>;
    message: string;
    branch: string;
    shouldCreateBranch?: boolean;
  }> = [];

  async fetchBranches(): Promise<string[]> {
    return ['main'];
  }

  async createBranch(branch: string, source?: string): Promise<boolean> {
    return true;
  }

  async canWrite(): Promise<boolean> {
    return true;
  }

  async writeChangeset(
    changeset: Record<string, string>,
    message: string,
    branch: string,
    shouldCreateBranch?: boolean
  ): Promise<boolean> {
    this.writeChangesetCalls.push({ changeset, message, branch, shouldCreateBranch });
    return true;
  }
}

describe('GitTokenStorage with selective sync', () => {
  let storage: MockGitTokenStorage;

  beforeEach(() => {
    storage = new MockGitTokenStorage('secret', 'owner', 'repo');
    storage.enableMultiFile();
    storage.changePath('tokens');
  });

  const mockFiles: RemoteTokenStorageFile[] = [
    {
      type: 'tokenSet',
      name: 'global',
      path: 'global.json',
      data: { color1: { value: '#ff0000', type: 'color' } },
    },
    {
      type: 'tokenSet',
      name: 'colors',
      path: 'colors.json',
      data: { color2: { value: '#00ff00', type: 'color' } },
    },
    {
      type: 'themes',
      path: '$themes.json',
      data: [{ id: 'theme1', name: 'Theme 1', selectedTokenSets: {}, group: '', $figmaStyleReferences: {} }],
    },
    {
      type: 'metadata',
      path: '$metadata.json',
      data: { tokenSetOrder: ['global', 'colors'] },
    },
  ];

  it('should push all files when changedFiles is not provided', async () => {
    const saveOptions: GitStorageSaveOption = {
      commitMessage: 'Test commit',
      storeTokenIdInJsonEditor: false,
    };

    await storage.write(mockFiles, saveOptions);

    expect(storage.writeChangesetCalls).toHaveLength(1);
    const changeset = storage.writeChangesetCalls[0].changeset;
    
    // Should include all files
    expect(changeset['tokens/global.json']).toBeDefined();
    expect(changeset['tokens/colors.json']).toBeDefined();
    expect(changeset['tokens/$themes.json']).toBeDefined();
    expect(changeset['tokens/$metadata.json']).toBeDefined();
  });

  it('should push only changed files when changedFiles is provided', async () => {
    const saveOptions: GitStorageSaveOption = {
      commitMessage: 'Test commit',
      storeTokenIdInJsonEditor: false,
      changedFiles: new Set(['global', '$themes']),
    };

    await storage.write(mockFiles, saveOptions);

    expect(storage.writeChangesetCalls).toHaveLength(1);
    const changeset = storage.writeChangesetCalls[0].changeset;
    
    // Should include only changed files
    expect(changeset['tokens/global.json']).toBeDefined();
    expect(changeset['tokens/$themes.json']).toBeDefined();
    
    // Should not include unchanged files
    expect(changeset['tokens/colors.json']).toBeUndefined();
    expect(changeset['tokens/$metadata.json']).toBeUndefined();
  });

  it('should push only metadata when only metadata changed', async () => {
    const saveOptions: GitStorageSaveOption = {
      commitMessage: 'Test commit',
      storeTokenIdInJsonEditor: false,
      changedFiles: new Set(['$metadata']),
    };

    await storage.write(mockFiles, saveOptions);

    expect(storage.writeChangesetCalls).toHaveLength(1);
    const changeset = storage.writeChangesetCalls[0].changeset;
    
    // Should include only metadata
    expect(changeset['tokens/$metadata.json']).toBeDefined();
    
    // Should not include other files
    expect(changeset['tokens/global.json']).toBeUndefined();
    expect(changeset['tokens/colors.json']).toBeUndefined();
    expect(changeset['tokens/$themes.json']).toBeUndefined();
  });

  it('should push no files when changedFiles is empty', async () => {
    const saveOptions: GitStorageSaveOption = {
      commitMessage: 'Test commit',
      storeTokenIdInJsonEditor: false,
      changedFiles: new Set(),
    };

    await storage.write(mockFiles, saveOptions);

    expect(storage.writeChangesetCalls).toHaveLength(1);
    const changeset = storage.writeChangesetCalls[0].changeset;
    
    // Should include no files
    expect(Object.keys(changeset)).toHaveLength(0);
  });

  it('should work correctly with single file mode', async () => {
    const singleFileStorage = new MockGitTokenStorage('secret', 'owner', 'repo');
    singleFileStorage.changePath('tokens.json');

    const saveOptions: GitStorageSaveOption = {
      commitMessage: 'Test commit',
      storeTokenIdInJsonEditor: false,
      changedFiles: new Set(['global']), // This should be ignored in single file mode
    };

    await singleFileStorage.write(mockFiles, saveOptions);

    expect(singleFileStorage.writeChangesetCalls).toHaveLength(1);
    const changeset = singleFileStorage.writeChangesetCalls[0].changeset;
    
    // Should include the single file with all data
    expect(changeset['tokens.json']).toBeDefined();
    expect(Object.keys(changeset)).toHaveLength(1);
  });
});