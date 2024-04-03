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
      },
      {
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

  // Test when token doesn't exist
  it('should handle non-existent token gracefully', async () => {
    const mockNode = {
      type: 'RECTANGLE',
      fills: [],
    } as unknown as RectangleNode;

    await setColorValuesOnTarget(mockNode, 'non-existent-token', 'fills');

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

    await setColorValuesOnTarget(mockStyle, 'ref-red', 'paints');

    // Assert that fills have been updated to the referenced token's color
    expect(mockSetBoundVariableForPaint).toHaveBeenCalledWith({
      color: { r: 0, g: 0, b: 0 },
      type: 'SOLID',
    }, 'color', {
      id: 'VariableID:3456', key: '34567', name: 'fg/subtle', variableCollectionId: 'VariableCollectionId:23:23456',
    });
  });

  // Test when token reference is not found
  it('should handle missing token references by applying the hex value', async () => {
    const mockStyle = {
      paints: [],
    } as unknown as PaintStyle;

    mockImportVariableByKeyAsync.mockImplementationOnce(() => null);

    await setColorValuesOnTarget(mockStyle, 'ref-red', 'paints');

    // Assert that fills have been updated to the hex value of the token
    expect(mockSetBoundVariableForPaint).not.toHaveBeenCalledWith();
    expect(mockStyle.paints).toEqual([{
      type: 'SOLID',
      opacity: 1,
      color: { r: 1, g: 0, b: 0 },
    }]);
  });
});
