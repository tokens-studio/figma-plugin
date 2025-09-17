import { applySizingValuesOnNode } from './applySizingValuesOnNode';

describe('applySizingValuesOnNode', () => {
  const baseFontSize = '16';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('width property handling', () => {
    it('should handle normal width values', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
        height: 100,
      };
      const values = { width: '200px' };
      const data = { width: 'width-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(200, 100);
    });

    it('should set layoutAlign to STRETCH for 100% width in auto layout parent', async () => {
      const mockNode = {
        id: 'node-id-layout',
        resize: jest.fn(),
        type: 'RECTANGLE',
        layoutAlign: 'INHERIT',
        height: 100,
        parent: {
          type: 'FRAME',
          layoutMode: 'VERTICAL', // This makes isAutoLayout return true
        },
      };
      const values = { width: '100%' };
      const data = { width: 'width-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.layoutAlign).toBe('STRETCH');
      expect(mockNode.resize).not.toHaveBeenCalled();
    });

    it('should set width to parent width for 100% width in regular parent', async () => {
      const mockNode = {
        id: 'node-id-parent',
        resize: jest.fn(),
        type: 'RECTANGLE',
        height: 100,
        parent: {
          type: 'FRAME',
          width: 500,
          // No layoutMode, so isAutoLayout returns false
        },
      };
      const values = { width: '100%' };
      const data = { width: 'width-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(500, 100);
    });

    it('should fallback to normal width handling if 100% but no applicable parent', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
        height: 100,
        // No parent
      };
      const values = { width: '100%' };
      const data = { width: 'width-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 100); // transformValue('100%', 'sizing', '16') = 100
    });
  });

  describe('height property handling', () => {
    it('should handle normal height values', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
        width: 100,
      };
      const values = { height: '150px' };
      const data = { height: 'height-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 150);
    });

    it('should set layoutAlign to STRETCH for 100% height in auto layout parent', async () => {
      const mockNode = {
        id: 'node-id-layout',
        resize: jest.fn(),
        type: 'RECTANGLE',
        layoutAlign: 'INHERIT',
        width: 100,
        parent: {
          type: 'FRAME',
          layoutMode: 'HORIZONTAL', // This makes isAutoLayout return true
        },
      };
      const values = { height: '100%' };
      const data = { height: 'height-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.layoutAlign).toBe('STRETCH');
      expect(mockNode.resize).not.toHaveBeenCalled();
    });

    it('should set height to parent height for 100% height in regular parent', async () => {
      const mockNode = {
        id: 'node-id-parent-height',
        resize: jest.fn(),
        type: 'RECTANGLE',
        width: 100,
        parent: {
          type: 'FRAME',
          height: 300,
          // No layoutMode, so isAutoLayout returns false
        },
      };
      const values = { height: '100%' };
      const data = { height: 'height-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 300);
    });

    it('should fallback to normal height handling if 100% but no applicable parent', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
        width: 100,
        // No parent
      };
      const values = { height: '100%' };
      const data = { height: 'height-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 100); // transformValue('100%', 'sizing', '16') = 100
    });
  });

  describe('sizing (both) property handling', () => {
    it('should handle normal sizing values', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
      };
      const values = { sizing: '100px' };
      const data = { sizing: 'sizing-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 100);
    });

    it('should set layoutAlign to STRETCH for 100% sizing in auto layout parent', async () => {
      const mockNode = {
        id: 'node-id-layout',
        resize: jest.fn(),
        type: 'RECTANGLE',
        layoutAlign: 'INHERIT',
        parent: {
          type: 'FRAME',
          layoutMode: 'VERTICAL', // This makes isAutoLayout return true
        },
      };
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.layoutAlign).toBe('STRETCH');
      expect(mockNode.resize).not.toHaveBeenCalled();
    });

    it('should set size to parent size for 100% sizing in regular parent', async () => {
      const mockNode = {
        id: 'node-id-parent-size',
        resize: jest.fn(),
        type: 'RECTANGLE',
        parent: {
          type: 'FRAME',
          width: 400,
          height: 300,
          // No layoutMode, so isAutoLayout returns false
        },
      };
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(400, 300);
    });

    it('should fallback to normal sizing handling if 100% but no applicable parent', async () => {
      const mockNode = {
        id: 'node-id',
        resize: jest.fn(),
        type: 'RECTANGLE',
        // No parent
      };
      const values = { sizing: '100%' };
      const data = { sizing: 'sizing-token' };

      await applySizingValuesOnNode(mockNode as unknown as BaseNode, data, values, baseFontSize);

      expect(mockNode.resize).toHaveBeenCalledWith(100, 100); // transformValue('100%', 'sizing', '16') = 100
    });
  });
});
