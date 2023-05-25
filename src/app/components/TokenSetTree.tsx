import React, {
  useCallback, useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
  activeTokenSetSelector,
  collapsedTokenSetsSelector,
  editProhibitedSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { isEqual } from '@/utils/isEqual';
import {
  findOrderableTargetIndexesInTokenSetTreeList,
  tokenSetListToTree, TreeItem,
} from '@/utils/tokenset';
import { ensureFolderIsTogether } from '@/utils/dragDropOrder';
import { ReorderGroup } from '@/motion/ReorderGroup';
import { ItemData } from '@/context';
import { checkReorder } from '@/utils/motion';
import { DragItem } from './StyledDragger/DragItem';
import { TokenSetTreeItemContent } from './TokenSetTreeItemContent';
import { TokenSetTreeContent } from './TokenSetTree/TokenSetTreeContent';

type ExtendedTreeItem = TreeItem & {
  tokenSets: string[];
  items: TreeItem[]
  isActive: boolean
  canDelete: boolean
  checkedState: boolean | 'indeterminate'
  onRename: (tokenSet: string) => void
  onDelete: (tokenSet: string) => void
  onDuplicate: (tokenSet: string) => void
  saveScrollPositionSet: (tokenSet: string) => void
};

type TokenSetTreeProps = {
  tokenSets: string[]
  onReorder: (sets: string[]) => void;
  onRename: (tokenSet: string) => void
  onDelete: (tokenSet: string) => void
  onDuplicate: (tokenSet: string) => void
  saveScrollPositionSet: (tokenSet: string) => void
};

export default function TokenSetTree({
  tokenSets, onReorder, onRename, onDelete, onDuplicate, saveScrollPositionSet,
}: TokenSetTreeProps) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const collapsed = useSelector(collapsedTokenSetsSelector);
  const items = tokenSetListToTree(tokenSets);

  React.useEffect(() => {
    // Compare saved tokenSet order with GUI tokenSet order and update the tokenSet if there is a difference
    if (!isEqual(Object.keys(tokens), items.filter(({ isLeaf }) => isLeaf).map(({ path }) => path))) {
      onReorder(items.filter(({ isLeaf }) => isLeaf).map(({ path }) => path));
    }
  }, [items, tokens, onReorder]);

  const determineCheckedState = useCallback((item: TreeItem) => {
    if (item.isLeaf) {
      if (usedTokenSet?.[item.path] === TokenSetStatus.SOURCE) {
        return 'indeterminate';
      }
      return usedTokenSet?.[item.path] === TokenSetStatus.ENABLED;
    }

    const itemPaths = items.filter((i) => i.path.startsWith(item.path) && i.path !== item.path).map((i) => i.path);
    const childTokenSetStatuses = Object.entries(usedTokenSet)
      .filter(([tokenSet]) => itemPaths.includes(tokenSet))
      .map(([, tokenSetStatus]) => tokenSetStatus);

    if (childTokenSetStatuses.every((status) => (
      status === TokenSetStatus.ENABLED
    ))) {
      // @README all children are ENABLED
      return true;
    }

    if (childTokenSetStatuses.some((status) => (
      status === TokenSetStatus.ENABLED
      || status === TokenSetStatus.SOURCE
    ))) {
      // @README some children are ENABLED or treated as SOURCE
      return 'indeterminate';
    }

    return false;
  }, [items, usedTokenSet]);

  const mappedItems = useMemo(() => (
    items.map((item) => ({
      ...item,
      tokenSets,
      items,
      onRename,
      onDelete,
      onDuplicate,
      saveScrollPositionSet,
      isActive: activeTokenSet === item.path,
      canDelete: !editProhibited || Object.keys(tokenSets).length > 1,
      checkedState: determineCheckedState(item) as ReturnType<typeof determineCheckedState>,
    }))
  ), [
    items,
    activeTokenSet,
    editProhibited,
    tokenSets,
    determineCheckedState,
    onRename,
    onDelete,
    onDuplicate,
    saveScrollPositionSet,
  ]);

  const handleReorder = React.useCallback((reorderedItems: ExtendedTreeItem[]) => {
    const nextItems = reorderedItems.reduce<typeof items>((acc, item) => {
      const found = items.find(({ key }) => item.key === key);
      if (found) {
        // check if this group is collapsed
        acc.push(found);
        const itemIsCollapsed = collapsed.includes(item.key);
        if (itemIsCollapsed) {
          // also include all children
          return acc.concat(items.filter((possibleChild) => (
            possibleChild.parent && possibleChild.parent.startsWith(item.path)
          )));
        }
      }
      return acc;
    }, []);

    onReorder(nextItems
      .filter(({ isLeaf }) => isLeaf)
      .map(({ path }) => path));
  }, [items, collapsed, onReorder]);

  const handleCheckReorder = React.useCallback((
    order: ItemData<typeof mappedItems[number]>[],
    value: typeof mappedItems[number],
    offset: number,
    velocity: number,
  ) => {
    const availableIndexes = findOrderableTargetIndexesInTokenSetTreeList(
      velocity,
      value,
      order,
    );
    let nextOrder = checkReorder(order, value, offset, velocity, availableIndexes);
    // ensure folders stay together
    if (!value.isLeaf) {
      nextOrder = ensureFolderIsTogether(value, order, nextOrder);
    }
    return nextOrder;
  }, []);

  return (
    <ReorderGroup
      layoutScroll
      values={mappedItems}
      checkReorder={handleCheckReorder}
      onReorder={handleReorder}
    >
      <TokenSetTreeContent<ExtendedTreeItem>
        items={mappedItems}
        renderItem={DragItem}
        renderItemContent={TokenSetTreeItemContent}
      />
    </ReorderGroup>
  );
}
