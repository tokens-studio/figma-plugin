import setColorValuesOnTarget from '../setColorValuesOnTarget';

describe('setColorValuesOnTarget', () => {
  it('should be able to update the paints on a style', () => {
    const mockStyle = {
      type: 'PAINT',
      paints: [],
      description: '',
    } as unknown as PaintStyle;

    setColorValuesOnTarget(mockStyle, {
      value: '#ff0000',
      description: 'Red',
    }, 'paints');

    expect(mockStyle.description).toEqual('Red');

    expect(mockStyle.paints).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to update the fills on a node', () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    setColorValuesOnTarget(mockNode, {
      value: '#ff0000',
    }, 'fills');

    expect(mockNode.fills).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to update the strokes on a node', () => {
    const mockNode = {
      type: 'RECTANGLE',
      strokes: [],
    } as unknown as RectangleNode;

    setColorValuesOnTarget(mockNode, {
      value: '#ff0000',
    }, 'strokes');

    expect(mockNode.strokes).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to handle a linear gradient', () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    setColorValuesOnTarget(mockNode, {
      value: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',
    }, 'fills');

    expect(mockNode.fills).toMatchSnapshot();
  });
});
