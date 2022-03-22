import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from './Box';
import { TokenSetItem2 } from './TokenSetItem';
import { Dispatch, RootState } from '../store';
import { getTree, TreeItem } from './utils/getTree';

export default function TokenSetTree({ tokenSets, onRename, onDelete }: { tokenSets: string[], onRename: (tokenSet: string) => void, onDelete: (tokenSet: string) => void }) {
  const { activeTokenSet, usedTokenSet, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const dispatch = useDispatch<Dispatch>();
  const [items, setItems] = React.useState<TreeItem[]>(getTree(tokenSets));
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  React.useEffect(() => {
    setItems(getTree(tokenSets));
  }, [tokenSets]);

  function toggleCollapsed(set) {
    setCollapsed(collapsed.includes(set) ? collapsed.filter((s) => s !== set) : [...collapsed, set]);
  }

  function handleCheckedChange(set, shouldCheck) {
    if (set.type === 'set') {
      dispatch.tokenState.toggleUsedTokenSet(set.path);
    } else {
      const itemPaths = items.filter((i) => i.path.startsWith(set.path) && i.path !== set.path).map((i) => i.path);
      dispatch.tokenState.toggleManyTokenSets({ shouldCheck, sets: itemPaths });
    }
  }

  function handleClick(set) {
    if (set.type === 'set') {
      dispatch.tokenState.setActiveTokenSet(set.path);
    }
  }

  const determineCheckedState = React.useCallback((item) => {
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
        <TokenSetItem2
          key={item.key}
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
          type={item.type}
        />
      )))}
    </Box>
  );
}
