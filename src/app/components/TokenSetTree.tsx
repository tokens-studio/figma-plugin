import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenSetItem } from './TokenSetItem';
import { Dispatch } from '../store';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  scrollPositionSetSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenSetListOrTree } from './TokenSetListOrTree';
import { tokenSetListToTree, TreeItem } from '@/utils/tokenset';

export default function TokenSetTree({
  tokenSets, onRename, onDelete, onDuplicate,
}: { tokenSets: string[], onRename: (tokenSet: string) => void, onDelete: (tokenSet: string) => void, onDuplicate: (tokenSet: string) => void }) {
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const scrollPositionSet = useSelector(scrollPositionSetSelector);
  const dispatch = useDispatch<Dispatch>();
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
      isActive: activeTokenSet === item.path,
      canDelete: !editProhibited || Object.keys(tokenSets).length > 1,
      checkedState: determineCheckedState(item) as ReturnType<typeof determineCheckedState>,
    }))
  ), [items, activeTokenSet, editProhibited, tokenSets, determineCheckedState]);

  const handleCheckedChange = useCallback((shouldCheck: boolean, set: typeof items[number]) => {
    if (set.isLeaf) {
      dispatch.tokenState.toggleUsedTokenSet(set.path);
    } else {
      const itemPaths = items.filter((i) => i.path.startsWith(set.path) && i.path !== set.path).map((i) => i.path);
      dispatch.tokenState.toggleManyTokenSets({ shouldCheck, sets: itemPaths });
    }
  }, [dispatch, items]);

  const handleClick = useCallback((set: typeof items[number]) => {
    if (set.isLeaf) {
      dispatch.tokenState.setActiveTokenSet(set.path);
      dispatch.uiState.setScrollPositionSet({ ...scrollPositionSet, [activeTokenSet]: document.getElementById('tokenBox')?.scrollTop ?? 0 });
    }
  }, [dispatch]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  type TreeRenderFunction = (props: React.PropsWithChildren<{ item: typeof mappedItems[number] }>) => React.ReactElement;

  const renderItem = useCallback<TreeRenderFunction>(({ children }) => (
    React.createElement(React.Fragment, {}, children)
  ), []);

  const renderItemContent = useCallback<TreeRenderFunction>(({ item, children }) => (
    <>
      {children}
      <TokenSetItem
        key={item.path}
        isActive={item.isActive}
        onClick={handleClick}
        isChecked={item.checkedState}
        item={item}
        onCheck={handleCheckedChange}
        canEdit={!editProhibited}
        canDelete={item.canDelete}
        onRename={onRename}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onTreatAsSource={handleTreatAsSource}
      />
    </>
  ), [editProhibited, onRename, onDelete, onDuplicate, handleTreatAsSource, handleCheckedChange, handleClick]);

  useEffect(() => {
    setItems(tokenSetListToTree(tokenSets));
  }, [tokenSets]);

  return (
    <TokenSetListOrTree
      displayType="tree"
      items={mappedItems}
      renderItem={renderItem}
      renderItemContent={renderItemContent}
    />
  );
}
