import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import filterMatchingStyles from './filterMatchingStyles';

describe('filterMatchingStyles', () => {
  const token: SingleToken = {
    name: 'colors.blue.500',
    type: TokenTypes.COLOR,
    value: '#00f',
  };
  const styles: PaintStyle[] = [
    {
      name: 'colors/blue/500',
      paints: [],
      type: 'PAINT',
      id: '1',
      description: '',
      remote: false,
      key: '1',
      remove: null,
      getPublishStatusAsync: null,
    },
    {
      name: 'colors/blue / 500',
      paints: [],
      type: 'PAINT',
      id: '2',
      description: '',
      remote: false,
      key: '1',
      remove: null,
      getPublishStatusAsync: null,
    },
    {
      name: 'colors.blue.300',
      paints: [],
      type: 'PAINT',
      id: '3',
      description: '',
      remote: false,
      key: '1',
      remove: null,
      getPublishStatusAsync: null,
    },
  ];
  it('returns matching styles', () => {
    expect(filterMatchingStyles(token, styles)).toEqual(styles.slice(0, 2));
  });
});
