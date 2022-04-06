import React from 'react';
import { useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from './ContextMenu';
import Heading from './Heading';
import useManageTokens from '../store/useManageTokens';
import { editProhibitedSelector } from '@/selectors';

type Props = {
  id: string
  label: string
  path: string
};

export default function TokenGroupHeading({ label, path, id }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const { deleteGroup } = useManageTokens();

  const handleSelect = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
        <Heading size="small">{label}</Heading>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled={editProhibited} onSelect={handleSelect}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
