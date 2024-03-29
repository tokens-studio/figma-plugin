import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import setColorValuesOnTarget from '../setColorValuesOnTarget';

describe('setColorValuesOnTarget', () => {
  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'red',
        type: TokenTypes.COLOR,
        value: '#ff0000',
        rawValue: '#ff0000',
        description: 'Red',
      },
      {
        name: 'gradient',
        type: TokenTypes.COLOR,
        value: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',
        rawValue: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',

      }],
    });
  });
  it('should be able to update the paints on a style', async () => {
    const mockStyle = {
      type: 'PAINT',
      paints: [],
      description: '',
    } as unknown as PaintStyle;

    await setColorValuesOnTarget(mockStyle, 'red', 'paints');

    expect(mockStyle.description).toEqual('Red');

    expect(mockStyle.paints).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to update the fills on a node', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget(mockNode, 'red', 'fills');

    expect(mockNode.fills).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to update the strokes on a node', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      strokes: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget(mockNode, 'red', 'strokes');

    expect(mockNode.strokes).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to handle a linear gradient', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget(mockNode, 'gradient', 'fills');

    expect(mockNode.fills).toMatchSnapshot();
  });
});
