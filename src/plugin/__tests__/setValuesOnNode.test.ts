import setValuesOnNode from '../setValuesOnNode';
import { ThemeObjectsList } from '@/types';
import * as setTextValuesOnTarget from '../setTextValuesOnTarget';
import * as setEffectValuesOnTarget from '../setEffectValuesOnTarget';
import * as setColorValuesOnTarget from '../setColorValuesOnTarget';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { mockFetch } from '../../../tests/__mocks__/fetchMock';
import { mockCreateImage } from '../../../tests/__mocks__/figmaMock';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('Can set values on node', () => {
  const emptyStylesMap = {
    effectStyles: new Map(),
    paintStyles: new Map(),
    textStyles: new Map(),
  };

  const emptyThemeInfo = {
    activeTheme: {},
    themes: [] as ThemeObjectsList,
  };

  const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');
  const setEffectValuesOnTargetSpy = jest.spyOn(setEffectValuesOnTarget, 'default');
  const setColorValuesOnTargetSpy = jest.spyOn(setColorValuesOnTarget, 'default');

  let textNodeMock: TextNode;
  let solidNodeMock: RectangleNode;
  let frameNodeMock: FrameNode;

  beforeEach(() => {
    textNodeMock = ({
      type: 'TEXT',
      characters: 'foobar',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      fills: [],
      textStyleId: undefined,
      getSharedPluginData: () => '',
      setSharedPluginData: () => undefined,
    } as unknown) as TextNode;

    solidNodeMock = ({
      type: 'RECTANGLE',
      cornerRadius: 0,
      topLeftRadius: 0,
      topRightRadius: 0,
      bottomRightRadius: 0,
      bottomLeftRadius: 0,
      strokeWeight: 0,
      opacity: 1,
      effects: [],
      fills: [],
      strokes: [],
      effectStyleId: '',
      fillStyleId: '',
      strokeStyleId: '',
      dashPattern: [],
      visible: true,
      getSharedPluginData: () => '',
      setSharedPluginData: () => undefined,
    } as unknown) as RectangleNode;

    frameNodeMock = ({
      type: 'FRAME',
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      itemSpacing: 0,
    } as unknown) as FrameNode;
  });

  it('should be able to setValuesOnNode', async () => {
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
        x: '2',
        y: '4',
        blur: '10',
        spread: '4',
      },
    };

    const data = {
      boxShadow: 'shadows.lg',
    };

    await setValuesOnNode(solidNodeMock, values, data, emptyStylesMap, emptyThemeInfo);

    expect(solidNodeMock.cornerRadius).toEqual(10);
    expect(solidNodeMock.topLeftRadius).toEqual(10);
    expect(solidNodeMock.topRightRadius).toEqual(10);
    expect(solidNodeMock.bottomRightRadius).toEqual(10);
    expect(solidNodeMock.bottomLeftRadius).toEqual(10);
    expect(solidNodeMock.effects[0]).toEqual({
      type: 'DROP_SHADOW',
      spread: 4,
      radius: 10,
      showShadowBehindNode: false,
      offset: { x: 2, y: 4 },
      blendMode: 'NORMAL',
      visible: true,
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      },
    });
    expect(solidNodeMock.strokeWeight).toEqual(2);
    expect(solidNodeMock.opacity).toEqual(0.5);
  });

  it('should be able to resize both width and height at the same time', async () => {
    const mockResize = jest.fn();
    const mockNode = ({
      resize: mockResize,
    } as unknown) as RectangleNode;

    await setValuesOnNode(
      mockNode,
      {
        sizing: '100px',
      },
      {},
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(mockResize).toBeCalledWith(100, 100);
  });

  it('should be able to resize width only', async () => {
    const mockResize = jest.fn();
    const mockNode = ({
      resize: mockResize,
      height: 50,
    } as unknown) as RectangleNode;

    await setValuesOnNode(
      mockNode,
      {
        width: '100px',
      },
      {},
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(mockResize).toBeCalledWith(100, 50);
  });

  it('should be able to resize height only', async () => {
    const mockResize = jest.fn();
    const mockNode = ({
      resize: mockResize,
      width: 50,
    } as unknown) as RectangleNode;

    await setValuesOnNode(
      mockNode,
      {
        height: '100px',
      },
      {},
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(mockResize).toBeCalledWith(50, 100);
  });

  it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', () => {
    setValuesOnNode(
      textNodeMock,
      {
        textCase: 'TITLE',
        textDecoration: 'STRIKETHROUGH',
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('doesnt call setTextValuesOnTarget if no text node', () => {
    setValuesOnNode(
      solidNodeMock,
      {
        textCase: 'TITLE',
        textDecoration: 'STRIKETHROUGH',
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('calls setTextValuesOnTarget if text node and composite typography tokens are given', () => {
    setValuesOnNode(
      textNodeMock,
      {
        typography: {
          fontFamily: 'Inter',
          fontWeight: 'Bold',
          fontSize: '24',
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('sets textstyle if matching Style is found', async () => {
    await setValuesOnNode(
      textNodeMock,
      {
        typography: {
          fontFamily: 'Inter',
          fontWeight: 'Bold',
          fontSize: '24',
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      {
        ...emptyStylesMap,
        textStyles: new Map([['type/heading/h1', { name: 'type/heading/h1', id: '123' } as TextStyle]]),
      },
      emptyThemeInfo,
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    await setValuesOnNode(
      textNodeMock,
      {
        typography: {
          fontFamily: 'Inter',
          fontWeight: 'Bold',
          fontSize: '24',
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      {
        ...emptyStylesMap,
        textStyles: new Map([['heading/h1', { name: 'heading/h1', id: '456' } as TextStyle]]),
      },
      emptyThemeInfo,
      true,
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '456' });
  });

  it('sets effectStyle if matching Style is found', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        boxShadow: {
          type: BoxShadowTypes.DROP_SHADOW,
          color: '#00000080',
          x: 0,
          y: 0,
          blur: 10,
          spread: 0,
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      {
        ...emptyStylesMap,
        effectStyles: new Map([['shadows/default', { name: 'shadows/default', id: '123' } as EffectStyle]]),
      },
      emptyThemeInfo,
    );
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        boxShadow: {
          type: BoxShadowTypes.DROP_SHADOW,
          color: '#00000080',
          x: 0,
          y: 0,
          blur: 10,
          spread: 0,
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      {
        ...emptyStylesMap,
        effectStyles: new Map([['shadows/other', { name: 'shadows/other', id: '123' } as EffectStyle]]),
      },
      emptyThemeInfo,
    );
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('should be able to find a theme prefixed style', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        boxShadow: {
          type: BoxShadowTypes.DROP_SHADOW,
          color: '#00000080',
          x: 0,
          y: 0,
          blur: 10,
          spread: 0,
        },
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      {
        ...emptyStylesMap,
        effectStyles: new Map([['light/shadows/default', { name: 'light/shadows/default', id: '123' } as EffectStyle]]),
      },
      {
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
        themes: [{ id: 'light', name: 'light', selectedTokenSets: {} }],
      },
      false,
      true,
    );
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('sets fillStyle if matching Style', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        fill: '#ff0000',
      },
      {
        fill: 'colors.red',
      },
      {
        ...emptyStylesMap,
        paintStyles: new Map([['colors/red', { name: 'colors/red', id: '123' } as PaintStyle]]),
      },
      emptyThemeInfo,
    );
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, fillStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if fill node and fill is given', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        fill: '#ff0000',
      },
      {
        fill: 'colors.red',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(setColorValuesOnTargetSpy).toHaveBeenCalledWith(solidNodeMock, { value: '#ff0000' }, 'fills');
  });

  it('sets strokeStyleId if matching Style', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        borderColor: '#ff0000',
      },
      {
        borderColor: 'colors.red',
      },
      {
        ...emptyStylesMap,
        paintStyles: new Map([['colors/red', { name: 'colors/red', id: '123' } as PaintStyle]]),
      },
      emptyThemeInfo,
    );
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, strokeStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if border node and border is given', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        borderColor: '#ff0000',
      },
      {
        borderColor: 'colors.red',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(setColorValuesOnTargetSpy).toHaveBeenCalledWith(solidNodeMock, { value: '#ff0000' }, 'strokes');
  });

  it('can set padding and spacing if spacing is defined', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        spacing: 20,
      },
      {
        spacing: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set horizontalPadding', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        horizontalPadding: 20,
      },
      {
        horizontalPadding: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set verticalPadding', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        verticalPadding: 20,
      },
      {
        verticalPadding: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set itemSpacing', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        itemSpacing: 20,
      },
      {
        itemSpacing: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.itemSpacing).toBe(20);
  });

  it('can set paddingTop', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        paddingTop: 20,
      },
      {
        paddingTop: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingTop).toBe(20);
  });

  it('can set paddingRight', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        paddingRight: 20,
      },
      {
        paddingRight: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set paddingBottom', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        paddingBottom: 20,
      },
      {
        paddingBottom: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set paddingLeft', async () => {
    await setValuesOnNode(
      frameNodeMock,
      {
        paddingLeft: 20,
      },
      {
        paddingLeft: 'spacing.lg',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
  });

  it('changes fill if needed', async () => {
    await setValuesOnNode(
      textNodeMock,
      { fill: '#ff0000' },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
        fill: 'fg.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(textNodeMock.fills).toEqual([
      {
        color: {
          r: 1,
          g: 0,
          b: 0,
        },
        opacity: 1,
        type: 'SOLID',
      },
    ]);
  });

  it('changes characters if needed', async () => {
    await setValuesOnNode(
      textNodeMock,
      { fill: '#ff0000', value: 'My new content' },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
        fill: 'default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(textNodeMock.characters).toEqual('My new content');
  });

  it('doesnt change characters if not needed', async () => {
    await setValuesOnNode(
      textNodeMock,
      { fill: '#00ff00' },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
        fill: 'fg.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(textNodeMock.characters).toEqual('foobar');
  });

  it('should change characters when the value is 0', async () => {
    await setValuesOnNode(
      textNodeMock,
      {
        value: 0,
      },
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(figma.loadFontAsync).toHaveBeenCalled();
    expect(textNodeMock.characters).toEqual('0');
  });

  it('should not change characters when the value is undefined', async () => {
    await setValuesOnNode(
      textNodeMock,
      {},
      {
        typography: 'type.heading.h1',
        boxShadow: 'shadows.default',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(figma.loadFontAsync).not.toHaveBeenCalled();
    expect(textNodeMock.characters).toEqual('foobar');
  });

  it('can set assets token', async () => {
    const values = { asset: 'http://image.png' };
    const data = { asset: 'assets/avatar' };
    mockFetch.mockImplementationOnce(() => (
      Promise.resolve({
        ok: true,
        arrayBuffer: () => ('5678'),
      })
    ));
    mockCreateImage.mockImplementation(() => ({
      hash: '1234',
    }));
    await setValuesOnNode(solidNodeMock, values, data, emptyStylesMap, emptyThemeInfo);
    expect(solidNodeMock.fills).toEqual([
      {
        type: 'IMAGE',
        scaleMode: 'FILL',
        imageHash: '1234',
      },
    ]);
  });

  it('should resize when dimension token applied to the node which has no itemSpacing property', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      resize: mockResize,
    } as unknown as RectangleNode;
    const values = {
      dimension: '12px',
    };
    const data = { dimension: 'dimension.regular' };
    await setValuesOnNode(mockNode, values, data, emptyStylesMap, emptyThemeInfo);
    expect(mockResize).toBeCalledWith(12, 12);
  });

  it('should set itemSpacing when dimension token applied to the node which has itemSpacing property', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      resize: mockResize,
      itemSpacing: 0,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
    } as unknown as FrameNode;
    const values = {
      dimension: '12px',
    };
    const data = { dimension: 'dimension.regular' };
    await setValuesOnNode(mockNode, values, data, emptyStylesMap, emptyThemeInfo);
    expect(mockResize).toBeCalledTimes(0);
    expect(mockNode.itemSpacing).toEqual(12);
  });
  it('can set border token', async () => {
    const values = {
      border: {
        color: '#ffffff',
        width: '12px',
        style: 'solid',
      },
    };
    const data = { border: 'border.regular' };
    await setValuesOnNode(solidNodeMock, values, data, emptyStylesMap, emptyThemeInfo);
    expect(solidNodeMock.strokeWeight).toEqual(12);
    expect(solidNodeMock.dashPattern).toEqual([0, 0]);
  });

  it('apply token with none value', async () => {
    await setValuesOnNode(
      solidNodeMock,
      {
        borderColor: 'none',
        borderRadius: 'none',
      },
      {
        borderColor: 'border-color.none',
        borderRadius: 'border-radius.none',
      },
      emptyStylesMap,
      emptyThemeInfo,
    );
    expect(solidNodeMock).toEqual({ ...solidNodeMock, strokes: [], cornerRadius: 0 });
  });

  it('can set boolean token for visibility', async () => {
    const values = {
      visibility: 'false',
    };
    const data = { visibility: 'boolean-false' };
    await setValuesOnNode(solidNodeMock, values, data, emptyStylesMap, emptyThemeInfo);
    expect(solidNodeMock.visible).toEqual(false);
  });
});
