import { applySizingValuesOnNode } from './applySizingValuesOnNode';
import { isAutoLayout } from '@/utils/isAutoLayout';
import { isPartOfInstance } from '@/utils/is/isPartOfInstance';
import { transformValue } from './helpers';
import { tryApplyVariableId } from '@/utils/tryApplyVariableId';

// Mock modules
jest.mock('@/utils/isAutoLayout', () => ({
  isAutoLayout: jest.fn(),
}));

jest.mock('@/utils/is/isPartOfInstance', () => ({
  isPartOfInstance: jest.fn(),
}));

jest.mock('@/utils/tryApplyVariableId', () => ({
  tryApplyVariableId: jest.fn(),
}));

jest.mock('./helpers', () => ({
  transformValue: jest.fn(),
}));

describe('applySizingValuesOnNode', () => {
  // Setup mocks
  const mockNode = {
    id: 'node-id',
    resize: jest.fn(),
    type: 'RECTANGLE',
  };

  const mockNodeWithLayoutAlign = {
    id: 'node-id-layout',
    resize: jest.fn(),
    type: 'RECTANGLE',
    layoutAlign: 'INHERIT',
    parent: {
      type: 'FRAME',
      layoutMode: 'VERTICAL',
    },
  };

  const mockNodeWithParent = {
    id: 'node-id-parent',
    resize: jest.fn(),
    type: 'RECTANGLE',
    parent: {
      type: 'FRAME',
      width: 500,
    },
  };

  const baseFontSize = '16';

  beforeEach(() => {
    jest.clearAllMocks();
    (tryApplyVariableId as jest.Mock).mockResolvedValue(false);
    (isPartOfInstance as jest.Mock).mockReturnValue(false);
  });

  describe('width property handling', () => {
    it('should handle normal width values', async () => {
      const values = { width: '200px' };
      const data = { width: 'width-token' };
      (transformValue as jest.Mock).mockReturnValue(200);

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('200px', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(200, undefined);
    });

    it('should set layoutAlign to STRETCH for 100% width in auto layout parent', async () => {
      const values = { width: '100%' };
      const data = { width: 'width-token' };
      (isAutoLayout as jest.Mock).mockReturnValue(true);

      await applySizingValuesOnNode(mockNodeWithLayoutAlign as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithLayoutAlign.layoutAlign).toBe('STRETCH');
      expect(mockNodeWithLayoutAlign.resize).not.toHaveBeenCalled();
    });

    it('should set width to parent width for 100% width in regular parent', async () => {
      const values = { width: '100%' };
      const data = { width: 'width-token' };

      await applySizingValuesOnNode(mockNodeWithParent as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithParent.resize).toHaveBeenCalledWith(500, undefined);
    });

    it('should fallback to normal width handling if 100% but no applicable parent', async () => {
      const values = { width: '100%' };
      const data = { width: 'width-token' };
      (transformValue as jest.Mock).mockReturnValue(16); // Since 100% would be transformed

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('100%', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(16, undefined);
    });
  });

  describe('height property handling', () => {
    it('should handle normal height values', async () => {
      const values = { height: '150px' };
      const data = { height: 'height-token' };
      (transformValue as jest.Mock).mockReturnValue(150);

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('150px', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(undefined, 150);
    });

    it('should set layoutAlign to STRETCH for 100% height in auto layout parent', async () => {
      const values = { height: '100%' };
      const data = { height: 'height-token' };
      (isAutoLayout as jest.Mock).mockReturnValue(true);

      await applySizingValuesOnNode(mockNodeWithLayoutAlign as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithLayoutAlign.layoutAlign).toBe('STRETCH');
      expect(mockNodeWithLayoutAlign.resize).not.toHaveBeenCalled();
    });

    it('should set height to parent height for 100% height in regular parent', async () => {
      const mockNodeWithParentHeight = {
        id: 'node-id-parent-height',
        resize: jest.fn(),
        type: 'RECTANGLE',
        parent: {
          type: 'FRAME',
          height: 300,
        },
      };
      const values = { height: '100%' };
      const data = { height: 'height-token' };

      await applySizingValuesOnNode(mockNodeWithParentHeight as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithParentHeight.resize).toHaveBeenCalledWith(undefined, 300);
    });

    it('should fallback to normal height handling if 100% but no applicable parent', async () => {
      const values = { height: '100%' };
      const data = { height: 'height-token' };
      (transformValue as jest.Mock).mockReturnValue(16); // Since 100% would be transformed

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('100%', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(undefined, 16);
    });
  });

  describe('sizing (both) property handling', () => {
    it('should handle normal sizing values', async () => {
      const values = { sizing: '100px' };
      const data = { sizing: 'sizing-token' };
      (transformValue as jest.Mock).mockReturnValue(100);

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('100px', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(100, 100);
    });

    it('should set layoutAlign to STRETCH for 100% sizing in auto layout parent', async () => {
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };
      (isAutoLayout as jest.Mock).mockReturnValue(true);

      await applySizingValuesOnNode(mockNodeWithLayoutAlign as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithLayoutAlign.layoutAlign).toBe('STRETCH');
      expect(mockNodeWithLayoutAlign.resize).not.toHaveBeenCalled();
    });

    it('should set size to parent size for 100% sizing in regular parent', async () => {
      const mockNodeWithParentSize = {
        id: 'node-id-parent-size',
        resize: jest.fn(),
        type: 'RECTANGLE',
        parent: {
          type: 'FRAME',
          width: 400,
          height: 300,
        },
      };
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };

      await applySizingValuesOnNode(mockNodeWithParentSize as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNodeWithParentSize.resize).toHaveBeenCalledWith(400, 300);
    });

    it('should fallback to normal sizing handling if 100% but no applicable parent', async () => {
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };
      (transformValue as jest.Mock).mockReturnValue(16); // Since 100% would be transformed

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(transformValue).toHaveBeenCalledWith('100%', 'sizing', '16');
      expect(mockNode.resize).toHaveBeenCalledWith(16, 16);
    });
  });
});
