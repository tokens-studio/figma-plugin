import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'just-compact';
import { TokenSetItem } from './TokenSetItem';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenSetListOrTree, TokenSetListOrTreeDragItem } from './TokenSetListOrTree';
import {
  tokenSetListToTree, TreeItem, findOrderableTargetIndexesInTokenSetTreeList, ensureFolderIsTogether,
} from '@/utils/tokenset';
import { ReorderGroup } from '@/motion/ReorderGroup';
import { DragControlsContext, ItemData } from '@/context';
import { checkReorder } from '@/utils/motion';

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

type TokenSetTreeItemContentProps = React.PropsWithChildren<{
  item: ExtendedTreeItem
}>;

type TokenSetTreeProps = {
  tokenSets: string[]
  onReorder: (sets: string[]) => void;
  onRename: (tokenSet: string) => void
  onDelete: (tokenSet: string) => void
  onDuplicate: (tokenSet: string) => void
  saveScrollPositionSet: (tokenSet: string) => void
};

export function TokenSetTreeItemContent({
  item, children,
}: TokenSetTreeItemContentProps) {
  const dispatch = useDispatch();
  const dragContext = useContext(DragControlsContext);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);

  const handleClick = useCallback((set: TreeItem) => {
    if (set.isLeaf) {
      dispatch.tokenState.setActiveTokenSet(set.path);
      item.saveScrollPositionSet(activeTokenSet);
    }
  }, [dispatch, item, activeTokenSet]);

  const handleCheckedChange = useCallback((shouldCheck: boolean, set: TreeItem) => {
    if (set.isLeaf) {
      dispatch.tokenState.toggleUsedTokenSet(set.path);
    } else {
      const itemPaths = item.items.filter((i) => i.path.startsWith(set.path) && i.path !== set.path).map((i) => i.path);
      dispatch.tokenState.toggleManyTokenSets({ shouldCheck, sets: itemPaths });
    }
  }, [dispatch, item]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <TokenSetItem
      key={item.path}
      isActive={item.isActive}
      onClick={handleClick}
      isChecked={item.checkedState}
      item={item}
      onCheck={handleCheckedChange}
      canEdit={!editProhibited}
      canReorder={!editProhibited}
      canDelete={item.canDelete}
      extraBefore={children}
      onRename={item.onRename}
      onDelete={item.onDelete}
      onDuplicate={item.onDuplicate}
      onTreatAsSource={handleTreatAsSource}
      onDragStart={handleDragStart}
    />
  );
}

export default function TokenSetTree({
  tokenSets, onReorder, onRename, onDelete, onDuplicate, saveScrollPositionSet,
}: TokenSetTreeProps) {
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const [items, setItems] = useState<TreeItem[]>(tokenSetListToTree(tokenSets));

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
    const nextItems = compact(
      reorderedItems.map((item) => (
        items.find(({ key }) => item.key === key)
      )),
    );
    onReorder(nextItems.map(({ path }) => path));
    setItems(nextItems);
  }, [items, onReorder]);

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

  useEffect(() => {
    setItems(tokenSetListToTree(tokenSets));
  }, [tokenSets]);

  return (
    <ReorderGroup
      layoutScroll
      values={mappedItems}
      checkReorder={handleCheckReorder}
      onReorder={handleReorder}
    >
      <TokenSetListOrTree<ExtendedTreeItem>
        displayType="tree"
        items={mappedItems}
        renderItem={TokenSetListOrTreeDragItem}
        renderItemContent={TokenSetTreeItemContent}
      />
    </ReorderGroup>
  );
}
