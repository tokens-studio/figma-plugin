import { TokenTypes } from '@/constants/TokenTypes';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

describe('mergeTokenGroups', () => {
  it('merges all token groups into a single list overriding the previous set from left to right', () => {
    const input: Record<string, AnyTokenList> = {
      v0: [
        {
          type: TokenTypes.COLOR,
          name: 'color.primary',
          value: '#000000',
        },
        {
          type: TokenTypes.COLOR,
          name: 'color.secondary',
          value: '#ffffff',
        },
        {
          type: TokenTypes.COMPOSITION,
          name: 'composition.container',
          value: {
            fill: '{color.primary}',
            borderRadius: 32,
            height: 100,
          },
        },
        {
          type: TokenTypes.BOX_SHADOW,
          name: 'shadow.large',
          value: [
            {
              type: BoxShadowTypes.DROP_SHADOW,
              color: '#000000',
              x: 0,
              y: 0,
              blur: 32,
              spread: 0,
            },
            {
              type: BoxShadowTypes.INNER_SHADOW,
              color: '#000000',
              x: 0,
              y: 0,
              blur: 16,
              spread: 0,
            },
          ],
        },
      ],
      v1: [
        {
          type: TokenTypes.COLOR,
          name: 'color.primary',
          value: '#ffffff',
        },
        {
          type: TokenTypes.COMPOSITION,
          name: 'composition.container',
          value: {
            fill: '{color.secondary}',
          },
        },
        {
          type: TokenTypes.BOX_SHADOW,
          name: 'shadow.large',
          value: [
            {
              type: BoxShadowTypes.DROP_SHADOW,
              color: '#ffffff',
              x: 0,
              y: 0,
              blur: 32,
              spread: 0,
            },
            {
              type: BoxShadowTypes.INNER_SHADOW,
              color: '#ffffff',
              x: 0,
              y: 0,
              blur: 16,
              spread: 0,
            },
          ],
        },
      ],
    };

    const output: SingleToken[] = [
      {
        internal__Parent: 'v1',
        type: TokenTypes.COLOR,
        name: 'color.primary',
        value: '#ffffff',
      },
      {
        internal__Parent: 'v1',
        type: TokenTypes.COMPOSITION,
        name: 'composition.container',
        value: {
          fill: '{color.secondary}',
          borderRadius: 32,
          height: 100,
        },
      },
      {
        internal__Parent: 'v1',
        type: TokenTypes.BOX_SHADOW,
        name: 'shadow.large',
        value: [
          {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#ffffff',
            x: 0,
            y: 0,
            blur: 32,
            spread: 0,
          },
          {
            type: BoxShadowTypes.INNER_SHADOW,
            color: '#ffffff',
            x: 0,
            y: 0,
            blur: 16,
            spread: 0,
          },
        ],
      },
      {
        internal__Parent: 'v0',
        type: TokenTypes.COLOR,
        name: 'color.secondary',
        value: '#ffffff',
      },
    ];
    expect(mergeTokenGroups(input)).toEqual(output);
  });
});
