import setValuesOnNode from '../setValuesOnNode';
import * as setTextValuesOnTargetModule from '../setTextValuesOnTarget';
import * as tryApplyTypographyCompositeVariableModule from '../tryApplyTypographyCompositeVariable';
import * as setEffectValuesOnTarget from '../setEffectValuesOnTarget';
import * as setColorValuesOnTarget from '../setColorValuesOnTarget';
import * as setBorderColorValuesOnTarget from '../setBorderColorValuesOnTarget';
import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { mockFetch } from '../../../tests/__mocks__/fetchMock';
import { mockCreateImage } from '../../../tests/__mocks__/figmaMock';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import { TokenTypes } from '@/constants/TokenTypes';

describe('Can set values on node', () => {
  const setTextValuesOnTargetSpy = jest.spyOn(setTextValuesOnTargetModule, 'setTextValuesOnTarget');
  const tryApplyTypographyCompositeVariableSpy = jest.spyOn(tryApplyTypographyCompositeVariableModule, 'tryApplyTypographyCompositeVariable');
  const setEffectValuesOnTargetSpy = jest.spyOn(setEffectValuesOnTarget, 'default');
  const setColorValuesOnTargetSpy = jest.spyOn(setColorValuesOnTarget, 'default');
  const setBorderColorValuesOnTargetSpy = jest.spyOn(setBorderColorValuesOnTarget, 'setBorderColorValuesOnTarget');

  let textNodeMock: TextNode;
  let solidNodeMock: RectangleNode;
  let frameNodeMock: FrameNode;

  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'fg.default',
        value: '#ff0000',
        rawValue: '#ff0000',
        type: TokenTypes.COLOR,
      },
      {
        name: 'shadows.lg',
        value: {
          color: '#000000',
          type: BoxShadowTypes.DROP_SHADOW,
          x: '2',
          y: '4',
          blur: '10',
          spread: '4',
        },
        resolvedValueWithReferences: {
          color: '#000000',
          type: BoxShadowTypes.DROP_SHADOW,
          x: '2',
          y: '4',
          blur: '10',
          spread: '4',
        },
        type: TokenTypes.BOX_SHADOW,
      }],
    });
    textNodeMock = ({
      id: '123:456',
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
      id: '123:457',
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
      id: '123:458',
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
      borderRadius: 'border-radius-10',
      borderRadiusTopLeft: 'border-radius-10',
      borderRadiusTopRight: 'border-radius-10',
      borderRadiusBottomRight: 'border-radius-10',
      borderRadiusBottomLeft: 'border-radius-10',
      borderWidth: 'border-width-2',
      opacity: 'opacity-50',
    };

    await setValuesOnNode({ node: solidNodeMock, values, data });

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

    await setValuesOnNode({ node: mockNode, values: { sizing: '100px' }, data: { sizing: 'size.10' } });
    expect(mockResize).toBeCalledWith(100, 100);
  });

  it('should be able to resize width only', async () => {
    const mockResize = jest.fn();
    const mockNode = ({
      resize: mockResize,
      height: 50,
    } as unknown) as RectangleNode;

    await setValuesOnNode(
      {
        node: mockNode,
        values: {
          width: '100px',
        },
        data: { width: 'size.100' },
      },
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
      {
        node: mockNode,
        values: {
          height: '100px',
        },
        data: { height: 'size.100' },
      },
    );
    expect(mockResize).toBeCalledWith(50, 100);
  });

  it('calls tryApplyTypographyCompositeVariable if text node and atomic typography tokens are given', async () => {
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {
          textCase: 'TITLE',
          textDecoration: 'STRIKETHROUGH',
        },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(tryApplyTypographyCompositeVariableSpy).toHaveBeenCalled();
  });

  it('doesnt call setTextValuesOnTarget if no text node', () => {
    setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          textCase: 'TITLE',
          textDecoration: 'STRIKETHROUGH',
        },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('does not call setTextValuesOnTarget if text node and composite typography tokens are given', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'type.heading.h1',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
      ],
    });
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {
          typography: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
  });

  it('sets textstyle if matching Style is found', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'type.heading.h1',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
      ],
      styleReferences: new Map([['type.heading.h1', '123']]),
    });
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {
          typography: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
        data: {
          typography: 'type.heading.h1',
        },
      },
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '123' });
  });

  it('sets textstyle if matching Style is found and first part is ignored', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'type.heading.h1',
          type: TokenTypes.TYPOGRAPHY,
          value: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
      ],
      styleReferences: new Map([['heading.h1', '456']]),
      ignoreFirstPartForStyles: true,
    });
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {
          typography: {
            fontFamily: 'Inter',
            fontWeight: 'Bold',
            fontSize: '24',
          },
        },
        data: {
          typography: 'type.heading.h1',
        },
      },
    );
    expect(setTextValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(textNodeMock).toEqual({ ...textNodeMock, textStyleId: '456' });
  });

  it('sets effectStyle if matching Style is found', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'shadows.default',
          type: TokenTypes.BOX_SHADOW,
          value: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
      ],
      styleReferences: new Map([['shadows.default', '123']]),
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          boxShadow: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
        data: {
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('calls setEffectValuesOnTarget if effect node and effects are given', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'shadows.default',
          type: TokenTypes.BOX_SHADOW,
          value: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
      ],
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          boxShadow: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
        data: {
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(setEffectValuesOnTargetSpy).toHaveBeenCalled();
  });

  it('should be able to find a theme prefixed style', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'shadows.default',
          type: TokenTypes.BOX_SHADOW,
          value: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
      ],
      styleReferences: new Map([['light.shadows.default', '123']]),
      stylePathPrefix: 'light',
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          boxShadow: {
            type: BoxShadowTypes.DROP_SHADOW,
            color: '#00000080',
            x: 0,
            y: 0,
            blur: 10,
            spread: 0,
          },
        },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(setEffectValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, effectStyleId: '123' });
  });

  it('sets fillStyle if matching Style', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'colors.red',
          type: TokenTypes.COLOR,
          value: '#ff0000',
        },
      ],
      styleReferences: new Map([['colors.red', '123']]),
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          fill: '#ff0000',
        },
        data: {
          fill: 'colors.red',
        },
      },
    );
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, fillStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if fill node and fill is given', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'colors.red',
          type: TokenTypes.COLOR,
          value: '#ff0000',
        },
      ],
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          fill: '#ff0000',
        },
        data: {
          fill: 'colors.red',
        },
      },
    );
    expect(setColorValuesOnTargetSpy).toHaveBeenCalledWith({
      target: solidNodeMock, token: 'colors.red', key: 'fills', givenValue: '#ff0000',
    });
  });

  it('sets strokeStyleId if matching Style', async () => {
    defaultTokenValueRetriever.initiate({
      tokens: [
        {
          name: 'colors.red',
          type: TokenTypes.COLOR,
          value: '#ff0000',
        },
      ],
      styleReferences: new Map([['colors.red', '123']]),
    });
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          borderColor: '#ff0000',
        },
        data: {
          borderColor: 'colors.red',
        },
      },
    );
    expect(setColorValuesOnTargetSpy).not.toHaveBeenCalled();
    expect(solidNodeMock).toEqual({ ...solidNodeMock, strokeStyleId: '123' });
  });

  it('calls setColorValuesOnTarget if border node and border is given', async () => {
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          borderColor: '#ff0000',
        },
        data: {
          borderColor: 'colors.red',
        },
      },
    );
    expect(setBorderColorValuesOnTargetSpy).toHaveBeenCalledWith({ node: solidNodeMock, data: 'colors.red', value: '#ff0000' });
  });

  it('can set padding and spacing if spacing is defined', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          spacing: 20,
        },
        data: {
          spacing: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set horizontalPadding', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          horizontalPadding: 20,
        },
        data: {
          horizontalPadding: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set verticalPadding', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          verticalPadding: 20,
        },
        data: {
          verticalPadding: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingTop).toBe(20);
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set itemSpacing', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          itemSpacing: 20,
        },
        data: {
          itemSpacing: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.itemSpacing).toBe(20);
  });

  it('can set paddingTop', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          paddingTop: 20,
        },
        data: {
          paddingTop: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingTop).toBe(20);
  });

  it('can set paddingRight', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          paddingRight: 20,
        },
        data: {
          paddingRight: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingRight).toBe(20);
  });

  it('can set paddingBottom', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          paddingBottom: 20,
        },
        data: {
          paddingBottom: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingBottom).toBe(20);
  });

  it('can set paddingLeft', async () => {
    await setValuesOnNode(
      {
        node: frameNodeMock,
        values: {
          paddingLeft: 20,
        },
        data: {
          paddingLeft: 'spacing.lg',
        },
      },
    );
    expect(frameNodeMock.paddingLeft).toBe(20);
  });

  it('changes fill if needed', async () => {
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: { fill: '#ff0000' },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
          fill: 'fg.default',
        },
      },
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
      {
        node: textNodeMock,
        values: { fill: '#ff0000', value: 'My new content' },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
          fill: 'default',
        },
      },
    );
    expect(textNodeMock.characters).toEqual('My new content');
  });

  it('doesnt change characters if not needed', async () => {
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: { fill: '#00ff00' },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
          fill: 'fg.default',
        },
      },
    );
    expect(textNodeMock.characters).toEqual('foobar');
  });

  it('should change characters when the value is 0', async () => {
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {
          value: 0,
        },
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
    );
    expect(figma.loadFontAsync).toHaveBeenCalled();
    expect(textNodeMock.characters).toEqual('0');
  });

  it('should not change characters when the value is undefined', async () => {
    await setValuesOnNode(
      {
        node: textNodeMock,
        values: {},
        data: {
          typography: 'type.heading.h1',
          boxShadow: 'shadows.default',
        },
      },
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
    await setValuesOnNode({ node: solidNodeMock, values, data });
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
      id: '123:521',
      resize: mockResize,
    } as unknown as RectangleNode;
    const values = {
      dimension: '12px',
    };
    const data = { dimension: 'dimension.regular' };
    await setValuesOnNode({ node: mockNode, values, data });
    expect(mockResize).toBeCalledWith(12, 12);
  });

  it('should set itemSpacing when dimension token applied to the node which has itemSpacing property', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      id: '123:521',
      resize: mockResize,
      itemSpacing: 0,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
    } as unknown as FrameNode;
    const values = {
      dimension: '12px',
    };
    const data = { dimension: 'dimension.regular' };
    await setValuesOnNode({ node: mockNode, values, data });
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
    await setValuesOnNode({ node: solidNodeMock, values, data });
    expect(solidNodeMock.strokeWeight).toEqual(12);
    expect(solidNodeMock.dashPattern).toEqual([0, 0]);
  });

  it('apply token with none value', async () => {
    await setValuesOnNode(
      {
        node: solidNodeMock,
        values: {
          borderColor: 'none',
          borderRadius: 'none',
        },
        data: {
          borderColor: 'border-color.none',
          borderRadius: 'border-radius.none',
        },
      },
    );
    expect(solidNodeMock).toEqual({ ...solidNodeMock, strokes: [], cornerRadius: 0 });
  });

  it('should apply border width to ELLIPSE node correctly', async () => {
    // Mock an ELLIPSE node that only has strokeWeight, not individual stroke weight properties
    const ellipseNodeMock = ({
      id: '123:459',
      type: 'ELLIPSE',
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
      // Note: ELLIPSE nodes don't have strokeTopWeight, strokeRightWeight, etc.
    } as unknown) as EllipseNode;

    const values = {
      borderWidth: '3',
    };

    const data = {
      borderWidth: 'border-width-3',
    };

    await setValuesOnNode({ node: ellipseNodeMock, values, data });

    // The border width should be applied to strokeWeight
    expect(ellipseNodeMock.strokeWeight).toEqual(3);
  });

  it('should apply border width to RECTANGLE node with individual stroke weights', async () => {
    // Mock a RECTANGLE node that has individual stroke weight properties
    const rectangleNodeMock = ({
      id: '123:460',
      type: 'RECTANGLE',
      strokeWeight: 0,
      strokeTopWeight: 0,
      strokeRightWeight: 0,
      strokeBottomWeight: 0,
      strokeLeftWeight: 0,
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

    const values = {
      borderWidth: '3',
    };

    const data = {
      borderWidth: 'border-width-3',
    };

    await setValuesOnNode({ node: rectangleNodeMock, values, data });

    // For RECTANGLE nodes, the border width should be applied to strokeWeight
    // (since we're not applying variables in this test, it falls back to raw value)
    expect(rectangleNodeMock.strokeWeight).toEqual(3);
  });

  it('can set boolean token for visibility', async () => {
    const values = {
      visibility: 'false',
    };
    const data = { visibility: 'boolean-false' };
    await setValuesOnNode({ node: solidNodeMock, values, data });
    expect(solidNodeMock.visible).toEqual(false);
  });

  it('should resize when number token applied to the node which has no itemSpacing property', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      id: '123:522',
      resize: mockResize,
    } as unknown as RectangleNode;
    const values = {
      number: '12px',
    };
    const data = { number: 'number.regular' };
    await setValuesOnNode({ node: mockNode, values, data });
    expect(mockResize).toBeCalledWith(12, 12);
  });

  it('should set itemSpacing when number token applied to the node which has itemSpacing property', async () => {
    const mockResize = jest.fn();
    const mockNode = {
      id: '123:521',
      resize: mockResize,
      itemSpacing: 0,
      primaryAxisAlignItems: 'SPACE_BETWEEN',
    } as unknown as FrameNode;
    const values = {
      number: '12px',
    };
    const data = { number: 'number.regular' };
    await setValuesOnNode({ node: mockNode, values, data });
    expect(mockResize).toBeCalledTimes(0);
    expect(mockNode.itemSpacing).toEqual(12);
  });
});
