import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from './ContextMenu';
import Stack from './Stack';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import Box from './Box';
import { styled } from '@/stitches.config';
import useManageTokens from '../store/useManageTokens';
import { editProhibitedSelector } from '@/selectors';

type Props = {
  id: string
  label: string
  path: string
};
const StyledButton = styled('button', {
  flexShrink: 0,
  width: '100%',
  fontSize: '$xsmall',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3 $4',
  gap: '$2',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
  },
});

export default function TokenGroupHeading({ label, path, id }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const [showRenameTokenGroupField, setShowRenameTokenGroupField] = React.useState(false);
  const [tokenGroupMarkedForChange, setTokenGroupMarkedForChange] = React.useState('');
  const [newTokenGroupName, handleNewTokenGroupNameChange] = React.useState('');

  const { deleteGroup } = useManageTokens();

  const handleRenameTokenGroupSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setTokenGroupMarkedForChange('');
    setShowRenameTokenGroupField(false);
  }, [newTokenGroupName, tokenGroupMarkedForChange]);

  const handleSelect = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);
  const handleRename = React.useCallback(() => {
    setShowRenameTokenGroupField(true);
  }, [showRenameTokenGroupField]);
  return (
    <Box
      css={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        width: '150px',
        borderRight: '1px solid',
        borderColor: '$borderMuted',
        overflowY: 'auto',
      }}
      className="content"
    >
      <ContextMenu>
        <ContextMenuTrigger id={`group-heading-${path}-${label}-${id}`}>
          <Heading muted size="small">{label}</Heading>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled={editProhibited} onSelect={handleSelect}>
            Delete
          </ContextMenuItem>
          <ContextMenuItem disabled={editProhibited} onSelect={handleRename}>
            Rename
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Modal isOpen={showRenameTokenGroupField} close={() => setShowRenameTokenGroupField(false)}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">
              Rename
              {' '}
              {tokenGroupMarkedForChange}
            </Heading>
            <form onSubmit={handleRenameTokenGroupSubmit}>
              <Stack direction="column" gap={4}>
                <Input
                    full
                    value={newTokenGroupName}
                    onChange={(e) => handleNewTokenGroupNameChange(e.target.value)}
                    type="text"
                    name="tokengroupname"
                    required
                />
                <Stack direction="row" gap={4}>
                  <Button variant="secondary" size="large" onClick={() => setShowRenameTokenGroupField(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="large" disabled={tokenGroupMarkedForChange === newTokenGroupName}>
                    Change
                  </Button>
                </Stack>
              </Stack>
            </form>
        </Stack>
      </Modal>
    </Box>
  );
}
