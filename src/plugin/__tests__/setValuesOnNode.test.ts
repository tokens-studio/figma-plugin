import setValuesOnNode from '../setValuesOnNode';

describe('Can set values on node', () => {
  const emptyStylesMap = {
    effectStyles: new Map(),
    paintStyles: new Map(),
    textStyles: new Map(),
  };

  const emptyThemeInfo = {
    activeTheme: null,
    themes: [],
  };

  it('should be able to setValuesOnNode', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      cornerRadius: 0,
      topLeftRadius: 0,
      topRightRadius: 0,
      bottomRightRadius: 0,
      bottomLeftRadius: 0,
      strokeWeight: 0,
      opacity: 1,
      effects: [],
    } as unknown as RectangleNode;

    const values = {
      borderRadius: '10',
      borderRadiusTopLeft: '10',
      borderRadiusTopRight: '10',
      borderRadiusBottomRight: '10',
      borderRadiusBottomLeft: '10',
      borderWidth: '2',
      opacity: '0.5',
      boxShadow: {
        color: '#000000',
        type: 'dropShadow',
        x: 2,
        y: 4,
        blur: 10,
        spread: 4,
      },
    };

    const data = {
      boxShadow: 'shadows.lg',
    };

    await setValuesOnNode(mockNode, values, data, emptyStylesMap, emptyThemeInfo);

    expect(mockNode.cornerRadius).toEqual(10);
    expect(mockNode.topLeftRadius).toEqual(10);
    expect(mockNode.topRightRadius).toEqual(10);
    expect(mockNode.bottomRightRadius).toEqual(10);
    expect(mockNode.bottomLeftRadius).toEqual(10);
    expect(mockNode.effects[0]).toEqual({
      type: 'DROP_SHADOW',
      spread: 4,
      radius: 10,
      offset: { x: 2, y: 4 },
      blendMode: 'NORMAL',
      visible: true,
      color: {
        r: 0, g: 0, b: 0, a: 1,
      },
    });
    expect(mockNode.strokeWeight).toEqual(2);
    expect(mockNode.opacity).toEqual(0.5);
  });

  it('should be able to resize both width and height at the same time', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      resize: mockResize,
    } as unknown as RectangleNode;

    await setValuesOnNode(mockNode, {
      sizing: '100px',
    }, {}, emptyStylesMap, emptyThemeInfo);
    expect(mockResize).toBeCalledWith(100, 100);
  });

  it('should be able to resize width only', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      resize: mockResize,
      height: 50,
    } as unknown as RectangleNode;

    await setValuesOnNode(mockNode, {
      width: '100px',
    }, {}, emptyStylesMap, emptyThemeInfo);
    expect(mockResize).toBeCalledWith(100, 50);
  });

  it('should be able to resize height only', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      resize: mockResize,
      width: 50,
    } as unknown as RectangleNode;

    await setValuesOnNode(mockNode, {
      height: '100px',
    }, {}, emptyStylesMap, emptyThemeInfo);
    expect(mockResize).toBeCalledWith(50, 100);
  });
});
