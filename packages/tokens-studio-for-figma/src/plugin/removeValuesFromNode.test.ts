import { Properties } from '@/constants/Properties';
import removeValuesFromNode from './removeValuesFromNode';

describe('removeTokensByValue', () => {
  let mockNode: BaseNode;
  beforeEach(() => {
    mockNode = ({
      cornerRadius: 10,
      topLeftRadius: 10,
      topRightRadius: 10,
      bottomRightRadius: 10,
      bottomLeftRadius: 10,
      strokeWeight: 10,
      strokeTopWeight: 10,
      strokeRightWeight: 10,
      strokeBottomWeight: 10,
      strokeLeftWeight: 10,
      effects: [
        {
          type: 'DROP_SHADOW',
          color: {
            a: 0.5,
            r: 0,
            g: 0,
            b: 0,
          },
        },
        {
          type: 'INNER_SHADOW',
          color: {
            a: 0.5,
            r: 0,
            g: 0,
            b: 0,
          },
        },
      ],
      opacity: 0.6,
      fills: [
        {
          type: 'GRADIENT_LINEAR',
          gradientTransform: [
            [1, 0, 0],
            [0, 1, 0],
          ],
        },
      ],
      strokes: [{
        type: 'SOLID',
        opacity: 1,
        color: { r: 1, g: 0, b: 0 },
      }],
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 10,
      itemSpacing: 10,
      textDecoration: 'underline',
      visible: false,
    } as unknown) as BaseNode;
  });

  it('should set cornerRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderRadius);
    expect(mockNode.cornerRadius).toBe(0);
  });

  it('should set topLeftRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderRadiusTopLeft);
    expect(mockNode.topLeftRadius).toBe(0);
  });

  it('should set topRightRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderRadiusTopRight);
    expect(mockNode.topRightRadius).toBe(0);
  });

  it('should set bottomRightRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderRadiusBottomRight);
    expect(mockNode.bottomRightRadius).toBe(0);
  });

  it('should set bottomLeftRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderRadiusBottomLeft);
    expect(mockNode.bottomLeftRadius).toBe(0);
  });

  it('should only remove drop shadow', () => {
    removeValuesFromNode(mockNode, Properties.boxShadow);
    expect(mockNode.effects).toEqual([
      {
        type: 'INNER_SHADOW',
        color: {
          a: 0.5,
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ]);
  });

  it('should set opacity as 1', () => {
    removeValuesFromNode(mockNode, Properties.opacity);
    expect(mockNode.opacity).toBe(1);
  });

  it('should set strokeWeight as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderWidthTop);
    expect(mockNode.strokeWeight).toBe(0);
  });

  it('should set strokeWeight as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderWidthRight);
    expect(mockNode.strokeWeight).toBe(0);
  });

  it('should set strokeWeight as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderWidthBottom);
    expect(mockNode.strokeWeight).toBe(0);
  });

  it('should set strokeWeight as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderWidthLeft);
    expect(mockNode.strokeWeight).toBe(0);
  });

  it('should set strokeWeight as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderWidth);
    expect(mockNode.strokeWeight).toBe(0);
  });

  it('should set fills as empty array', () => {
    removeValuesFromNode(mockNode, Properties.fill);
    expect(mockNode.fills).toEqual([]);
  });

  it('should set strokes as empty array', () => {
    removeValuesFromNode(mockNode, Properties.border);
    expect(mockNode.strokes).toEqual([]);
  });

  it('should set strokeTopWeight as zero', () => {
    removeValuesFromNode(mockNode, Properties.borderTop);
    expect(mockNode.strokes).toEqual([]);
    expect(mockNode.strokeTopWeight).toEqual(0);
  });

  it('should set strokeRightWeight as zero', () => {
    removeValuesFromNode(mockNode, Properties.borderRight);
    expect(mockNode.strokes).toEqual([]);
    expect(mockNode.strokeRightWeight).toEqual(0);
  });

  it('should set strokeBottomWeight as zero', () => {
    removeValuesFromNode(mockNode, Properties.borderBottom);
    expect(mockNode.strokes).toEqual([]);
    expect(mockNode.strokeBottomWeight).toEqual(0);
  });

  it('should set strokeLeftWeight as zero', () => {
    removeValuesFromNode(mockNode, Properties.borderLeft);
    expect(mockNode.strokes).toEqual([]);
    expect(mockNode.strokeLeftWeight).toEqual(0);
  });

  it('should set all spacings as 0', () => {
    removeValuesFromNode(mockNode, Properties.spacing);
    expect(mockNode.paddingLeft).toBe(0);
    expect(mockNode.paddingRight).toBe(0);
    expect(mockNode.paddingTop).toBe(0);
    expect(mockNode.paddingBottom).toBe(0);
    expect(mockNode.itemSpacing).toBe(0);
  });

  it('should set paddingTop as 0', () => {
    removeValuesFromNode(mockNode, Properties.paddingTop);
    expect(mockNode.paddingTop).toBe(0);
  });

  it('should set paddingRight as 0', () => {
    removeValuesFromNode(mockNode, Properties.paddingRight);
    expect(mockNode.paddingRight).toBe(0);
  });

  it('should set paddingBottom as 0', () => {
    removeValuesFromNode(mockNode, Properties.paddingBottom);
    expect(mockNode.paddingBottom).toBe(0);
  });

  it('should set paddingLeft as 0', () => {
    removeValuesFromNode(mockNode, Properties.paddingLeft);
    expect(mockNode.paddingLeft).toBe(0);
  });

  it('should set paddingLeft and paddingRight as 0', () => {
    removeValuesFromNode(mockNode, Properties.horizontalPadding);
    expect(mockNode.paddingLeft).toBe(0);
    expect(mockNode.paddingRight).toBe(0);
  });

  it('should set paddingTop and paddingBottom as 0', () => {
    removeValuesFromNode(mockNode, Properties.verticalPadding);
    expect(mockNode.paddingTop).toBe(0);
    expect(mockNode.paddingBottom).toBe(0);
  });

  it('should set itemSpacing as 0', () => {
    removeValuesFromNode(mockNode, Properties.itemSpacing);
    expect(mockNode.itemSpacing).toBe(0);
  });

  it('should set fills as an empty array', () => {
    removeValuesFromNode(mockNode, Properties.asset);
    expect(mockNode.fills).toEqual([]);
  });

  it('should set cornerRadius as 0', () => {
    removeValuesFromNode(mockNode, Properties.borderColor);
    expect(mockNode.strokes).toEqual([]);
  });

  it('should set textDecoration as none', () => {
    removeValuesFromNode(mockNode, Properties.textDecoration);
    expect(mockNode.textDecoration).toEqual('NONE');
  });

  it('should set visible as true when removing values from node', () => {
    removeValuesFromNode(mockNode, Properties.visibility);
    expect(mockNode.visible).toEqual(true);
  });
});
