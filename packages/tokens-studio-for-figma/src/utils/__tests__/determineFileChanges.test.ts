import { determineFileChanges } from '../determineFileChanges';
import { TokenFormatOptions } from '@/plugin/TokenFormatStoreClass';

const mockTokens = {
  global: [
    { name: 'color.primary', value: '#ff0000', type: 'color' },
    { name: 'spacing.base', value: '16px', type: 'spacing' },
  ],
  semantic: [
    { name: 'color.background', value: '{color.primary}', type: 'color' },
  ],
};

const mockThemes = [
  { id: 'theme1', name: 'Light Theme', selectedTokenSets: { global: 'enabled' } },
];

describe('determineFileChanges', () => {
  describe('single file mode', () => {
    it('should detect changes when tokens are modified', () => {
      const lastSyncedState = JSON.stringify([
        { global: [{ name: 'color.primary', value: '#00ff00', type: 'color' }] },
        [],
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens.json',
        false,
        true,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToUpdate).toContain('tokens.json');
      expect(result.filesToCreate).toHaveLength(0);
      expect(result.filesToDelete).toHaveLength(0);
    });

    it('should detect no changes when nothing has changed', () => {
      const lastSyncedState = JSON.stringify([
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens.json',
        false,
        true,
      );

      expect(result.hasChanges).toBe(false);
      expect(result.filesToUpdate).toHaveLength(0);
      expect(result.filesToCreate).toHaveLength(0);
      expect(result.filesToDelete).toHaveLength(0);
    });

    it('should treat everything as new when lastSyncedState is invalid', () => {
      const result = determineFileChanges(
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
        'invalid json',
        'tokens.json',
        false,
        true,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToCreate).toContain('tokens.json');
      expect(result.filesToUpdate).toHaveLength(0);
      expect(result.filesToDelete).toHaveLength(0);
    });
  });

  describe('multi-file mode', () => {
    it('should detect new token sets', () => {
      const lastSyncedState = JSON.stringify([
        { global: mockTokens.global },
        [],
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens',
        true,
        false,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToCreate).toContain('tokens/semantic.json');
      expect(result.filesToUpdate).toContain('tokens/$metadata.json');
    });

    it('should detect deleted token sets', () => {
      const lastSyncedState = JSON.stringify([
        {
          global: mockTokens.global,
          semantic: mockTokens.semantic,
          deleted: [{ name: 'old.token', value: 'value', type: 'text' }],
        },
        [],
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens',
        true,
        false,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToDelete).toContain('tokens/deleted.json');
    });

    it('should detect theme changes', () => {
      const lastSyncedState = JSON.stringify([
        mockTokens,
        [],
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        mockThemes,
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens',
        true,
        false,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToCreate).toContain('tokens/$themes.json');
    });

    it('should detect no changes when everything is the same', () => {
      const lastSyncedState = JSON.stringify([
        mockTokens,
        mockThemes,
        TokenFormatOptions.Legacy,
      ]);

      const result = determineFileChanges(
        mockTokens,
        mockThemes,
        TokenFormatOptions.Legacy,
        lastSyncedState,
        'tokens',
        true,
        false,
      );

      expect(result.hasChanges).toBe(false);
      expect(result.filesToCreate).toHaveLength(0);
      expect(result.filesToUpdate).toHaveLength(0);
      expect(result.filesToDelete).toHaveLength(0);
    });

    it('should handle empty lastSyncedState', () => {
      const result = determineFileChanges(
        mockTokens,
        mockThemes,
        TokenFormatOptions.Legacy,
        '',
        'tokens',
        true,
        false,
      );

      expect(result.hasChanges).toBe(true);
      expect(result.filesToCreate).toContain('tokens/global.json');
      expect(result.filesToCreate).toContain('tokens/semantic.json');
      expect(result.filesToCreate).toContain('tokens/$themes.json');
      expect(result.filesToCreate).toContain('tokens/$metadata.json');
    });
  });
});