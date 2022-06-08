import setValuesOnNode from '../setValuesOnNode';
import { ThemeObjectsList } from '@/types';
import * as setTextValuesOnTarget from '../setTextValuesOnTarget';
import * as setEffectValuesOnTarget from '../setEffectValuesOnTarget';
import * as setColorValuesOnTarget from '../setColorValuesOnTarget';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

describe('Can set values on node', () => {
  const emptyStylesMap = {
    effectStyles: new Map(),
    paintStyles: new Map(),
    textStyles: new Map(),
  };

  const emptyThemeInfo = {
    activeTheme: null as string | null,
    themes: [] as ThemeObjectsList,
  };

  const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTarget, 'default');
  const setEffectValuesOnTargetSpy = jest.spyOn(setEffectValuesOnTarget, 'default');
  const setColorValuesOnTargetSpy = jest.spyOn(setColorValuesOnTarget, 'default');

  let textNodeMock: TextNode;
  let solidNodeMock: RectangleNode;
  let frameNodeMock: FrameNode;

  beforeEach(() => {
    textNodeMock = {
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      textStyleId: undefined,
    } as unknown as TextNode;

    solidNodeMock = {
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
    } as unknown as RectangleNode;

    frameNodeMock = {
      type: 'FRAME',
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 0,
      itemSpacing: 0,
    } as unknown as FrameNode;
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
      offset: { x: 2, y: 4 },
      blendMode: 'NORMAL',
      visible: true,
      color: {
        r: 0, g: 0, b: 0, a: 1,
      },
    });
    expect(solidNodeMock.strokeWeight).toEqual(2);
    expect(solidNodeMock.opacity).toEqual(0.5);
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

  it('calls setTextValuesOnTarget if text node and atomic typography tokens are given', () => {
    setValuesOnNode(textNodeMock, {
      textCase: 'TITLE',
      textDecoration: 'STRIKETHROUGH',
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, emptyStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('doesnt call setTextValuesOnTarget if no text node', () => {
    setValuesOnNode(solidNodeMock, {
      textCase: 'TITLE',
      textDecoration: 'STRIKETHROUGH',
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, emptyStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('calls setTextValuesOnTarget if text node and composite typography tokens are given', () => {
    setValuesOnNode(textNodeMock, {
      typography: {
        fontFamily: 'Inter',
        fontWeight: 'Bold',
        fontSize: '24',
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, emptyStylesMap, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('sets textstyle if matching Style is found', async () => {
    await setValuesOnNode(textNodeMock, {
      typography: {
        fontFamily: 'Inter',
        fontWeight: 'Bold',
        fontSize: '24',
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, {
      ...emptyStylesMap,
      textStyles: new Map([
        ['type/heading/h1', { name: 'type/heading/h1', id: '123' } as TextStyle],
      ]),
    }, emptyThemeInfo);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    await setValuesOnNode(textNodeMock, {
      typography: {
        fontFamily: 'Inter',
        fontWeight: 'Bold',
        fontSize: '24',
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, {
      ...emptyStylesMap,
      textStyles: new Map([
        ['heading/h1', { name: 'heading/h1', id: '456' } as TextStyle],
      ]),
    }, emptyThemeInfo, true);
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '456' });
  });

  it('sets effectStyle if matching Style is found', async () => {
    await setValuesOnNode(solidNodeMock, {
      boxShadow: {
        type: BoxShadowTypes.DROP_SHADOW,
        color: '#00000080',
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, {
      ...emptyStylesMap,
      effectStyles: new Map([
        ['shadows/default', { name: 'shadows/default', id: '123' } as EffectStyle],
      ]),
    }, emptyThemeInfo);
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', async () => {
    await setValuesOnNode(solidNodeMock, {
      boxShadow: {
        type: BoxShadowTypes.DROP_SHADOW,
        color: '#00000080',
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, {
      ...emptyStylesMap,
      effectStyles: new Map([
        ['shadows/other', { name: 'shadows/other', id: '123' } as EffectStyle],
      ]),
    }, emptyThemeInfo);
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('should be able to find a theme prefixed style', async () => {
    await setValuesOnNode(solidNodeMock, {
      boxShadow: {
        type: BoxShadowTypes.DROP_SHADOW,
        color: '#00000080',
        x: 0,
        y: 0,
        blur: 10,
        spread: 0,
      },
    }, {
      typography: 'type.heading.h1',
      boxShadow: 'shadows.default',
    }, {
      ...emptyStylesMap,
      effectStyles: new Map([
        ['light/shadows/default', { name: 'light/shadows/default', id: '123' } as EffectStyle],
      ]),
    }, {
      activeTheme: 'light',
      themes: [{ id: 'light', name: 'light', selectedTokenSets: {} }],
    }, false, true);
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('sets fillStyle if matching Style', async () => {
    await setValuesOnNode(solidNodeMock, {
      fill: '#ff0000',
    }, {
      fill: 'colors.red',
    }, {
      ...emptyStylesMap,
      paintStyles: new Map([
        ['colors/red', { name: 'colors/red', id: '123' } as PaintStyle],
      ]),
    }, emptyThemeInfo);
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, fillStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if fill node and fill is given', async () => {
    await setValuesOnNode(solidNodeMock, {
      fill: '#ff0000',
    }, {
      fill: 'colors.red',
    }, emptyStylesMap, emptyThemeInfo);
    expect(setColorValuesOnTargetSpy).toHaveBeenCalledWith(solidNodeMock, { value: '#ff0000' }, 'fills');
  });

  it('sets strokeStyleId if matching Style', async () => {
    await setValuesOnNode(solidNodeMock, {
      border: '#ff0000',
    }, {
      border: 'colors.red',
    }, {
      ...emptyStylesMap,
      paintStyles: new Map([
        ['colors/red', { name: 'colors/red', id: '123' } as PaintStyle],
      ]),
    }, emptyThemeInfo);
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, strokeStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if border node and border is given', async () => {
    await setValuesOnNode(solidNodeMock, {
      border: '#ff0000',
    }, {
      border: 'colors.red',
    }, emptyStylesMap, emptyThemeInfo);
    expect(setColorValuesOnTargetSpy).toHaveBeenCalledWith(solidNodeMock, { value: '#ff0000' }, 'strokes');
  });

  it('can set padding and spacing if spacing is defined', async () => {
    await setValuesOnNode(frameNodeMock, {
      spacing: 20,
    }, {
      spacing: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
    expect(frameNodeMock.itemSpacing).toBe(20);
  });

  it('can set horizontalPadding', async () => {
    await setValuesOnNode(frameNodeMock, {
      horizontalPadding: 20,
    }, {
      horizontalPadding: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set verticalPadding', async () => {
    await setValuesOnNode(frameNodeMock, {
      verticalPadding: 20,
    }, {
      verticalPadding: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set itemSpacing', async () => {
    await setValuesOnNode(frameNodeMock, {
      itemSpacing: 20,
    }, {
      itemSpacing: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.itemSpacing).toBe(20);
  });

  it('can set paddingTop', async () => {
    await setValuesOnNode(frameNodeMock, {
      paddingTop: 20,
    }, {
      paddingTop: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingTop).toBe(20);
  });

  it('can set paddingRight', async () => {
    await setValuesOnNode(frameNodeMock, {
      paddingRight: 20,
    }, {
      paddingRight: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set paddingBottom', async () => {
    await setValuesOnNode(frameNodeMock, {
      paddingBottom: 20,
    }, {
      paddingBottom: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set paddingLeft', async () => {
    await setValuesOnNode(frameNodeMock, {
      paddingLeft: 20,
    }, {
      paddingLeft: 'spacing.lg',
    }, emptyStylesMap, emptyThemeInfo);
    expect(frameNodeMock.paddingLeft).toBe(20);
  });
});
