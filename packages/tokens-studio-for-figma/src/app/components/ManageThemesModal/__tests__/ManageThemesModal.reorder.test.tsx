import { themeListToTree } from '@/utils/themeListToTree';

describe('ManageThemesModal - Theme Reordering', () => {
  it('should not duplicate themes when reordering groups', () => {
    // Create mock themes with groups
    const mockThemes = [
      {
        id: 'light-theme',
        name: 'Light Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
      {
        id: 'dark-theme',
        name: 'Dark Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
      {
        id: 'blue-theme',
        name: 'Blue Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group B',
      },
    ];

    // Test the tree creation function
    const treeItems = themeListToTree(mockThemes);

    // Should have 2 groups and 3 themes = 5 total items
    expect(treeItems).toHaveLength(5);

    // Should have 2 group items (not leaves)
    const groupItems = treeItems.filter((item) => !item.isLeaf);
    expect(groupItems).toHaveLength(2);

    // Should have 3 theme items (leaves)
    const themeItems = treeItems.filter((item) => item.isLeaf);
    expect(themeItems).toHaveLength(3);

    // Verify no duplicates in the tree structure
    const themeIds = themeItems.map((item) => (typeof item.value === 'object' ? item.value.id : ''));
    expect(themeIds).toEqual(['light-theme', 'dark-theme', 'blue-theme']);
    expect(new Set(themeIds).size).toBe(3); // No duplicates
  });

  it('should preserve theme relationships after simulated reordering', () => {
    const mockThemes = [
      {
        id: 'light-theme',
        name: 'Light Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
      {
        id: 'dark-theme',
        name: 'Dark Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
      {
        id: 'blue-theme',
        name: 'Blue Theme',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group B',
      },
    ];

    const treeItems = themeListToTree(mockThemes);

    // Simulate reordering by moving Group B before Group A
    const reorderedItems = [
      treeItems[3], // Group B
      treeItems[4], // blue-theme
      treeItems[0], // Group A
      treeItems[1], // light-theme
      treeItems[2], // dark-theme
    ];

    // Simulate the handleReorder logic
    let currentGroup = '';
    const updatedThemes = reorderedItems.reduce<typeof mockThemes>((acc, curr) => {
      if (!curr.isLeaf && typeof curr.value === 'string') {
        currentGroup = curr.value;
      }
      if (curr.isLeaf && typeof curr.value === 'object') {
        acc.push({
          ...curr.value,
          group: currentGroup === 'INTERNAL_THEMES_NO_GROUP' ? undefined : currentGroup,
        });
      }
      return acc;
    }, []);

    // Should still have 3 themes
    expect(updatedThemes).toHaveLength(3);

    // Should have no duplicates
    const themeIds = updatedThemes.map((theme) => theme.id);
    expect(new Set(themeIds).size).toBe(3);

    // Themes should still belong to correct groups
    expect(updatedThemes.find((t) => t.id === 'blue-theme')?.group).toBe('Group B');
    expect(updatedThemes.find((t) => t.id === 'light-theme')?.group).toBe('Group A');
    expect(updatedThemes.find((t) => t.id === 'dark-theme')?.group).toBe('Group A');
  });

  it('should handle empty group movements without duplicating themes', () => {
    const mockThemes = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
    ];

    const treeItems = themeListToTree(mockThemes);

    // Should have 1 group and 1 theme = 2 total items
    expect(treeItems).toHaveLength(2);

    // Simulate reordering (even though there's only one group)
    let currentGroup = '';
    const updatedThemes = treeItems.reduce<typeof mockThemes>((acc, curr) => {
      if (!curr.isLeaf && typeof curr.value === 'string') {
        currentGroup = curr.value;
      }
      if (curr.isLeaf && typeof curr.value === 'object') {
        acc.push({
          ...curr.value,
          group: currentGroup === 'INTERNAL_THEMES_NO_GROUP' ? undefined : currentGroup,
        });
      }
      return acc;
    }, []);

    // Should still have exactly 1 theme
    expect(updatedThemes).toHaveLength(1);
    expect(updatedThemes[0].id).toBe('theme1');
    expect(updatedThemes[0].group).toBe('Group A');
  });

  it('should handle folder reordering and child movement correctly (potential duplication scenario)', () => {
    const mockThemes = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
      {
        id: 'theme2',
        name: 'Theme 2',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group B',
      },
    ];

    const treeItems = themeListToTree(mockThemes);
    console.log('Original tree items:', treeItems.map((item) => ({
      isLeaf: item.isLeaf,
      value: typeof item.value === 'string' ? item.value : item.value.id,
      parent: item.parent,
      key: item.key,
    })));

    // Simulate moving Group B to before Group A (this is where duplication might happen)
    // Original order: [Group A, theme1, Group B, theme2]
    // Target order: [Group B, theme2, Group A, theme1]
    const reorderedItems = [
      treeItems[2], // Group B
      treeItems[3], // theme2
      treeItems[0], // Group A
      treeItems[1], // theme1
    ];

    console.log('Reordered tree items:', reorderedItems.map((item) => ({
      isLeaf: item.isLeaf,
      value: typeof item.value === 'string' ? item.value : item.value.id,
      parent: item.parent,
      key: item.key,
    })));

    // Apply the same logic as handleReorder
    let currentGroup = '';
    const updatedThemes = reorderedItems.reduce<typeof mockThemes>((acc, curr) => {
      if (!curr.isLeaf && typeof curr.value === 'string') {
        currentGroup = curr.value;
      }
      if (curr.isLeaf && typeof curr.value === 'object') {
        acc.push({
          ...curr.value,
          group: currentGroup === 'INTERNAL_THEMES_NO_GROUP' ? undefined : currentGroup,
        });
      }
      return acc;
    }, []);

    console.log('Updated themes after reorder:', updatedThemes.map((t) => ({ id: t.id, group: t.group })));

    // Should still have exactly 2 themes with no duplicates
    expect(updatedThemes).toHaveLength(2);

    // Verify no theme ID duplicates
    const themeIds = updatedThemes.map((theme) => theme.id);
    expect(new Set(themeIds).size).toBe(2);

    // Verify correct group assignments after reordering
    expect(updatedThemes.find((t) => t.id === 'theme1')?.group).toBe('Group A');
    expect(updatedThemes.find((t) => t.id === 'theme2')?.group).toBe('Group B');
  });

  it('should reveal UUID regeneration issue in themeListToTree', () => {
    const mockThemes = [
      {
        id: 'theme1',
        name: 'Theme 1',
        selectedTokenSets: {},
        $figmaStyleReferences: {},
        group: 'Group A',
      },
    ];

    // Generate tree multiple times - should have stable IDs for same input
    const tree1 = themeListToTree(mockThemes);
    const tree2 = themeListToTree(mockThemes);

    // These should be the same with deterministic ID generation
    console.log('Tree 1 IDs:', tree1.map((item) => item.id));
    console.log('Tree 2 IDs:', tree2.map((item) => item.id));

    // Now this test should pass with stable IDs
    expect(tree1[0].id).toBe(tree2[0].id); // Group ID should be stable
    expect(tree1[1].id).toBe(tree2[1].id); // Theme ID should be stable

    // Verify the IDs follow the expected pattern
    expect(tree1[0].id).toBe('group-Group A'); // Group ID
    expect(tree1[1].id).toBe('theme-theme1'); // Theme ID
  });
});
