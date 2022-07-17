import React, { useCallback, useEffect } from 'react';
import compact from 'just-compact';
import { useDispatch, useSelector } from 'react-redux';
import Box from './Box';
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
import { TokenSetListOrTree } from './TokenSetListOrTree';
import { DragControlsContext } from '@/context';
import { tokenSetListToList, TreeItem } from '@/utils/tokenset';
import { TokenSetListOrTreeDragItem } from './TokenSetListOrTree/TokenSetListOrTreeDragItem';
import { ReorderGroup } from '@/motion/ReorderGroup';

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
type Props = {
  tokenSets: string[];
  onRename: (tokenSet: string) => void;
  onDelete: (tokenSet: string) => void;
  onReorder: (sets: string[]) => void;
  onDuplicate: (tokenSet: string) => void;
  saveScrollPositionSet: (tokenSet: string) => void;
};

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

export default function TokenSetList({
  tokenSets,
  onRename,
  onDelete,
  onReorder,
  onDuplicate,
  saveScrollPositionSet,
}: Props) {
  const [items, setItems] = React.useState(tokenSetListToList(tokenSets));
  const mappedItems = React.useMemo(() => (
    items.map<ExtendedTreeItem>((item) => ({
      ...item,
      tokenSets,
      onRename,
      onDelete,
      onDuplicate,
      saveScrollPositionSet,
    }))
  ), [items, tokenSets, onRename, onDelete, onDuplicate, saveScrollPositionSet]);

  const handleReorder = React.useCallback((reorderedItems: ExtendedTreeItem[]) => {
    const nextItems = compact(
      reorderedItems.map((item) => (
        items.find(({ key }) => item.key === key)
      )),
    );
    onReorder(nextItems.map(({ path }) => path));
    setItems(nextItems);
  }, [items, onReorder]);

  useEffect(() => {
    setItems(tokenSetListToList(tokenSets));
  }, [tokenSets]);

  // TODO: Handle reorder at end doesnt work yet
  return (
    <Box>
      <ReorderGroup layoutScroll values={mappedItems} onReorder={handleReorder}>
        <TokenSetListOrTree<ExtendedTreeItem>
          displayType="list"
          items={mappedItems}
          renderItem={TokenSetListOrTreeDragItem}
          renderItemContent={TokenSetListItemContent}
        />
      </ReorderGroup>
    </Box>
  );
}
