import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from '../ContextMenu';
import Stack from '../Stack';
import Heading from '../Heading';
import useManageTokens from '../../store/useManageTokens';
import { editProhibitedSelector } from '@/selectors';
import { IconCollapseArrow, IconExpandArrow, IconAdd } from '@/icons';
import { StyledTokenGroupHeading, StyledTokenGroupAddIcon, StyledTokenGroupHeadingCollapsable } from './StyledTokenGroupHeading';
import { Dispatch } from '../../store';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowNewFormOptions } from '@/types';
import useTokens from '../../store/useTokens';
import RenameTokenGroupModal from '../modals/RenameTokenGroupModal';
import DuplicateTokenGroupModal from '../modals/DuplicateTokenGroupModal';

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
  const editProhibited = useSelector(editProhibitedSelector);
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>(path);
  const [showRenameTokenGroupModal, setShowRenameTokenGroupModal] = React.useState<boolean>(false);
  const [showDuplicateTokenGroupModal, setShowDuplicateTokenGroupModal] = React.useState<boolean>(false);
  const { deleteGroup, renameGroup } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();
  const collapsed = useSelector(collapsedTokensSelector);
  const { remapTokensInGroup } = useTokens();

  const handleDelete = React.useCallback(() => {
    deleteGroup(path, type);
  }, [deleteGroup, path, type]);

  const handleRename = React.useCallback(() => {
    setNewTokenGroupName(path);
    setShowRenameTokenGroupModal(true);
  }, [path]);

  const handleRenameTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    renameGroup(path, newTokenGroupName, type);
    remapTokensInGroup({ oldGroupName: `${path}.`, newGroupName: `${newTokenGroupName}.` });
    setShowRenameTokenGroupModal(false);
  }, [newTokenGroupName, path, renameGroup, type, remapTokensInGroup]);

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

      <RenameTokenGroupModal
        isOpen={showRenameTokenGroupModal}
        newName={newTokenGroupName}
        oldName={path}
        onClose={handleRenameTokenGroupModalClose}
        handleRenameTokenGroupSubmit={handleRenameTokenGroupSubmit}
        handleNewTokenGroupNameChange={handleNewTokenGroupNameChange}
      />

      <DuplicateTokenGroupModal
        isOpen={showDuplicateTokenGroupModal}
        type={type}
        newName={newTokenGroupName}
        oldName={path}
        onClose={handleDuplicateTokenGroupModalClose}
        handleNewTokenGroupNameChange={handleNewTokenGroupNameChange}
      />

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
