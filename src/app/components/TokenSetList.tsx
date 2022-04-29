import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Reorder } from 'framer-motion';
import Box from './Box';
import { Dispatch } from '../store';
import { ListItem, TokenSetItem } from './TokenSetItem';
import useConfirm from '../hooks/useConfirm';
import {
  activeTokenSetSelector,
  editProhibitedSelector,
  hasUnsavedChangesSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

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

type Props = {
  tokenSets: string[];
  onRename: (tokenSet: string) => void;
  onDelete: (tokenSet: string) => void;
  onReorder: (tokenSets: string[]) => void;
};

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

  useEffect(() => {
    setItems(getList(tokenSets));
  }, [tokenSets]);

  const handleClick = useCallback(async (set: ListItem) => {
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
  }, [confirm, dispatch, hasUnsavedChanges]);

  const handleCheckedChange = useCallback((checked: boolean, item: ListItem) => {
    dispatch.tokenState.toggleUsedTokenSet(item.path);
  }, [dispatch]);

  const handleReorder = useCallback(() => {
    onReorder(items.map((i) => i.path));
  }, [items, onReorder]);

  const handleTreatAsSource = useCallback((tokenSetPath: string) => {
    dispatch.tokenState.toggleTreatAsSource(tokenSetPath);
  }, [dispatch]);

  // TODO: Handle reorder at end doesnt work yet
  return (
    <Box>
      <Reorder.Group axis="y" layoutScroll values={items} onReorder={setItems}>
        {items.map((item) => (
          <TokenSetItem<typeof item>
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
            onReorder={handleReorder}
            onTreatAsSource={handleTreatAsSource}
          />
        ))}
      </Reorder.Group>
    </Box>
  );
}
