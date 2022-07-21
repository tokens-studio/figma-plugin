import { matchStyleName } from '../matchStyleName';

describe('matchStyleName', () => {
  it('Can find a matching style ID by token name', () => {
    expect(matchStyleName<PaintStyle>('colors.primary', 'light/colors/primary', {
      'colors.primary': 'S:1234',
    }, new Map([]))).toBe('S:1234');

    expect(matchStyleName<PaintStyle>('colors.primary', 'light/colors/primary', {}, new Map([
      ['colors.primary', { id: 'S:1234' } as PaintStyle],
    ]))).toBe('S:1234');
  });

  it('Can find a matching style ID by token path', () => {
    expect(matchStyleName<PaintStyle>('colors.primary', 'light/colors/primary', {
      'light/colors/primary': 'S:1234',
    }, new Map([]))).toBe('S:1234');

    expect(matchStyleName<PaintStyle>('colors.primary', 'light/colors/primary', {}, new Map([
      ['light/colors/primary', { id: 'S:1234' } as PaintStyle],
    ]))).toBe('S:1234');
  });
});
