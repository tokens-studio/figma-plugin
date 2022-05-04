import React from 'react';
import { useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from './ContextMenu';
import Stack from './Stack';
import Button from './Button';
import Heading from './Heading';
import Input from './Input';
import Modal from './Modal';
import Box from './Box';
import useManageTokens from '../store/useManageTokens';
import { editProhibitedSelector } from '@/selectors';

type Props = {
  id: string
  label: string
  path: string
  type: string
};

export default function TokenGroupHeading({ label, path, id, type }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>('');
  const [showNewGroupNameField, setShowNewGroupNameField] = React.useState<boolean>(false);
  const [oldTokenGroupName, setOldTokenGroupName] = React.useState<string>('');
  const [tokenGroupMarkedForChange, setTokenGroupMarkedForChange] = React.useState<string>('');
  const [isTokenGroupDuplicated, setIsTokenGroupDuplicated] = React.useState<boolean>(false);
  const { deleteGroup, renameGroup, duplicateGroup } = useManageTokens();

  React.useEffect(() => {
    if(isTokenGroupDuplicated)
      setOldTokenGroupName(`${path.split('.').pop()}-copy` || '');
    else setOldTokenGroupName(`${path.split('.').pop()}` || '');
  },[oldTokenGroupName, isTokenGroupDuplicated]);
  const handleDelete = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);
  const handleRename = React.useCallback(() => {
    setShowNewGroupNameField(true);
  },[path, renameGroup]);

  const handleRenameTokenGroupSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowNewGroupNameField(false);
    setTokenGroupMarkedForChange('');
    if(isTokenGroupDuplicated)
      renameGroup(`${path}-copy`, newTokenGroupName, type);
    else renameGroup(path, newTokenGroupName, type);
  }, [newTokenGroupName]);

  const handleNewTokenGroupNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setNewTokenGroupName(e.target.value);
  }, [newTokenGroupName]);

  const handleSetNewTokenGroupNameFileClose = React.useCallback(() => {
    setShowNewGroupNameField(false);
    setTokenGroupMarkedForChange('');
  }, [showNewGroupNameField]);

  const handleDuplicate = React.useCallback(() => {
    setIsTokenGroupDuplicated(true);
    setShowNewGroupNameField(true);
    duplicateGroup(path, type);
  }, [oldTokenGroupName]);
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
          <ContextMenuItem disabled={editProhibited} onSelect={handleDelete}>
            Delete
          </ContextMenuItem>
          <ContextMenuItem disabled={editProhibited} onSelect={handleRename}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem disabled={editProhibited} onSelect={handleDuplicate}>
            Duplicate
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Modal isOpen={showNewGroupNameField} close={handleSetNewTokenGroupNameFileClose}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">Rename {oldTokenGroupName}</Heading>
          <Heading size="small">Renaming only affects tokens of the same type</Heading>
          <form onSubmit={handleRenameTokenGroupSubmit}>
            <Stack direction="column" gap={4}>
              <Input
                full
                onChange={handleNewTokenGroupNameChange}
                type="text"
                name="tokengroupname"
                required
                defaultValue={oldTokenGroupName}
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={handleSetNewTokenGroupNameFileClose}>
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
