import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { TokenState } from '../../tokenState';
import { setTokenData } from '../tokenState/setTokenData';

describe('Auto-enable first theme', () => {
  describe('setTokenData', () => {
    it('should auto-enable the first theme when no active theme is set', () => {
      const state = {
        tokens: {},
        themes: [],
        activeTheme: {},
        usedTokenSet: {},
        activeTokenSet: 'global',
        lastSyncedState: '[]',
        tokensSize: 0,
        themesSize: 0,
      } as unknown as TokenState;

      const payload = {
        values: {
          'collection/mode': [{ name: 'color.primary', value: '#ff0000', type: 'color' }],
        },
        themes: [
          {
            id: 'light',
            name: 'Light',
            group: 'Theme',
            selectedTokenSets: {
              'collection/mode': TokenSetStatus.ENABLED,
            },
          },
          {
            id: 'dark',
            name: 'Dark',
            group: 'Theme',
            selectedTokenSets: {
              'collection/mode': TokenSetStatus.ENABLED,
            },
          },
        ],
        activeTheme: {},
      };

      const result = setTokenData(state, payload);

      // Should enable the first theme
      expect(result.activeTheme).toEqual({
        Theme: 'light',
      });

      // Should update usedTokenSet based on the first theme
      expect(result.usedTokenSet).toEqual({
        'collection/mode': TokenSetStatus.ENABLED,
      });
    });

    it('should auto-enable the first theme with INTERNAL_THEMES_NO_GROUP when theme has no group', () => {
      const state = {
        tokens: {},
        themes: [],
        activeTheme: {},
        usedTokenSet: {},
        activeTokenSet: 'global',
        lastSyncedState: '[]',
        tokensSize: 0,
        themesSize: 0,
      } as unknown as TokenState;

      const payload = {
        values: {
          'collection/mode': [{ name: 'color.primary', value: '#ff0000', type: 'color' }],
        },
        themes: [
          {
            id: 'light',
            name: 'Light',
            selectedTokenSets: {
              'collection/mode': TokenSetStatus.ENABLED,
            },
          },
        ],
        activeTheme: {},
      };

      const result = setTokenData(state, payload);

      // Should enable the first theme with INTERNAL_THEMES_NO_GROUP
      expect(result.activeTheme).toEqual({
        [INTERNAL_THEMES_NO_GROUP]: 'light',
      });

      // Should update usedTokenSet based on the first theme
      expect(result.usedTokenSet).toEqual({
        'collection/mode': TokenSetStatus.ENABLED,
      });
    });

    it('should not change active theme when one is already set', () => {
      const state = {
        tokens: {},
        themes: [],
        activeTheme: { Theme: 'dark' },
        usedTokenSet: {},
        activeTokenSet: 'global',
        lastSyncedState: '[]',
        tokensSize: 0,
        themesSize: 0,
      } as unknown as TokenState;

      const payload = {
        values: {
          'collection/mode': [{ name: 'color.primary', value: '#ff0000', type: 'color' }],
        },
        themes: [
          {
            id: 'light',
            name: 'Light',
            group: 'Theme',
            selectedTokenSets: {
              'collection/mode': TokenSetStatus.ENABLED,
            },
          },
          {
            id: 'dark',
            name: 'Dark',
            group: 'Theme',
            selectedTokenSets: {
              'collection/mode': TokenSetStatus.ENABLED,
            },
          },
        ],
        activeTheme: { Theme: 'dark' },
      };

      const result = setTokenData(state, payload);

      // Should keep the existing active theme
      expect(result.activeTheme).toEqual({
        Theme: 'dark',
      });
    });

    it('should not auto-enable when no themes are available', () => {
      const state = {
        tokens: {},
        themes: [],
        activeTheme: {},
        usedTokenSet: {},
        activeTokenSet: 'global',
        lastSyncedState: '[]',
        tokensSize: 0,
        themesSize: 0,
      } as unknown as TokenState;

      const payload = {
        values: {
          global: [{ name: 'color.primary', value: '#ff0000', type: 'color' }],
        },
        themes: [],
        activeTheme: {},
      };

      const result = setTokenData(state, payload);

      // Should remain empty
      expect(result.activeTheme).toEqual({});
    });
  });
});
