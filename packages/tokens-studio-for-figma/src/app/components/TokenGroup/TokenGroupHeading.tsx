import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heading,
  ContextMenu,
} from '@tokens-studio/ui';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import Stack from '../Stack';
import useManageTokens from '../../store/useManageTokens';
import { activeApiProviderSelector, activeTokenSetReadOnlySelector, editProhibitedSelector } from '@/selectors';
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
  const { t } = useTranslation(['tokens']);
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const activeApiProvider = useSelector(activeApiProviderSelector);
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>(path);
  const [showRenameTokenGroupModal, setShowRenameTokenGroupModal] = React.useState<boolean>(false);
  const [showDuplicateTokenGroupModal, setShowDuplicateTokenGroupModal] = React.useState<boolean>(false);
  const { deleteGroup, renameGroup } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();
  const collapsed = useSelector(collapsedTokensSelector);
  const { remapTokensInGroup } = useTokens();
  const isTokensStudioProvider = activeApiProvider === AVAILABLE_PROVIDERS.TOKENS_STUDIO;

  const canEdit = !editProhibited && !activeTokenSetReadOnly && !isTokensStudioProvider;

  const handleDelete = React.useCallback(() => {
    deleteGroup(path, type);
  }, [deleteGroup, path, type]);

  const handleRename = React.useCallback(() => {
    setNewTokenGroupName(path);
    setShowRenameTokenGroupModal(true);
  }, [path]);

  const handleRenameTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tokensToRename = await renameGroup(path, newTokenGroupName, type);
    await remapTokensInGroup({
      oldGroupName: `${path}.`, newGroupName: `${newTokenGroupName}.`, type, tokensToRename,
    });
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
        data-testid={`tokenlisting-group-${path}`}
        type="button"
      >
        <ContextMenu>
          <ContextMenu.Trigger data-testid={`group-heading-${path}-${label}-${id}`} onClick={handleToggleCollapsed}>
            <Stack direction="row" gap={2} align="center" css={{ color: '$fgMuted' }}>
              {collapsed.includes(path) ? <IconCollapseArrow /> : <IconExpandArrow />}
              <Heading muted size="small">{label}</Heading>
            </Stack>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Item disabled={!canEdit} onSelect={handleRename}>
                {t('rename')}
              </ContextMenu.Item>
              <ContextMenu.Item disabled={!canEdit} onSelect={handleDuplicate}>
                {t('duplicate')}
              </ContextMenu.Item>
              <ContextMenu.Item disabled={!canEdit} onSelect={handleDelete}>
                {t('delete')}
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
      </StyledTokenGroupHeadingCollapsable>

      <RenameTokenGroupModal
        isOpen={showRenameTokenGroupModal}
        newName={newTokenGroupName}
        oldName={path}
        onClose={handleRenameTokenGroupModalClose}
        handleRenameTokenGroupSubmit={handleRenameTokenGroupSubmit}
        handleNewTokenGroupNameChange={handleNewTokenGroupNameChange}
        type={type}
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
        tooltip={t('addNew', { ns: 'tokens' })}
        tooltipSide="left"
        onClick={handleShowNewForm}
        disabled={!canEdit}
        data-testid="button-add-new-token-in-group"
        size="small"
        variant="invisible"
      />
    </StyledTokenGroupHeading>
  );
}
