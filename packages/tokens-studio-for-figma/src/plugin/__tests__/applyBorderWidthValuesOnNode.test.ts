import { applyBorderWidthValuesOnNode } from '../applyBorderWidthValuesOnNode';
import { tryApplyVariableId } from '../../utils/tryApplyVariableId';

// Mock the tryApplyVariableId function
jest.mock('../../utils/tryApplyVariableId');
const mockTryApplyVariableId = tryApplyVariableId as jest.MockedFunction<typeof tryApplyVariableId>;

describe('applyBorderWidthValuesOnNode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply variable to strokeWeight for ELLIPSE nodes', async () => {
    // Mock an ELLIPSE node that only has strokeWeight
    const ellipseNode = {
      type: 'ELLIPSE',
      strokeWeight: 0,
      // ELLIPSE nodes don't have individual stroke weight properties
    } as unknown as EllipseNode;

    const data = {
      borderWidth: 'border-width-token',
    };

    const values = {
      borderWidth: '4',
    };

    const baseFontSize = '16';

    // Mock tryApplyVariableId to return true for strokeWeight
    mockTryApplyVariableId.mockImplementation(async (node, type, token) => {
      if (type === 'strokeWeight' && token === 'border-width-token') {
        return true;
      }
      return false;
    });

    await applyBorderWidthValuesOnNode(ellipseNode, data, values, baseFontSize);

    // Should try to apply variable to strokeWeight directly
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(ellipseNode, 'strokeWeight', 'border-width-token');
    
    // Should not try to apply to individual stroke weight properties
    expect(mockTryApplyVariableId).not.toHaveBeenCalledWith(ellipseNode, 'strokeTopWeight', expect.any(String));
    expect(mockTryApplyVariableId).not.toHaveBeenCalledWith(ellipseNode, 'strokeRightWeight', expect.any(String));
    expect(mockTryApplyVariableId).not.toHaveBeenCalledWith(ellipseNode, 'strokeBottomWeight', expect.any(String));
    expect(mockTryApplyVariableId).not.toHaveBeenCalledWith(ellipseNode, 'strokeLeftWeight', expect.any(String));

    // Should not set raw value since variable was applied successfully
    expect(ellipseNode.strokeWeight).toBe(0);
  });

  it('should apply variable to individual stroke weights for RECTANGLE nodes', async () => {
    // Mock a RECTANGLE node that has individual stroke weight properties
    const rectangleNode = {
      type: 'RECTANGLE',
      strokeWeight: 0,
      strokeTopWeight: 0,
      strokeRightWeight: 0,
      strokeBottomWeight: 0,
      strokeLeftWeight: 0,
    } as unknown as RectangleNode;

    const data = {
      borderWidth: 'border-width-token',
    };

    const values = {
      borderWidth: '4',
    };

    const baseFontSize = '16';

    // Mock tryApplyVariableId to return true for all individual stroke weights
    mockTryApplyVariableId.mockImplementation(async (node, type, token) => {
      if (token === 'border-width-token' && 
          ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'].includes(type)) {
        return true;
      }
      return false;
    });

    await applyBorderWidthValuesOnNode(rectangleNode, data, values, baseFontSize);

    // Should try to apply variable to all individual stroke weight properties
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeTopWeight', 'border-width-token');
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeRightWeight', 'border-width-token');
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeBottomWeight', 'border-width-token');
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeLeftWeight', 'border-width-token');

    // Should not try to apply to strokeWeight directly
    expect(mockTryApplyVariableId).not.toHaveBeenCalledWith(rectangleNode, 'strokeWeight', expect.any(String));

    // Should not set raw value since variable was applied successfully
    expect(rectangleNode.strokeWeight).toBe(0);
  });

  it('should fall back to raw value for ELLIPSE when variable application fails', async () => {
    // Mock an ELLIPSE node that only has strokeWeight
    const ellipseNode = {
      type: 'ELLIPSE',
      strokeWeight: 0,
    } as unknown as EllipseNode;

    const data = {
      borderWidth: 'border-width-token',
    };

    const values = {
      borderWidth: '4',
    };

    const baseFontSize = '16';

    // Mock tryApplyVariableId to return false (variable application failed)
    mockTryApplyVariableId.mockResolvedValue(false);

    await applyBorderWidthValuesOnNode(ellipseNode, data, values, baseFontSize);

    // Should try to apply variable to strokeWeight
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(ellipseNode, 'strokeWeight', 'border-width-token');

    // Should fall back to setting raw value
    expect(ellipseNode.strokeWeight).toBe(4);
  });

  it('should fall back to raw value for RECTANGLE when variable application fails', async () => {
    // Mock a RECTANGLE node that has individual stroke weight properties
    const rectangleNode = {
      type: 'RECTANGLE',
      strokeWeight: 0,
      strokeTopWeight: 0,
      strokeRightWeight: 0,
      strokeBottomWeight: 0,
      strokeLeftWeight: 0,
    } as unknown as RectangleNode;

    const data = {
      borderWidth: 'border-width-token',
    };

    const values = {
      borderWidth: '4',
    };

    const baseFontSize = '16';

    // Mock tryApplyVariableId to return false (variable application failed)
    mockTryApplyVariableId.mockResolvedValue(false);

    await applyBorderWidthValuesOnNode(rectangleNode, data, values, baseFontSize);

    // Should try to apply variable to strokeTopWeight first (due to short-circuit evaluation)
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeTopWeight', 'border-width-token');

    // Due to short-circuit evaluation with &&, if the first call fails, the rest won't be called
    // This is the expected behavior since we need ALL to succeed for variable application to work

    // Should fall back to setting raw value
    expect(rectangleNode.strokeWeight).toBe(4);
  });

  it('should handle partial variable application for RECTANGLE nodes', async () => {
    // Mock a RECTANGLE node that has individual stroke weight properties
    const rectangleNode = {
      type: 'RECTANGLE',
      strokeWeight: 0,
      strokeTopWeight: 0,
      strokeRightWeight: 0,
      strokeBottomWeight: 0,
      strokeLeftWeight: 0,
    } as unknown as RectangleNode;

    const data = {
      borderWidth: 'border-width-token',
    };

    const values = {
      borderWidth: '4',
    };

    const baseFontSize = '16';

    // Mock tryApplyVariableId to return true for top and right, but fail for bottom
    mockTryApplyVariableId.mockImplementation(async (node, type, token) => {
      if (token === 'border-width-token') {
        // Succeed for top and right, fail for bottom (left won't be called due to short-circuit)
        return type === 'strokeTopWeight' || type === 'strokeRightWeight';
      }
      return false;
    });

    await applyBorderWidthValuesOnNode(rectangleNode, data, values, baseFontSize);

    // Should try to apply variable to stroke weight properties until one fails
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeTopWeight', 'border-width-token');
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeRightWeight', 'border-width-token');
    expect(mockTryApplyVariableId).toHaveBeenCalledWith(rectangleNode, 'strokeBottomWeight', 'border-width-token');
    // strokeLeftWeight won't be called due to short-circuit evaluation when strokeBottomWeight fails

    // Should fall back to setting raw value since not all variables were applied
    expect(rectangleNode.strokeWeight).toBe(4);
  });
});
