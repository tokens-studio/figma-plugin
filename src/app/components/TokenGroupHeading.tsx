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
  const [showNewGroupNameField, setShowNewGroupNameField] = React.useState(false);
  const { deleteGroup, renameGroup } = useManageTokens();

  const handleDelete = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);
  const handleRename = React.useCallback(() => {
    setShowNewGroupNameField(true);
  },[path, renameGroup]);

  const handleRenameTokenGroupSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowNewGroupNameField(false);
    renameGroup(path, newTokenGroupName, type);
  }, [newTokenGroupName]);
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
        </ContextMenuContent>
      </ContextMenu>
      <Modal isOpen={showNewGroupNameField} close={() => setShowNewGroupNameField(false)}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">Rename {path.split('.').pop()}</Heading>
          <form onSubmit={handleRenameTokenGroupSubmit}>
            <Stack direction="column" gap={4}>
              <Input
                full
                value={newTokenGroupName}
                onChange={(e) => setNewTokenGroupName(e.target.value)}
                type="text"
                name="tokengroupname"
                required
                placeholder={path.split('.').pop() || ''}
              />
              <Stack direction="row" gap={4}>
                <Button variant="secondary" size="large" onClick={() => setShowNewGroupNameField(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={path.split('.').pop() === newTokenGroupName}
                >
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
