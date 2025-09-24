import { applySiblingStyleId } from '../applySiblingStyle';
import { StyleIdMap, StyleThemeMap } from '@/types/StyleIdMap';

// Mock figma object
global.figma = {
  mixed: Symbol('mixed'),
} as any;

// Helper to create a mock node with children
let nodeCounter = 0;
function createMockNode(type: string, options: any = {}): any {
  nodeCounter += 1;
  const node = {
    type,
    id: `node-${nodeCounter}`,
    ...options,
  };

  if (['COMPONENT', 'COMPONENT_SET', 'SECTION', 'INSTANCE', 'FRAME', 'BOOLEAN_OPERATION', 'GROUP'].includes(type)) {
    node.children = options.children || [];
  }

  return node;
}

describe('applySiblingStyleId', () => {
  let mockStyleIds: StyleIdMap;
  let mockStyleMap: StyleThemeMap;
  let activeThemes: string[];

  beforeEach(() => {
    nodeCounter = 0; // Reset counter for each test
    // The styleIds map uses the normalized format with comma
    mockStyleIds = {
      'S:123,': 'colors.primary',
      'S:456,': 'colors.secondary',
    };
    mockStyleMap = {
      'colors.primary': {
        light: 'S:123,4:16',
        dark: 'S:789,4:16',
      },
      'colors.secondary': {
        light: 'S:456,4:16',
        dark: 'S:101,4:16',
      },
    };
    activeThemes = ['dark'];

    // Mock figma.getStyleById and figma.importStyleByKeyAsync
    global.figma.getStyleById = jest.fn((id) => ({ id }));
    global.figma.importStyleByKeyAsync = jest.fn((key) => Promise.resolve({ id: `S:${key},4:16` }));
  });

  it('should process text nodes with relevant styles', async () => {
    const textNode = createMockNode('TEXT', {
      textStyleId: 'S:123,4:16',
      fillStyleId: 'S:456,4:16',
      strokeStyleId: '',
      effectStyleId: '',
    });

    await applySiblingStyleId(textNode, mockStyleIds, mockStyleMap, activeThemes);

    // The textStyleId should be updated to the dark theme equivalent
    expect(textNode.textStyleId).toBe('S:789,4:16');
    expect(textNode.fillStyleId).toBe('S:101,4:16');
  });

  it('should process frame nodes with children recursively', async () => {
    const childNode = createMockNode('TEXT', {
      textStyleId: 'S:123,4:16',
    });

    const frameNode = createMockNode('FRAME', {
      fillStyleId: 'S:456,4:16',
      children: [childNode],
    });

    await applySiblingStyleId(frameNode, mockStyleIds, mockStyleMap, activeThemes);

    expect(frameNode.fillStyleId).toBe('S:101,4:16');
    expect(childNode.textStyleId).toBe('S:789,4:16');
  });

  it('should optimize performance by avoiding unnecessary deep scans', async () => {
    const processedNodes: string[] = [];

    // Create a deeply nested structure where only the parent has a relevant style
    const createStructureWithOnlyParentStyling = (depth: number): any => {
      const node = createMockNode('FRAME', {
        fillStyleId: depth === 5 ? 'S:123,4:16' : '', // Only the root parent has a style
      });

      // Track which nodes get their style properties accessed
      const originalId = node.id;
      if (depth === 5) {
        Object.defineProperty(node, 'fillStyleId', {
          get() { return this.fillStyleIdValue; },
          set(value) {
            processedNodes.push(`${originalId}-fill`);
            this.fillStyleIdValue = value;
          },
          configurable: true,
        });
        node.fillStyleIdValue = 'S:123,4:16';
      }

      if (depth > 0) {
        // Create multiple children to test that we don't scan all of them unnecessarily
        node.children = [
          createStructureWithOnlyParentStyling(depth - 1),
          createMockNode('FRAME', { fillStyleId: '' }), // Node without styles
          createMockNode('FRAME', { fillStyleId: '' }), // Node without styles
        ];
      }
      return node;
    };

    const deepStructure = createStructureWithOnlyParentStyling(5);
    await applySiblingStyleId(deepStructure, mockStyleIds, mockStyleMap, activeThemes);

    // Only the parent node should have been processed (node-1 is the root)
    expect(processedNodes).toEqual(['node-1-fill']);
  });

  it('should still process nested nodes when they have relevant styles', async () => {
    const processedNodes: string[] = [];

    // Create structure where both parent and a deeply nested child have styles
    const parentNode = createMockNode('FRAME', {
      fillStyleId: 'S:123,4:16',
    });

    const childWithStyle = createMockNode('TEXT', {
      textStyleId: 'S:456,4:16',
    });

    const intermediateNode = createMockNode('FRAME', {
      fillStyleId: '', // No style
      children: [childWithStyle],
    });

    parentNode.children = [intermediateNode];

    // Track style updates
    Object.defineProperty(parentNode, 'fillStyleId', {
      get() { return this.fillStyleIdValue; },
      set(value) {
        processedNodes.push('parent-fill');
        this.fillStyleIdValue = value;
      },
      configurable: true,
    });
    parentNode.fillStyleIdValue = 'S:123,4:16';

    Object.defineProperty(childWithStyle, 'textStyleId', {
      get() { return this.textStyleIdValue; },
      set(value) {
        processedNodes.push('child-text');
        this.textStyleIdValue = value;
      },
      configurable: true,
    });
    childWithStyle.textStyleIdValue = 'S:456,4:16';

    await applySiblingStyleId(parentNode, mockStyleIds, mockStyleMap, activeThemes);

    // Both parent and child should be processed
    expect(processedNodes).toContain('parent-fill');
    expect(processedNodes).toContain('child-text');
  });

  it('should skip processing nodes without relevant styles', async () => {
    const processCount = jest.fn();

    const nodeWithNoRelevantStyles = createMockNode('FRAME', {
      fillStyleId: 'S:999', // Not in our styleIds map
    });

    // Mock the style setting to count how many times it's called
    Object.defineProperty(nodeWithNoRelevantStyles, 'fillStyleId', {
      get() { return this.fillStyleIdValue; },
      set(value) {
        processCount();
        this.fillStyleIdValue = value;
      },
      configurable: true,
    });
    nodeWithNoRelevantStyles.fillStyleIdValue = 'S:999';

    await applySiblingStyleId(nodeWithNoRelevantStyles, mockStyleIds, mockStyleMap, activeThemes);

    // Should not have processed the irrelevant style
    expect(processCount).not.toHaveBeenCalled();
  });
});
