import updateColorStyles from '../updateColorStyles';
import { TokenTypes } from '@/constants/TokenTypes';
import { mockCreatePaintStyle, mockGetLocalPaintStyles } from '../../../tests/__mocks__/figmaMock';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';

describe('updateColorStyles', () => {
  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'colors.red',
        value: '#ff0000',
        rawValue: '#ff0000',
        type: TokenTypes.COLOR,
      },
      ],
    });
  });
  it('Can create styles', async () => {
    const createdStyle = {
      id: '1234',
      name: 'colors/red',
      paints: [],
    };
    mockCreatePaintStyle.mockImplementationOnce(() => createdStyle);

    await updateColorStyles(
      [{
        name: 'colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        path: 'colors/red',
        styleId: '',
      }],
      true,
    );

    expect(createdStyle.paints).toEqual([
      {
        type: 'SOLID',
        color: { r: 1, g: 0, b: 0 },
        opacity: 1,
      },
    ]);
  });

  it('Can find style by styleId and update an existing style', async () => {
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

    await updateColorStyles(
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

  it('Can find style by styleId and update an existing style', async () => {
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

    await updateColorStyles(
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

  it('renames if option is true and style is found', async () => {
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

    await updateColorStyles(
      [{
        name: 'colors.red',
        value: '#ff0000',
        type: TokenTypes.COLOR,
        path: 'colors/redRENAMED',
        styleId: '1234',
      }],
      true,
      true,
    );

    expect(existingStyles[0].name).toEqual('colors/redRENAMED');
  });
});
