import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from './Box';
import { TokenSetItem } from './TokenSetItem';
import { Dispatch } from '../store';
import { getTree, TreeItem } from './utils/getTree';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  usedTokenSetsAsStringArraySelector,
} from '@/selectors';

// @TODO use hooks

export default function TokenSetTree({ tokenSets, onRename, onDelete }: { tokenSets: string[], onRename: (tokenSet: string) => void, onDelete: (tokenSet: string) => void }) {
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const usedTokenSet = useSelector(usedTokenSetsAsStringArraySelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const dispatch = useDispatch<Dispatch>();
  const [items, setItems] = useState<TreeItem[]>(getTree(tokenSets));
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const determineCheckedState = useCallback((item: TreeItem) => {
    if (item.type === 'set') {
      return usedTokenSet.includes(item.path);
    }
    const itemPaths = items.filter((i) => i.path.startsWith(item.path) && i.path !== item.path).map((i) => i.path);
    if (itemPaths.every((i) => usedTokenSet.includes(i))) {
      return true;
    } if (itemPaths.some((i) => usedTokenSet.includes(i))) {
      return 'indeterminate';
    }
    return false;
  }, [items, usedTokenSet]);

  const mappedItems = useMemo(() => (
    items
      // remove items which are in a collapsed parent
      .filter((item) => !collapsed.some((parentSet) => item.parent.startsWith(parentSet)))
      .map((item) => ({
        item,
        isActive: activeTokenSet === item.path,
        isCollapsed: collapsed.includes(item.path),
        canDelete: !editProhibited || Object.keys(tokenSets).length > 1,
        checkedState: determineCheckedState(item) as ReturnType<typeof determineCheckedState>,
      }))
  ), [items, collapsed, activeTokenSet, editProhibited, tokenSets, determineCheckedState]);

  const toggleCollapsed = useCallback((set: string) => {
    setCollapsed(collapsed.includes(set) ? collapsed.filter((s) => s !== set) : [...collapsed, set]);
  }, [collapsed]);

  const handleCheckedChange = useCallback((shouldCheck: boolean, set: typeof items[number]) => {
    if (set.type === 'set') {
      dispatch.tokenState.toggleUsedTokenSet(set.path);
    } else {
      const itemPaths = items.filter((i) => i.path.startsWith(set.path) && i.path !== set.path).map((i) => i.path);
      dispatch.tokenState.toggleManyTokenSets({ shouldCheck, sets: itemPaths });
    }
  }, [dispatch, items]);

  const handleClick = useCallback((set: typeof items[number]) => {
    if (set.type === 'set') {
      dispatch.tokenState.setActiveTokenSet(set.path);
    }
  }, [dispatch]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  useEffect(() => {
    setItems(getTree(tokenSets));
  }, [tokenSets]);

  return (
    <Box>
      {mappedItems.map(({
        item, isActive, isCollapsed, canDelete, checkedState,
      }) => (
        <TokenSetItem<TreeItem>
          key={item.path}
          isCollapsed={isCollapsed}
          isActive={isActive}
          onClick={handleClick}
          isChecked={checkedState}
          item={item}
          onCheck={handleCheckedChange}
          onCollapse={toggleCollapsed}
          canEdit={!editProhibited}
          canDelete={canDelete}
          onRename={onRename}
          onDelete={onDelete}
          onTreatAsSource={handleTreatAsSource}
        />
      ))}
    </Box>
  );
}
