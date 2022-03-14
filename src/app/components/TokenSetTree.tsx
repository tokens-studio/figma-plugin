import React from 'react';
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style.css';

export default function TokenSetTree({ tokenSets }: { tokenSets: string[] }) {
  console.log('Token sets', tokenSets);
  const [items, setItems] = React.useState({});

  React.useEffect(() => {
    setItems({
      root: {
        index: 'root',
        canMove: true,
        hasChildren: true,
        children: ['child1', 'child2'],
        data: 'Root item',
        canRename: true,
      },
      child1: {
        index: 'child1',
        canMove: true,
        hasChildren: false,
        children: [],
        data: 'Child item 1',
        canRename: true,
      },
      child2: {
        index: 'child2',
        canMove: true,
        hasChildren: false,
        children: ['child3', 'child4'],
        data: 'Child item 2',
        canRename: true,
      },
      child3: {
        index: 'child3',
        canMove: true,
        hasChildren: false,
        children: [],
        data: 'Child item 3',
        canRename: true,
      },
      child4: {
        index: 'child4',
        canMove: true,
        hasChildren: false,
        children: [],
        data: 'Child item 3',
        canRename: true,
      },
    });
  }, [tokenSets]);

  return (
    <UncontrolledTreeEnvironment
      dataProvider={new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))}
      getItemTitle={(item) => item.data}
      viewState={{}}
    >
      <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  );
}
