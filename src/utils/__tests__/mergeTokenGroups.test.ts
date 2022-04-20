import { TokenTypes } from '@/constants/TokenTypes';
import { mergeTokenGroups } from '@/plugin/tokenHelpers';
import { AnyTokenList, SingleToken } from '@/types/tokens';

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
      ],
      v1: [
        {
          type: TokenTypes.COLOR,
          name: 'color.primary',
          value: '#ffffff',
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
        internal__Parent: 'v0',
        type: TokenTypes.COLOR,
        name: 'color.secondary',
        value: '#ffffff',
      },
    ];
    expect(mergeTokenGroups(input)).toEqual(output);
  });
});
