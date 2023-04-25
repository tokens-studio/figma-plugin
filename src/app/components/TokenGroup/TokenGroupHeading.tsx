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
import EditTokenGroupModal, { EditTokenGroupFormValues } from '../modals/EditTokenGroupModal';
import DuplicateTokenGroupModal from '../modals/DuplicateTokenGroupModal';
import Box from '../Box';

export type Props = {
  id: string
  label: string
  path: string
  type: string
  description?: string
  showNewForm: (opts: ShowNewFormOptions) => void;
};

export function TokenGroupHeading({
  label, path, id, type, description, showNewForm,
}: Props) {
  const editProhibited = useSelector(editProhibitedSelector);
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>(path);
  const [showEditTokenGroupModal, setShowEditTokenGroupModal] = React.useState<boolean>(false);
  const [showDuplicateTokenGroupModal, setShowDuplicateTokenGroupModal] = React.useState<boolean>(false);
  const [editTokenFormFields, setEditTokenFormFields] = React.useState<EditTokenGroupFormValues>(React.useMemo(() => ({
    name: path,
    type,
    description: description ?? '',
  }), [path, description, type]));
  const { deleteGroup, editGroup } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();
  const collapsed = useSelector(collapsedTokensSelector);
  const { remapTokensInGroup } = useTokens();

  const handleDelete = React.useCallback(() => {
    deleteGroup(path, type);
  }, [deleteGroup, path, type]);

  const handleEdit = React.useCallback(() => {
    setNewTokenGroupName(path);
    setShowEditTokenGroupModal(true);
  }, [path]);

  const handleNewTokenGroupNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTokenGroupName(e.target.value);
  }, []);

  const handleEditTokenGroupModalClose = React.useCallback(() => {
    setShowEditTokenGroupModal(false);
  }, []);

  const handleDuplicateTokenGroupModalClose = React.useCallback(() => {
    setShowDuplicateTokenGroupModal(false);
  }, []);

  const handleDuplicate = React.useCallback(() => {
    setNewTokenGroupName(`${path}-copy`);
    setShowDuplicateTokenGroupModal(true);
  }, [path]);

  const handleEditTokenGroupSubmit = React.useCallback((value: EditTokenGroupFormValues) => {
    editGroup({
      oldName: path,
      newName: value.name,
      type: value.type,
      description: value.description,
    });
    remapTokensInGroup({ oldGroupName: `${path}.`, newGroupName: `${newTokenGroupName}.` });
    setShowEditTokenGroupModal(false);
  }, [newTokenGroupName, path, remapTokensInGroup, editGroup]);

  const handleEditTokenGroupFormChange = React.useCallback((value: EditTokenGroupFormValues) => {
    setEditTokenFormFields({ ...editTokenFormFields, ...value });
  }, [editTokenFormFields]);

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
              <Box>{description}</Box>
            </Stack>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem disabled={editProhibited} onSelect={handleEdit}>
              Edit
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

      <EditTokenGroupModal
        isOpen={showEditTokenGroupModal}
        values={editTokenFormFields}
        handleFormChange={handleEditTokenGroupFormChange}
        handleEditTokenGroupSubmit={handleEditTokenGroupSubmit}
        onClose={handleEditTokenGroupModalClose}
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
