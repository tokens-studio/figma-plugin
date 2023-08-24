import { buildTree, resolveReferences } from './resolveReferences';

describe('resolveReferences', () => {
  it('should resolve references', () => {
    // Example usage
    const array = [
      { name: 'foo', value: '3' },
      { name: 'bar', value: '{foo}' },
      { name: 'boo', value: '{bar}' },
    ];
    const rootNode = buildTree(array);
    resolveReferences(rootNode);
    console.log('root', rootNode);

    const result = array.map((item) => ({
      name: item.name,
      value: rootNode.children.find((child) => child.name === item.name)?.resolvedValue,
    }));

    expect(result).toEqual([
      { name: 'foo', value: '3' },
      { name: 'bar', value: '3' },
      { name: 'boo', value: '3' },
    ]);
  });
});
