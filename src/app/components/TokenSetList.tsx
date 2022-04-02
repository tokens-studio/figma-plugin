import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Reorder } from 'framer-motion';
import Box from './Box';
import { Dispatch, RootState } from '../store';
import { ListItem, TokenSetItem } from './TokenSetItem';
import useConfirm from '../hooks/useConfirm';

function getList(items: string[]): ListItem[] {
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
  const { confirm } = useConfirm();
  const {
    activeTokenSet, usedTokenSet, editProhibited, hasUnsavedChanges,
  } = useSelector((state: RootState) => state.tokenState);
  const dispatch = useDispatch<Dispatch>();
  const [items, setItems] = React.useState(getList(tokenSets));

  React.useEffect(() => {
    setItems(getList(tokenSets));
  }, [tokenSets]);

  async function handleClick(set: ListItem) {
    if (set.type === 'set') {
      if (hasUnsavedChanges) {
        const userChoice = await confirm({ text: 'You have unsaved changes.', description: 'Your changes will be discarded.' });
        if (userChoice) {
          dispatch.tokenState.setActiveTokenSet(set.path);
        }
      } else {
        dispatch.tokenState.setActiveTokenSet(set.path);
      }
    }
  }

  // TODO: Handle reorder at end doesnt work yet
  return (
    <Box>
      <Reorder.Group axis="y" layoutScroll values={items} onReorder={setItems}>
        {items.map((item) => (
          <TokenSetItem
            key={item.key}
            isActive={activeTokenSet === item.path}
            onClick={() => handleClick(item)}
            isChecked={usedTokenSet.includes(item.path)}
            item={item}
            onCheck={() => dispatch.tokenState.toggleUsedTokenSet(item.path)}
            canEdit={!editProhibited}
            canReorder={!editProhibited}
            canDelete={!editProhibited || Object.keys(tokenSets).length > 1}
            onRename={onRename}
            onDelete={onDelete}
            onReorder={() => onReorder(items.map((i) => i.path))}
          />
        ))}
      </Reorder.Group>
    </Box>
  );
}
