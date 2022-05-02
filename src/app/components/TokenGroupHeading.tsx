import React from 'react';
import { useSelector } from 'react-redux';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from './ContextMenu';
import Stack from './Stack';
import Button from './Button';
import Heading from './Heading';
import Input from './Input';
import Modal from './Modal';
import Box from './Box';
import useManageTokens from '../store/useManageTokens';
import { editProhibitedSelector } from '@/selectors';

type Props = {
  id: string;
  label: string;
  path: string;
};
export default function TokenGroupHeading({ label, path, id }: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const { deleteGroup, duplicateGroup, renameGroup } = useManageTokens();
  const [showRenameTokenGroupField, setShowRenameTokenGroupField] = React.useState(false);
  const [tokenGroupMarkedForChange, setTokenGroupMarkedForChange] = React.useState('');
  const [newTokenGroupName, handleNewTokenGroupNameChange] = React.useState('');
  const [isDuplicated, setIsDuplicated] = React.useState(false);

  React.useEffect(() => {}, []);

  const handleDelete = React.useCallback(() => {
    deleteGroup(path);
  }, [path, deleteGroup]);

  const handleDuplicate = React.useCallback(() => {
    const oldName = path.split('.').pop()?.toString();
    const newPath = path.slice(0, path.length - oldName.length);
    duplicateGroup({ newPath, oldName });
    setIsDuplicated(true);
    setShowRenameTokenGroupField(true);
  }, [path, duplicateGroup, setShowRenameTokenGroupField]);

  const handleRenameTokenGroupSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const oldName: string = path.split('.').pop()?.toString();
      const newPath = path.slice(0, path.length - oldName.length);
      setShowRenameTokenGroupField(false);
      if (!isDuplicated) {
        renameGroup({ path: newPath, oldName: oldName, newName: newTokenGroupName });
      } else {
        renameGroup({ path: newPath, oldName: `${oldName}-copy`, newName: newTokenGroupName });
      }
      setIsDuplicated(false);
    },
    [newTokenGroupName, tokenGroupMarkedForChange, isDuplicated]
  );

  const handleRenameTokenGroup = React.useCallback(() => {
    setShowRenameTokenGroupField(true);
    setTokenGroupMarkedForChange(path.split('.').pop());
  }, []);
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
          <Heading muted size="small">
            {label}
          </Heading>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem disabled={editProhibited} onSelect={handleDelete}>
            Delete
          </ContextMenuItem>
          <ContextMenuItem disabled={editProhibited} onSelect={handleRenameTokenGroup}>
            Rename
          </ContextMenuItem>
          <ContextMenuItem disabled={editProhibited} onSelect={handleDuplicate}>
            Duplicate
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Modal isOpen={showRenameTokenGroupField} close={() => setShowRenameTokenGroupField(false)}>
        <Stack direction="column" justify="center" gap={4} css={{ textAlign: 'center' }}>
          <Heading size="small">Rename {tokenGroupMarkedForChange}</Heading>
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
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={tokenGroupMarkedForChange === newTokenGroupName}
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
