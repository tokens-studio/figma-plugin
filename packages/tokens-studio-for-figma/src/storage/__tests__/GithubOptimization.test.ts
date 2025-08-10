import { GithubTokenStorage } from '../GithubTokenStorage';
import { determineFileChanges } from '@/utils/determineFileChanges';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

// Mock the octokit client
const mockOctokitClient = {
  repos: {
    createOrUpdateFiles: jest.fn().mockResolvedValue(true),
  },
  rest: {
    repos: {
      listBranches: jest.fn().mockResolvedValue({
        data: [
          { name: 'main', commit: { sha: 'abc123' } },
          { name: 'feature-branch', commit: { sha: 'def456' } },
        ],
      }),
    },
  },
  paginate: jest.fn().mockImplementation((fn, params) => fn(params).then(response => response.data)),
};

jest.mock('@octokit/rest', () => {
  return {
    Octokit: {
      plugin: jest.fn().mockReturnValue(function MockOctokit() {
        return mockOctokitClient;
      }),
    },
  };
});

// Mock the octokit-commit-multiple-files module
jest.mock('octokit-commit-multiple-files', () => ({}));

describe('GitHub Optimization Integration', () => {
  let storage: GithubTokenStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new GithubTokenStorage('fake-token', 'test-owner', 'test-repo');
    storage.enableMultiFile();
    storage.changePath('tokens');
  });

  it('should optimize push for multi-file changes', async () => {
    const currentTokens = {
      global: [
        { name: 'color.primary', value: '#ff0000', type: 'color' },
        { name: 'spacing.base', value: '16px', type: 'spacing' },
      ],
      semantic: [
        { name: 'color.background', value: '{color.primary}', type: 'color' },
      ],
    };

    const currentThemes = [
      { id: 'theme1', name: 'Light Theme', selectedTokenSets: { global: 'enabled' } },
    ];

    // Simulate lastSyncedState with only global tokens
    const lastSyncedState = JSON.stringify([
      {
        global: [
          { name: 'color.primary', value: '#00ff00', type: 'color' }, // Changed value
        ],
      },
      [], // No themes before
      TokenFormatOptions.Legacy,
    ]);

    // Determine file changes
    const fileChanges = determineFileChanges(
      currentTokens,
      currentThemes,
      TokenFormatOptions.Legacy,
      lastSyncedState,
      'tokens',
      true, // Multi-file enabled
      false, // Not single JSON file
    );

    expect(fileChanges.hasChanges).toBe(true);
    expect(fileChanges.filesToCreate).toContain('tokens/semantic.json');
    expect(fileChanges.filesToCreate).toContain('tokens/$themes.json');
    expect(fileChanges.filesToUpdate).toContain('tokens/global.json');
    expect(fileChanges.filesToUpdate).toContain('tokens/$metadata.json');

    // Create expected changeset for only the changed files
    const expectedChangeset = {
      'tokens/global.json': JSON.stringify(currentTokens.global, null, 2),
      'tokens/semantic.json': JSON.stringify(currentTokens.semantic, null, 2),
      'tokens/$themes.json': JSON.stringify(currentThemes, null, 2),
      'tokens/$metadata.json': JSON.stringify({ tokenSetOrder: ['global', 'semantic'] }, null, 2),
    };

    // Test optimized write
    await storage.writeChangesetOptimized(
      expectedChangeset,
      'Optimized commit',
      'main',
      false,
      fileChanges.filesToDelete,
    );

    // Verify the octokit client was called with the optimized changeset
    expect(mockOctokitClient.repos.createOrUpdateFiles).toHaveBeenCalledWith({
      branch: 'main',
      owner: 'test-owner',
      repo: 'test-repo',
      createBranch: false,
      changes: [
        {
          message: 'Optimized commit',
          files: expectedChangeset,
          filesToDelete: fileChanges.filesToDelete,
          ignoreDeletionFailures: true,
        },
      ],
    });
  });

  it('should handle file deletions in optimization', async () => {
    const currentTokens = {
      global: [
        { name: 'color.primary', value: '#ff0000', type: 'color' },
      ],
    };

    // Simulate lastSyncedState with additional token set that should be deleted
    const lastSyncedState = JSON.stringify([
      {
        global: [
          { name: 'color.primary', value: '#ff0000', type: 'color' },
        ],
        oldTokenSet: [
          { name: 'old.token', value: 'value', type: 'text' },
        ],
      },
      [],
      TokenFormatOptions.Legacy,
    ]);

    const fileChanges = determineFileChanges(
      currentTokens,
      [],
      TokenFormatOptions.Legacy,
      lastSyncedState,
      'tokens',
      true,
      false,
    );

    expect(fileChanges.hasChanges).toBe(true);
    expect(fileChanges.filesToDelete).toContain('tokens/oldTokenSet.json');
    expect(fileChanges.filesToUpdate).toContain('tokens/$metadata.json');

    // Test that filesToDelete is properly handled
    const changeset = {
      'tokens/$metadata.json': JSON.stringify({ tokenSetOrder: ['global'] }, null, 2),
    };

    await storage.writeChangesetOptimized(
      changeset,
      'Delete old token set',
      'main',
      false,
      fileChanges.filesToDelete,
    );

    expect(mockOctokitClient.repos.createOrUpdateFiles).toHaveBeenCalledWith({
      branch: 'main',
      owner: 'test-owner',
      repo: 'test-repo',
      createBranch: false,
      changes: [
        {
          message: 'Delete old token set',
          files: changeset,
          filesToDelete: ['tokens/oldTokenSet.json'],
          ignoreDeletionFailures: true,
        },
      ],
    });
  });

  it('should handle single file mode optimization', async () => {
    const singleFileStorage = new GithubTokenStorage('fake-token', 'test-owner', 'test-repo');
    singleFileStorage.changePath('tokens.json');

    const currentTokens = {
      global: [
        { name: 'color.primary', value: '#ff0000', type: 'color' },
      ],
    };

    const lastSyncedState = JSON.stringify([
      {
        global: [
          { name: 'color.primary', value: '#00ff00', type: 'color' }, // Different value
        ],
      },
      [],
      TokenFormatOptions.Legacy,
    ]);

    const fileChanges = determineFileChanges(
      currentTokens,
      [],
      TokenFormatOptions.Legacy,
      lastSyncedState,
      'tokens.json',
      false,
      true,
    );

    expect(fileChanges.hasChanges).toBe(true);
    expect(fileChanges.filesToUpdate).toContain('tokens.json');

    const changeset = {
      'tokens.json': JSON.stringify({
        global: currentTokens.global,
        $metadata: { tokenSetOrder: ['global'] },
      }, null, 2),
    };

    await singleFileStorage.writeChangesetOptimized(
      changeset,
      'Update single file',
      'main',
      false,
      [],
    );

    expect(mockOctokitClient.repos.createOrUpdateFiles).toHaveBeenCalledWith({
      branch: 'main',
      owner: 'test-owner',
      repo: 'test-repo',
      createBranch: false,
      changes: [
        {
          message: 'Update single file',
          files: changeset,
          filesToDelete: [],
          ignoreDeletionFailures: true,
        },
      ],
    });
  });
});