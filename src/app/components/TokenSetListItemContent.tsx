import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from '../store';
import { TokenSetItem } from './TokenSetItem';
import useConfirm from '../hooks/useConfirm';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  hasUnsavedChangesSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { DragControlsContext } from '@/context';
import { TreeItem } from '@/utils/tokenset';

type ExtendedTreeItem = TreeItem & {
  tokenSets: string[];
  onRename: (tokenSet: string) => void;
  onDelete: (tokenSet: string) => void;
  onDuplicate: (tokenSet: string) => void;
  saveScrollPositionSet: (tokenSet: string) => void;
};
type TreeRenderFunction = (props: React.PropsWithChildren<{
  item: ExtendedTreeItem
}>) => React.ReactNode;

export function TokenSetListItemContent({ item }: Parameters<TreeRenderFunction>[0]) {
  const { confirm } = useConfirm();
  const dragContext = React.useContext(DragControlsContext);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleClick = useCallback(async (set: TreeItem) => {
    if (set.isLeaf) {
      if (hasUnsavedChanges) {
        const userChoice = await confirm({ text: 'You have unsaved changes.', description: 'Your changes will be discarded.' });
        if (userChoice) {
          dispatch.tokenState.setActiveTokenSet(set.path);
          item.saveScrollPositionSet(activeTokenSet);
        }
      } else {
        dispatch.tokenState.setActiveTokenSet(set.path);
        item.saveScrollPositionSet(activeTokenSet);
      }
    }
  }, [confirm, dispatch, hasUnsavedChanges, item, activeTokenSet]);

  const handleCheckedChange = useCallback((checked: boolean, treeItem: TreeItem) => {
    dispatch.tokenState.toggleUsedTokenSet(treeItem.path);
  }, [dispatch]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <TokenSetItem
      key={item.key}
      isActive={activeTokenSet === item.path}
      onClick={handleClick}
      isChecked={usedTokenSet?.[item.path] === TokenSetStatus.ENABLED || (
        usedTokenSet?.[item.path] === TokenSetStatus.SOURCE ? 'indeterminate' : false
      )}
      item={item}
      onCheck={handleCheckedChange}
      canEdit={!editProhibited}
      canReorder={!editProhibited}
      canDelete={!editProhibited || Object.keys(item.tokenSets).length > 1}
      onRename={item.onRename}
      onDelete={item.onDelete}
      onDuplicate={item.onDuplicate}
      onDragStart={handleDragStart}
      onTreatAsSource={handleTreatAsSource}
    />
  );
}
