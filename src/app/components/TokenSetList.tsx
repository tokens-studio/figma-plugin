import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Reorder, useDragControls } from 'framer-motion';
import Box from './Box';
import { Dispatch } from '../store';
import { TokenSetItem, ConditionalReorderWrapper } from './TokenSetItem';
import useConfirm from '../hooks/useConfirm';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  hasUnsavedChangesSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { TreeItem } from './utils/getTree';
import { TokenSetListOrTree } from './TokenSetListOrTree';

function getList(items: string[]): TreeItem[] {
  return items.map((item) => ({
    isLeaf: true,
    path: item,
    key: `${item}-set`,
    parent: null,
    level: 0,
    label: item,
  }));
}

type ExtendedTreeItem = TreeItem & {
  editProbhibited: boolean
  onReorder: () => void
};
type TreeRenderFunction = (props: React.PropsWithChildren<{
  item: ExtendedTreeItem
}>) => React.ReactNode;
type Props = {
  tokenSets: string[];
  onRename: (tokenSet: string) => void;
  onDelete: (tokenSet: string) => void;
  onReorder: (tokenSets: string[]) => void;
};

export function TokenSetListItem({ item, children }: Parameters<TreeRenderFunction>[0]) {
  const controls = useDragControls();

  return (
    <ConditionalReorderWrapper
      canReorder={!item.editProbhibited}
      item={item}
      controls={controls}
      onReorder={item.onReorder}
    >
      {children}
    </ConditionalReorderWrapper>
  );
}

export default function TokenSetList({
  tokenSets,
  onRename,
  onDelete,
  onReorder,
}: Props) {
  const { confirm } = useConfirm();
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const hasUnsavedChanges = useSelector(hasUnsavedChangesSelector);
  const dispatch = useDispatch<Dispatch>();
  const [items, setItems] = React.useState(getList(tokenSets));

  const handleClick = useCallback(async (set: TreeItem) => {
    if (set.isLeaf) {
      if (hasUnsavedChanges) {
        const userChoice = await confirm({ text: 'You have unsaved changes.', description: 'Your changes will be discarded.' });
        if (userChoice) {
          dispatch.tokenState.setActiveTokenSet(set.path);
        }
      } else {
        dispatch.tokenState.setActiveTokenSet(set.path);
      }
    }
  }, [confirm, dispatch, hasUnsavedChanges]);

  const handleCheckedChange = useCallback((checked: boolean, item: TreeItem) => {
    dispatch.tokenState.toggleUsedTokenSet(item.path);
  }, [dispatch]);

  const handleReorder = useCallback(() => {
    onReorder(items.map((i) => i.path));
  }, [items, onReorder]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  const mappedItems = React.useMemo(() => (
    items.map<ExtendedTreeItem>((item) => ({
      ...item,
      editProhibited,
      onReorder: handleReorder,
    } as unknown as ExtendedTreeItem))
  ), [items, editProhibited, handleReorder]);

  const renderItemContent = useCallback<TreeRenderFunction>(({ item }) => (
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
      canDelete={!editProhibited || Object.keys(tokenSets).length > 1}
      onRename={onRename}
      onDelete={onDelete}
      onTreatAsSource={handleTreatAsSource}
    />
  ), [
    activeTokenSet,
    usedTokenSet,
    tokenSets,
    editProhibited,
    onRename,
    onDelete,
    handleClick,
    handleTreatAsSource,
    handleCheckedChange,
  ]);

  useEffect(() => {
    setItems(getList(tokenSets));
  }, [tokenSets]);

  // TODO: Handle reorder at end doesnt work yet
  return (
    <Box>
      <Reorder.Group axis="y" layoutScroll values={items} onReorder={setItems}>
        <TokenSetListOrTree<ExtendedTreeItem>
          displayType="list"
          items={mappedItems}
          renderItem={TokenSetListItem}
          renderItemContent={renderItemContent}
        />
      </Reorder.Group>
    </Box>
  );
}
