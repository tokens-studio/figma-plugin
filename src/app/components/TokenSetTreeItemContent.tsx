import React, {
  useCallback, useContext,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenSetItem } from './TokenSetItem';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
} from '@/selectors';
import { TreeItem } from '@/utils/tokenset';
import { DragControlsContext } from '@/context';

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
