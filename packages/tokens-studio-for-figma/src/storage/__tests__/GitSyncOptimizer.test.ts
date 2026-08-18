import { GitSyncOptimizer, ChangedState } from '../GitSyncOptimizer';
import { RemoteTokenStorageData } from '../RemoteTokenStorage';
import { GitStorageSaveOptions, GitStorageSaveOption } from '../GitTokenStorage';
import { findDifferentState, CompareStateType } from '@/utils/findDifferentState';
import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';

const saveOptions: GitStorageSaveOption = {
  commitMessage: 'test commit',
  storeTokenIdInJsonEditor: false,
};

const existingToken: SingleToken = {
  name: 'foo', value: '8', description: '', type: TokenTypes.SPACING,
};

describe('GitSyncOptimizer', () => {
  it('writes only sets with token-level changes plus themes/metadata when changed', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken], other: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'other'] },
    };
    const changedState: ChangedState = {
      tokens: { global: [{ ...existingToken, importType: 'NEW' }] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'other'] },
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filteredFiles.map((f) => f.path)).toEqual(['global.json', '$metadata.json']);
    expect(result.filesToDelete).toEqual([]);
    expect(result.hasChanges).toBe(true);
  });

  it('writes the file for a newly added empty token set', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken], emptySet: [] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'emptySet'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: { tokenSetOrder: ['global', 'emptySet'] },
      tokenSetChanges: { emptySet: 'NEW' },
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filteredFiles.map((f) => f.path)).toEqual(['emptySet.json', '$metadata.json']);
    const emptySetFile = result.filteredFiles.find((f) => f.path === 'emptySet.json');
    expect(emptySetFile?.data).toEqual({});
    expect(result.hasChanges).toBe(true);
  });

  it('deletes the file for a removed empty token set', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
      tokenSetChanges: { emptySet: 'REMOVE' },
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filesToDelete).toEqual(['emptySet.json']);
    expect(result.hasChanges).toBe(true);
  });

  it('does not duplicate deletions already detected through REMOVE token entries', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const changedState: ChangedState = {
      tokens: { removedSet: [{ ...existingToken, importType: 'REMOVE' }] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
      tokenSetChanges: { removedSet: 'REMOVE' },
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filesToDelete).toEqual(['removedSet.json']);
  });

  it('does not delete a set that still exists locally even if marked REMOVE', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken], keptSet: [] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'keptSet'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: null,
      tokenSetChanges: { keptSet: 'REMOVE' },
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filesToDelete).toEqual([]);
  });

  it('reports no changes when nothing changed', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: null,
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.hasChanges).toBe(false);
    expect(result.filteredFiles).toEqual([]);
    expect(result.filesToDelete).toEqual([]);
  });

  // End-to-end repro of https://tokens-studio.slack.com report: create an empty
  // set, push — before the fix the set's file was never written, so the set
  // silently disappeared on the next pull.
  it('pushes a new empty set end-to-end when fed from findDifferentState', () => {
    const remote: CompareStateType = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const local: CompareStateType = {
      tokens: { global: [existingToken], test: [] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'test'] },
    };
    const changed = findDifferentState(remote, local);

    const result = GitSyncOptimizer.optimizeSync(
      { tokens: local.tokens, themes: local.themes, metadata: local.metadata },
      saveOptions,
      {
        tokens: changed.tokens,
        themes: changed.themes,
        metadata: changed.metadata,
        tokenSetChanges: changed.tokenSetChanges,
      },
    );

    expect(result.filteredFiles.map((f) => f.path)).toEqual(['test.json', '$metadata.json']);
  });

  // End-to-end: deleting an empty set must remove its file from the repo
  it('deletes an empty set end-to-end when fed from findDifferentState', () => {
    const remote: CompareStateType = {
      tokens: { global: [existingToken], test: [] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'test'] },
    };
    const local: CompareStateType = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const changed = findDifferentState(remote, local);

    const result = GitSyncOptimizer.optimizeSync(
      { tokens: local.tokens, themes: local.themes, metadata: local.metadata },
      saveOptions,
      {
        tokens: changed.tokens,
        themes: changed.themes,
        metadata: changed.metadata,
        tokenSetChanges: changed.tokenSetChanges,
      },
    );

    expect(result.filesToDelete).toEqual(['test.json']);
  });

  // Repro: legacy→DTCG conversion doesn't touch any in-memory SingleToken, so
  // findDifferentState reports zero token-level diffs. Without the tokenFormatChanged
  // flag, every token-set file was dropped from the commit, leaving only $metadata.json.
  it('rewrites every token-set file when tokenFormatChanged is set', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken], other: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global', 'other'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: { tokenSetOrder: ['global', 'other'] },
      tokenFormatChanged: true,
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filteredFiles.map((f) => f.path).sort()).toEqual(
      ['$metadata.json', 'global.json', 'other.json'],
    );
    expect(result.hasChanges).toBe(true);
  });

  // A format flip doesn't change $metadata.json content (tokenFormat is deliberately not
  // persisted there), so only the token-set files are rewritten when metadata has no diff.
  it('rewrites token-set files but not $metadata.json when only the format flipped', () => {
    const data: RemoteTokenStorageData<GitStorageSaveOptions> = {
      tokens: { global: [existingToken] },
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };
    const changedState: ChangedState = {
      tokens: {},
      themes: [],
      metadata: null,
      tokenFormatChanged: true,
    };

    const result = GitSyncOptimizer.optimizeSync(data, saveOptions, changedState);

    expect(result.filteredFiles.map((f) => f.path)).toEqual(['global.json']);
    expect(result.hasChanges).toBe(true);
  });
});
