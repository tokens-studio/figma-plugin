import React, { useCallback } from 'react';
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
  const [items, setItems] = React.useState<TreeItem[]>(getTree(tokenSets));
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  React.useEffect(() => {
    setItems(getTree(tokenSets));
  }, [tokenSets]);

  // functions should not be created inside a React component
  // without useCallback as it can cause the creation of new references
  // for every re-render and result in unnecessary re-renders
  // this applies to the whole codebase
  const toggleCollapsed = useCallback((set: string) => {
    setCollapsed(collapsed.includes(set) ? collapsed.filter((s) => s !== set) : [...collapsed, set]);
  }, [collapsed]);

  const handleCheckedChange = useCallback((set: typeof items[number], shouldCheck: boolean) => {
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

  const determineCheckedState = useCallback((item) => {
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

  return (
    <Box>
      {items.map((item) => (collapsed.some((i) => item.parent.startsWith(i)) ? null : (
        <TokenSetItem
          key={item.path}
          isCollapsed={collapsed.includes(item.path)}
          isActive={activeTokenSet === item.path}
          onClick={() => handleClick(item)}
          isChecked={determineCheckedState(item)}
          item={item}
          onCheck={(shouldCheck) => handleCheckedChange(item, shouldCheck)}
          onCollapse={() => toggleCollapsed(item.path)}
          canEdit={!editProhibited}
          canDelete={!editProhibited || Object.keys(tokenSets).length > 1}
          onRename={onRename}
          onDelete={onDelete}
        />
      )))}
    </Box>
  );
}
