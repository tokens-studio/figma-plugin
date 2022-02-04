import React from 'react';
import { useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from './ContextMenu';
import Heading from './Heading';
import { RootState } from '../store';
import useManageTokens from '../store/useManageTokens';

export default function TokenGroupHeading({ label, path, id }) {
  const { editProhibited } = useSelector((state: RootState) => state.tokenState);
  const { deleteGroup } = useManageTokens();

  return (
    <ContextMenu>
      <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
        <Heading size="small">{label}</Heading>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled={editProhibited} onSelect={() => deleteGroup(path)}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
