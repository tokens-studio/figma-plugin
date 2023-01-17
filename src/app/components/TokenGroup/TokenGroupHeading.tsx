import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from '../ContextMenu';
import Stack from '../Stack';
import Button from '../Button';
import Heading from '../Heading';
import Text from '../Text';
import Input from '../Input';
import Modal from '../Modal';
import useManageTokens from '../../store/useManageTokens';
import { activeTokenSetSelector, editProhibitedSelector, tokensSelector } from '@/selectors';
import { IconCollapseArrow, IconExpandArrow, IconAdd } from '@/icons';
import { StyledTokenGroupHeading, StyledTokenGroupAddIcon, StyledTokenGroupHeadingCollapsable } from './StyledTokenGroupHeading';
import { Dispatch } from '../../store';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowNewFormOptions } from '@/types';
import useTokens from '../../store/useTokens';
import { MultiSelectDownshiftInput } from '../MultiSelectDownshiftInput';

export type Props = {
  id: string
  label: string
  path: string
  type: string
  showNewForm: (opts: ShowNewFormOptions) => void;
};

export function TokenGroupHeading({
  label, path, id, type, showNewForm,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>(path);
  const [selectedTokenSets, setSelectedTokenSets] = React.useState<string[]>([activeTokenSet]);
  const [showRenameTokenGroupModal, setShowRenameTokenGroupModal] = React.useState<boolean>(false);
  const [showDuplicateTokenGroupModal, setShowDuplicateTokenGroupModal] = React.useState<boolean>(false);
  const { deleteGroup, renameGroup, duplicateGroup } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();
  const collapsed = useSelector(collapsedTokensSelector);
  const { remapTokensInGroup } = useTokens();

  const handleDelete = React.useCallback(() => {
    deleteGroup(path, type);
  }, [deleteGroup, path, type]);

  const handleRename = React.useCallback(() => {
    setShowRenameTokenGroupModal(true);
  }, []);

  const handleRenameTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowRenameTokenGroupModal(false);
    renameGroup(path, newTokenGroupName, type);
    remapTokensInGroup({ oldGroupName: `${path}.`, newGroupName: `${newTokenGroupName}.` });
  }, [newTokenGroupName, path, renameGroup, type, remapTokensInGroup]);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    duplicateGroup({
      oldName: path, newName: newTokenGroupName, tokenSets: selectedTokenSets, type,
    });
    setShowDuplicateTokenGroupModal(false);
  }, [duplicateGroup, path, type, selectedTokenSets, newTokenGroupName]);

  const handleNewTokenGroupNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTokenGroupName(e.target.value);
  }, []);

  const handleRenameTokenGroupModalClose = React.useCallback(() => {
    setShowRenameTokenGroupModal(false);
  }, []);

  const handleDuplicateTokenGroupModalClose = React.useCallback(() => {
    setShowDuplicateTokenGroupModal(false);
  }, []);

  const handleDuplicate = React.useCallback(() => {
    setNewTokenGroupName(`${path}-copy`);
    setShowDuplicateTokenGroupModal(true);
  }, [path]);

  const handleToggleCollapsed = useCallback(() => {
    dispatch.tokenState.setCollapsedTokens(collapsed.includes(path) ? collapsed.filter((s) => s !== path) : [...collapsed, path]);
  }, [collapsed, dispatch.tokenState, path]);

  const handleShowNewForm = useCallback(() => showNewForm({ name: `${path}.` }), [path, showNewForm]);

  const handleSelectedItemChange = useCallback((selectedItems: string[]) => {
    setSelectedTokenSets(selectedItems);
  }, []);

  return (
    <StyledTokenGroupHeading>
      <StyledTokenGroupHeadingCollapsable
        collapsed={collapsed.includes(path)}
        data-cy={`tokenlisting-group-${path}`}
        data-testid={`tokenlisting-group-${path}`}
        type="button"
      >
        <ContextMenu>
          <ContextMenuTrigger data-testid={`group-heading-${path}-${label}-${id}`} onClick={handleToggleCollapsed}>
            <Stack direction="row" gap={2} align="center" css={{ color: '$textMuted' }}>
              {collapsed.includes(path) ? <IconCollapseArrow /> : <IconExpandArrow />}
              <Heading muted size="small">{label}</Heading>
            </Stack>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem disabled={editProhibited} onSelect={handleRename}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem disabled={editProhibited} onSelect={handleDuplicate}>
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem disabled={editProhibited} onSelect={handleDelete}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </StyledTokenGroupHeadingCollapsable>
      <Modal
        title={`Rename ${path}`}
        isOpen={showRenameTokenGroupModal}
        close={handleRenameTokenGroupModalClose}
        footer={(
          <form id="renameTokenGroup" onSubmit={handleRenameTokenGroupSubmit}>
            <Stack direction="row" justify="end" gap={4}>
              <Button variant="secondary" onClick={handleRenameTokenGroupModalClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={path === newTokenGroupName}>
                Change
              </Button>
            </Stack>
          </form>
        )}
      >
        <Stack direction="column" gap={4}>
          <Input
            form="renameTokenGroup"
            full
            onChange={handleNewTokenGroupNameChange}
            type="text"
            name="tokengroupname"
            value={newTokenGroupName}
            autofocus
            required
          />
          <Text muted>Renaming only affects tokens of the same type</Text>
        </Stack>
      </Modal>

      <Modal
        title="Duplicate Group"
        isOpen={showDuplicateTokenGroupModal}
        close={handleDuplicateTokenGroupModalClose}
        footer={(
          <form id="duplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
            <Stack direction="row" justify="end" gap={4}>
              <Button variant="secondary" onClick={handleDuplicateTokenGroupModalClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Duplicate
              </Button>
            </Stack>
          </form>
        )}
      >
        <Stack direction="column" gap={4}>
          <Input
            form="duplicateTokenGroup"
            full
            onChange={handleNewTokenGroupNameChange}
            type="text"
            name="tokengroupname"
            value={newTokenGroupName}
            autofocus
            required
          />
          <MultiSelectDownshiftInput menuItems={Object.keys(tokens)} initialSelectedItems={[activeTokenSet]} setSelectedMenuItems={handleSelectedItemChange} />
        </Stack>
      </Modal>

      <StyledTokenGroupAddIcon
        icon={<IconAdd />}
        tooltip="Add a new token"
        tooltipSide="left"
        onClick={handleShowNewForm}
        disabled={editProhibited}
        dataCy="button-add-new-token-in-group"
      />
    </StyledTokenGroupHeading>
  );
}
