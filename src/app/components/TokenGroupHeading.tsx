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
  const { deleteGroup, duplicateGroup } = useManageTokens();

  const handleDelete = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);

  const handleDuplicate = React.useCallback(() => {
    const oldName = path.split('.').pop();
    
    duplicateGroup({path, oldName});
  }, [path, duplicateGroup]);
  return (
    <ContextMenu>
      <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
        <Heading muted size="small">{label}</Heading>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled={editProhibited} onSelect={handleDelete}>
          Delete
        </ContextMenuItem>
        <ContextMenuItem disabled={editProhibited} onSelect={handleDuplicate}>
          Duplicate
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
