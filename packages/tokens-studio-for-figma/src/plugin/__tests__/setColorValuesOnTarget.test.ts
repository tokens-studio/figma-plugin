import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from '../TokenValueRetriever';
import setColorValuesOnTarget from '../setColorValuesOnTarget';
import { mockImportVariableByKeyAsync, mockSetBoundVariableForPaint } from '../../../tests/__mocks__/figmaMock';

describe('setColorValuesOnTarget', () => {
  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'red',
        type: TokenTypes.COLOR,
        value: '#ff0000',
        rawValue: '#ff0000',
        description: 'Red',
      }, {
        name: 'black',
        type: TokenTypes.COLOR,
        value: '#000000',
        rawValue: '#000000',
        description: 'Black',
      }, {
        name: 'gradient',
        type: TokenTypes.COLOR,
        value: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',
        rawValue: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)',
      }, {
        name: 'ref-red',
        type: TokenTypes.COLOR,
        value: '#ff0000',
        rawValue: '{red}',
        description: 'Referenced Red',
      }, {
        name: 'gradient1',
        type: TokenTypes.COLOR,
        value: 'linear-gradient(90deg, #ff0000 0%, #000000 100%)',
        rawValue: 'linear-gradient(90deg, {red} 0%, {black} 100%)',
      }, {
        name: 'border',
        type: TokenTypes.BORDER,
        value: {
          color: '#ff0000',
          width: '12px',
          style: 'solid',
        },
        rawValue: '#ff0000' as any, // FIXME: Figure out why this is a string in the plugin, are the types incorrect, or should this be resolved as an object instead?
        description: 'Border',
      }],
      variableReferences: new Map([['red', '123']]),
      createStylesWithVariableReferences: true,
    });
  });

  it('should be able to update the paints on a style', async () => {
    const mockStyle = {
      type: 'PAINT',
      paints: [],
      description: '',
    } as unknown as PaintStyle;

    await setColorValuesOnTarget({ target: mockStyle, token: 'red', key: 'paints' });

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

    await setColorValuesOnTarget({ target: mockNode, token: 'red', key: 'fills' });

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

    await setColorValuesOnTarget({ target: mockNode, token: 'red', key: 'strokes' });

    expect(mockNode.strokes).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  it('should be able to update the strokes on a node from a border style', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      strokes: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget({ target: mockNode, token: 'border', key: 'strokes' });

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

    await setColorValuesOnTarget({ target: mockNode, token: 'gradient', key: 'fills' });

    expect(mockNode.fills).toMatchSnapshot();
  });

  // Test when token doesn't exist
  it('should handle non-existent token gracefully', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget({ target: mockNode, token: 'non-existent-token', key: 'fills' });

    // Assert that fills have not been changed
    expect(mockNode.fills).toEqual([]);
  });

  // Test when token value is a reference to another token
  it('should handle token references correctly', async () => {
    const mockStyle = {
      paints: [],
    } as unknown as PaintStyle;

    mockImportVariableByKeyAsync.mockImplementationOnce(() => ({
      id: 'VariableID:3456',
      key: '34567',
      variableCollectionId: 'VariableCollectionId:23:23456',
      name: 'fg/subtle',
    }));

    await setColorValuesOnTarget({ target: mockStyle, token: 'ref-red', key: 'paints' });

    // Assert that fills have been updated to the referenced token's color
    expect(mockSetBoundVariableForPaint).toHaveBeenCalledWith({
      color: { r: 0, g: 0, b: 0 },
      type: 'SOLID',
    }, 'color', {
      id: 'VariableID:3456', key: '34567', name: 'fg/subtle', variableCollectionId: 'VariableCollectionId:23:23456',
    });
  });

  // Test a linear gradient token with references
  it('should handle a linear gradient token with references correctly', async () => {
    const mockStyle = {
      paints: [],
    } as unknown as PaintStyle;

    await setColorValuesOnTarget({ target: mockStyle, token: 'gradient1', key: 'paints' });

    expect(mockStyle.paints).toEqual([{
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        {
          color: {
            r: 1,
            g: 0,
            b: 0,
            a: 1,
          },
          position: 0,
        }, {
          color: {
            r: 0,
            g: 0,
            b: 0,
            a: 1,
          },
          position: 1,
        },
      ],
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
    }]);
  });

  // Test when token reference is not found
  it('should handle missing token references by applying the hex value', async () => {
    const mockStyle = {
      paints: [],
      consumers: [],
    } as unknown as PaintStyle;

    mockImportVariableByKeyAsync.mockImplementationOnce(() => null);

    await setColorValuesOnTarget({
      target: mockStyle, token: 'ref-red', key: 'paints', givenValue: '#ff0000',
    });

    // Assert that fills have been updated to the hex value of the token
    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalledWith();
    expect(mockStyle.paints).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });

  test('setColorValuesOnTarget uses givenValue when provided', async () => {
    const mockStyle = {
      paints: [],
      consumers: [],
    } as unknown as PaintStyle;
    const token = 'mock-token';
    const key = 'paints';
    const givenValue = '#00ff00'; // Mock a givenValue

    await setColorValuesOnTarget({
      target: mockStyle, token, key, givenValue,
    });

    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalledWith();
    expect(mockStyle.paints).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 0, g: 1, b: 0 },
    }]);
  });
});
