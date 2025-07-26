import { getChangedFiles, filterChangedFiles } from '../getChangedFiles';
import { CompareStateType } from '../findDifferentState';
import { RemoteTokenStorageFile } from '@/storage/RemoteTokenStorage';

describe('getChangedFiles', () => {
  it('should return changed token sets', () => {
    const changedState: CompareStateType = {
      tokens: {
        'global': [],
        'colors': [],
      },
      themes: [],
      metadata: null,
    };

    const result = getChangedFiles(changedState);
    
    expect(result).toEqual(new Set(['global', 'colors']));
  });

  it('should return themes when changed', () => {
    const changedState: CompareStateType = {
      tokens: {},
      themes: [{ id: 'theme1', name: 'Theme 1', selectedTokenSets: {}, group: '', $figmaStyleReferences: {}, importType: 'NEW' }],
      metadata: null,
    };

    const result = getChangedFiles(changedState);
    
    expect(result).toEqual(new Set(['$themes']));
  });

  it('should return metadata when changed', () => {
    const changedState: CompareStateType = {
      tokens: {},
      themes: [],
      metadata: { tokenSetOrder: ['global'] },
    };

    const result = getChangedFiles(changedState);
    
    expect(result).toEqual(new Set(['$metadata']));
  });

  it('should return all changed items', () => {
    const changedState: CompareStateType = {
      tokens: {
        'global': [],
      },
      themes: [{ id: 'theme1', name: 'Theme 1', selectedTokenSets: {}, group: '', $figmaStyleReferences: {}, importType: 'NEW' }],
      metadata: { tokenSetOrder: ['global'] },
    };

    const result = getChangedFiles(changedState);
    
    expect(result).toEqual(new Set(['global', '$themes', '$metadata']));
  });

  it('should return empty set when nothing changed', () => {
    const changedState: CompareStateType = {
      tokens: {},
      themes: [],
      metadata: null,
    };

    const result = getChangedFiles(changedState);
    
    expect(result).toEqual(new Set());
  });
});

describe('filterChangedFiles', () => {
  const mockFiles: RemoteTokenStorageFile[] = [
    {
      type: 'tokenSet',
      name: 'global',
      path: 'global.json',
      data: {},
    },
    {
      type: 'tokenSet',
      name: 'colors',
      path: 'colors.json',
      data: {},
    },
    {
      type: 'themes',
      path: '$themes.json',
      data: [],
    },
    {
      type: 'metadata',
      path: '$metadata.json',
      data: { tokenSetOrder: ['global'] },
    },
  ];

  it('should filter to only changed token sets', () => {
    const changedFiles = new Set(['global']);

    const result = filterChangedFiles(mockFiles, changedFiles);
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('tokenSet');
    expect(result[0].name).toBe('global');
  });

  it('should filter to include themes when changed', () => {
    const changedFiles = new Set(['$themes']);

    const result = filterChangedFiles(mockFiles, changedFiles);
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('themes');
  });

  it('should filter to include metadata when changed', () => {
    const changedFiles = new Set(['$metadata']);

    const result = filterChangedFiles(mockFiles, changedFiles);
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('metadata');
  });

  it('should filter to include multiple changed files', () => {
    const changedFiles = new Set(['global', '$themes']);

    const result = filterChangedFiles(mockFiles, changedFiles);
    
    expect(result).toHaveLength(2);
    expect(result.find(f => f.type === 'tokenSet' && f.name === 'global')).toBeTruthy();
    expect(result.find(f => f.type === 'themes')).toBeTruthy();
  });

  it('should return empty array when no files changed', () => {
    const changedFiles = new Set<string>();

    const result = filterChangedFiles(mockFiles, changedFiles);
    
    expect(result).toHaveLength(0);
  });
});