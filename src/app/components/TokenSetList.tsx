import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Reorder } from 'framer-motion';
import { debounce } from 'lodash';
import Box from './Box';
import { Dispatch, RootState } from '../store';
import { TreeItem } from './utils/getTree';
import { TokenSetItem2 } from './TokenSetItem';

function getList(items) {
  return items.map((item) => ({
    path: item,
    key: `${item}-set`,
    parent: null,
    type: 'set',
    level: 0,
    label: item,
  }));
}

export default function TokenSetList({
  tokenSets,
  onRename,
  onDelete,
  onReorder,
}: {
  tokenSets: string[];
  onRename: (tokenSet: string) => void;
  onDelete: (tokenSet: string) => void;
  onReorder: (tokenSets: string[]) => void;
}) {
  const { activeTokenSet, usedTokenSet, editProhibited } = useSelector((state: RootState) => state.tokenState);
  const dispatch = useDispatch<Dispatch>();
  const [items, setItems] = React.useState(getList(tokenSets));

  React.useEffect(() => {
    setItems(getList(tokenSets));
  }, [tokenSets]);

  function handleClick(set) {
    if (set.type === 'set') {
      dispatch.tokenState.setActiveTokenSet(set.path);
    }
  }

  // TODO: Handle reorder at end doesnt work yet
  return (
    <Box>
      <Reorder.Group axis="y" layoutScroll values={items} onReorder={setItems}>
        {items.map((item) => (
          <TokenSetItem2
            key={item.key}
            isActive={activeTokenSet === item.path}
            onClick={() => handleClick(item)}
            isChecked={usedTokenSet.includes(item.path)}
            item={item}
            onCheck={() => dispatch.tokenState.toggleUsedTokenSet(item.path)}
            canEdit={!editProhibited}
            canReorder
            canDelete={!editProhibited || Object.keys(tokenSets).length > 1}
            onRename={onRename}
            onDelete={onDelete}
            onReorder={() => onReorder(items.map((i: TreeItem) => i.path))}
          />
        ))}
      </Reorder.Group>
    </Box>
  );
}
