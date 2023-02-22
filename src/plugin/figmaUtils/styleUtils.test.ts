import { getLocalStyle } from './styleUtils';

describe('figmaStyleUtils', () => {
  const mockGetSharedPluginData = jest.fn();
  figma.getStyleById = jest.fn();

  const node = {
    effectStyleId: '123',
    strokeStyleId: '345',
    textStyleId: '456',
    effects: [
      {
        type: 'DROP_SHADOW',
        visible: true,
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 0.5,
        },
        offset: { x: 0, y: 0 },
        radius: 10,
        spread: 0,
        blendMode: 'NORMAL',
      },
    ],
    strokes: [{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }],
    typography: {
      fontFamily: 'Inter',
      fontWeight: 'Bold',
      fontSize: '24',
    },
    getSharedPluginData: mockGetSharedPluginData,
  } as unknown as BaseNode;

  it('should return local styleId', () => {
    getLocalStyle(node, 'effectStyleId_original', 'effects');
    expect(figma.getStyleById).toBeCalledWith('123');
  });

  it('should return undefined', () => {
    mockGetSharedPluginData.mockReturnValueOnce();
    getLocalStyle(node, 'fillStyleId_original', 'fills');
    expect(figma.getStyleById).toBeCalledWith(undefined);
  });
});
