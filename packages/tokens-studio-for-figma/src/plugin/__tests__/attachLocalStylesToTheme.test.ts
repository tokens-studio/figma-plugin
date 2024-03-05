import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AnyTokenList } from '@/types/tokens';
import {
  mockGetLocalPaintStyles,
  mockGetLocalEffectStyles,
  mockGetLocalTextStyles,
} from '../../../tests/__mocks__/figmaMock';
import { attachLocalStylesToTheme } from '../asyncMessageHandlers';

describe('attachLocalStylesToTheme', () => {
  it('should be able to find and attach local styles', async () => {
    const mockLocalPaintStyles = [
      {
        id: 'S:paint:1234',
        name: 'colors/brand/primary',
      },
    ];

    const mockLocalTextStyles = [
      {
        id: 'S:text:1234',
        name: 'typography/heading/h1',
      },
    ];

    const mockLocalEffectStyles = [
      {
        id: 'S:effect:1234',
        name: 'shadows/lg',
      },
    ];

    const mockTheme = {
      id: 'branding',
      name: 'Branding',
      selectedTokenSets: {
        branding: TokenSetStatus.ENABLED,
      },
      $figmaStyleReferences: {
        'colors.brand.secondary': 'S:2345',
        'colors.brand.primary': 'S:broken',
      },
    };

    const mockTokens: Record<string, AnyTokenList> = {
      branding: [
        {
          type: TokenTypes.BOX_SHADOW,
          name: 'shadows.lg',
          value: '',
        },
        {
          type: TokenTypes.TYPOGRAPHY,
          name: 'typography.heading.h1',
          value: '',
        },
        {
          type: TokenTypes.COLOR,
          name: 'colors.brand.primary',
          value: '',
        },
      ],
    };

    mockGetLocalPaintStyles.mockImplementationOnce(() => mockLocalPaintStyles);
    mockGetLocalEffectStyles.mockImplementationOnce(() => mockLocalEffectStyles);
    mockGetLocalTextStyles.mockImplementationOnce(() => mockLocalTextStyles);

    const result = await attachLocalStylesToTheme({
      type: AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME,
      category: 'all',
      theme: mockTheme,
      tokens: mockTokens,
      settings: {},
    });

    expect(result).toEqual({
      ...mockTheme,
      $figmaStyleReferences: {
        'colors.brand.secondary': 'S:2345',
        'colors.brand.primary': 'S:paint:1234',
        'typography.heading.h1': 'S:text:1234',
        'shadows.lg': 'S:effect:1234',
      },
    });
  });
});
