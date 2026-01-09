import { findAll } from '../../utils/findAll';
import { ValidNodeTypes } from '@/constants/ValidNodeTypes';

describe('Node Finding for Theme Updates', () => {
  describe('findAll', () => {
    it('should not filter by plugin data when nodesWithoutPluginData is true', () => {
      const mockChild = {
        id: 'child',
        type: 'TEXT',
        name: 'Text',
      } as unknown as TextNode;

      const mockParent = {
        id: 'parent',
        type: 'FRAME',
        name: 'Parent Frame',
        children: [mockChild],
        findAllWithCriteria: jest.fn().mockReturnValue([mockChild]),
      } as unknown as FrameNode;

      // When nodesWithoutPluginData is true, findAllWithCriteria should not filter by plugin data
      const result = findAll([mockParent], true, true);

      expect(mockParent.findAllWithCriteria).toHaveBeenCalledWith({
        types: ValidNodeTypes,
        // Should NOT include sharedPluginData filter
      });

      // Should include parent and child
      expect(result).toContain(mockParent);
      expect(result).toContain(mockChild);
    });

    it('should filter by plugin data when nodesWithoutPluginData is false', () => {
      const mockChild = {
        id: 'child',
        type: 'TEXT',
        name: 'Text',
      } as unknown as TextNode;

      const mockParent = {
        id: 'parent',
        type: 'FRAME',
        name: 'Parent Frame',
        children: [mockChild],
        findAllWithCriteria: jest.fn().mockReturnValue([mockChild]),
      } as unknown as FrameNode;

      // When nodesWithoutPluginData is false, findAllWithCriteria should filter by plugin data
      findAll([mockParent], true, false);

      expect(mockParent.findAllWithCriteria).toHaveBeenCalledWith({
        types: ValidNodeTypes,
        sharedPluginData: {
          namespace: 'tokens',
        },
      });
    });

    it('should include self when includeSelf is true', () => {
      const mockNode = {
        id: 'node-1',
        type: 'FRAME',
        name: 'Frame',
        children: [],
        findAllWithCriteria: jest.fn().mockReturnValue([]),
      } as unknown as FrameNode;

      const result = findAll([mockNode], true, true);

      // The node itself should be in the result
      expect(result).toContain(mockNode);
    });

    it('should not include self when includeSelf is false', () => {
      const mockNode = {
        id: 'node-1',
        type: 'FRAME',
        name: 'Frame',
        children: [],
        findAllWithCriteria: jest.fn().mockReturnValue([]),
      } as unknown as FrameNode;

      const result = findAll([mockNode], false, true);

      // The node itself should NOT be in the result
      expect(result).not.toContain(mockNode);
    });

    it('should find all nested children', () => {
      const mockChild1 = {
        id: 'child-1',
        type: 'TEXT',
        name: 'Text node',
      } as unknown as TextNode;

      const mockChild2 = {
        id: 'child-2',
        type: 'RECTANGLE',
        name: 'Rectangle',
      } as unknown as RectangleNode;

      const mockParent = {
        id: 'parent',
        type: 'FRAME',
        name: 'Parent Frame',
        children: [mockChild1, mockChild2],
        findAllWithCriteria: jest.fn().mockReturnValue([mockChild1, mockChild2]),
      } as unknown as FrameNode;

      const result = findAll([mockParent], true, true);

      // Should include parent + both children
      expect(result).toContain(mockParent);
      expect(result).toContain(mockChild1);
      expect(result).toContain(mockChild2);
      expect(result).toHaveLength(3);
    });

    it('should find deeply nested component instance children when nodesWithoutPluginData is true', () => {
      // This test simulates the bug scenario: a Frame contains an Instance which contains Text with tokens
      const mockText = {
        id: 'text',
        type: 'TEXT',
        name: 'Text with tokens',
      } as unknown as TextNode;

      const mockInstance = {
        id: 'instance',
        type: 'INSTANCE',
        name: 'Component Instance',
      } as unknown as InstanceNode;

      const mockFrame = {
        id: 'frame',
        type: 'FRAME',
        name: 'Parent Frame',
        children: [mockInstance],
        // When nodesWithoutPluginData is true, findAllWithCriteria should find ALL nested nodes
        // including the instance and text, even if they don't have plugin data yet
        findAllWithCriteria: jest.fn().mockReturnValue([mockInstance, mockText]),
      } as unknown as FrameNode;

      const result = findAll([mockFrame], true, true);

      // Should include frame, instance, and text
      expect(result).toContain(mockFrame);
      expect(result).toContain(mockInstance);
      expect(result).toContain(mockText);
      expect(result).toHaveLength(3);

      // Verify findAllWithCriteria was called without plugin data filter
      expect(mockFrame.findAllWithCriteria).toHaveBeenCalledWith({
        types: ValidNodeTypes,
        // No sharedPluginData filter
      });
    });
  });
});
