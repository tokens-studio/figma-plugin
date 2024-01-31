import updateColorStyles from '../updateColorStyles';
import { TokenTypes } from '@/constants/TokenTypes';
import { mockCreatePaintStyle, mockGetLocalPaintStyles } from '../../../tests/__mocks__/figmaMock';

describe('updateColorStyles', () => {
  it('Can create styles', () => {
    const createdEffect = {
      id: '1234',
      name: 'colors/red',
      paints: [],
    };
    mockCreatePaintStyle.mockImplementationOnce(() => createdEffect);

    updateColorStyles(
      [{
        name: 'colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        path: 'colors/red',
        styleId: '',
      }],
      true,
    );

    expect(createdEffect.paints).toEqual([
      {
        type: 'SOLID',
        color: { r: 1, g: 0, b: 0 },
        opacity: 1,
      },
    ]);
  });

  it('Can find style by styleId and update an existing style', () => {
    const existingStyles = [
      {
        type: 'PAINT',
        id: '1234',
        name: 'colors/red',
        paints: [{
          type: 'SOLID',
          color: { r: 1, g: 0.1, b: 0.1 },
          opacity: 1,
        }],
      },
    ];
    mockGetLocalPaintStyles.mockImplementation(() => existingStyles);

    updateColorStyles(
      [{
        name: 'colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        path: 'colors/red',
        styleId: '1234',
      }],
      true,
    );

    expect(existingStyles[0].paints).toEqual([
      {
        type: 'SOLID',
        color: { r: 1, g: 0, b: 0 },
        opacity: 1,
      },
    ]);
  });

  it('Can find style by styleId and update an existing style', () => {
    const existingStyles = [
      {
        type: 'PAINT',
        id: '1234',
        name: 'colors/red',
        paints: [{
          type: 'SOLID',
          color: { r: 1, g: 0.1, b: 0.1 },
          opacity: 1,
        }],
      },
    ];
    mockGetLocalPaintStyles.mockImplementation(() => existingStyles);

    updateColorStyles(
      [{
        name: 'colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        path: 'colors/red',
        styleId: '',
      }],
      true,
    );

    expect(existingStyles[0].paints).toEqual([
      {
        type: 'SOLID',
        color: { r: 1, g: 0, b: 0 },
        opacity: 1,
      },
    ]);
  });
});
