import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heading, ContextMenu, Text } from '@tokens-studio/ui';
import Stack from '../Stack';
import useManageTokens from '../../store/useManageTokens';
import {
  activeApiProviderSelector,
  activeTokenSetReadOnlySelector,
  editProhibitedSelector,
  activeTokenSetSelector,
} from '@/selectors';
import { getGroupDescriptionSelector } from '@/app/store/selectors/groupMetadataSelector';
import { IconCollapseArrow, IconExpandArrow, IconAdd } from '@/icons';
import {
  StyledTokenGroupHeading,
  StyledTokenGroupAddIcon,
  StyledTokenGroupHeadingCollapsable,
} from './StyledTokenGroupHeading';
import { Dispatch } from '../../store';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowNewFormOptions } from '@/types';
import useTokens from '../../store/useTokens';
import DuplicateTokenGroupModal from '../modals/DuplicateTokenGroupModal';
import { EditTokenGroupModal } from '../modals/EditTokenGroupModal';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useGenerateDocumentation } from '@/app/hooks/useGenerateDocumentation';
import ProBadge from '../ProBadge';

export type Props = {
  id: string;
  label: string;
  path: string;
  type: string;
  showNewForm: (opts: ShowNewFormOptions) => void;
};

export function TokenGroupHeading({ label, path, id, type, showNewForm }: Props) {
  const { t } = useTranslation(['tokens']);
  const editProhibited = useSelector(editProhibitedSelector);
  const activeTokenSetReadOnly = useSelector(activeTokenSetReadOnlySelector);
  const activeApiProvider = useSelector(activeApiProviderSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const groupDescription = useSelector(getGroupDescriptionSelector(activeTokenSet, path));
  const [newTokenGroupName, setNewTokenGroupName] = React.useState<string>(path);
  const [showDuplicateTokenGroupModal, setShowDuplicateTokenGroupModal] = React.useState<boolean>(false);
  const [showEditTokenGroupModal, setShowEditTokenGroupModal] = React.useState<boolean>(false);
  const { deleteGroup, renameGroup } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();
  const collapsed = useSelector(collapsedTokensSelector);
  const { remapTokensInGroup } = useTokens();
  const isTokensStudioProvider = activeApiProvider === StorageProviderType.TOKENS_STUDIO;

  const canEdit = !editProhibited && !activeTokenSetReadOnly && !isTokensStudioProvider;

  const { handleGenerateDocumentation, modals } = useGenerateDocumentation({
    initialTokenSet: activeTokenSet,
    initialStartsWith: path,
    source: 'tokengroup-context-menu',
  });

  const handleDelete = React.useCallback(() => {
    deleteGroup(path, type);
  }, [deleteGroup, path, type]);

  const handleEdit = React.useCallback(() => {
    setShowEditTokenGroupModal(true);
  }, []);

  const handleEditTokenGroupModalClose = React.useCallback(() => {
    setShowEditTokenGroupModal(false);
  }, []);

  const handleRenameFromEditModal = React.useCallback(
    async (oldName: string, newName: string) => {
      const tokensToRename = await renameGroup(oldName, newName, type);
      await remapTokensInGroup({
        oldGroupName: `${oldName}.`,
        newGroupName: `${newName}.`,
        type,
        tokensToRename,
      });
    },
    [renameGroup, type, remapTokensInGroup],
  );

  const handleDuplicateTokenGroupModalClose = React.useCallback(() => {
    setShowDuplicateTokenGroupModal(false);
  }, []);

  const handleNewTokenGroupNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTokenGroupName(e.target.value);
  }, []);

  const handleDuplicate = React.useCallback(() => {
    setNewTokenGroupName(`${path}-copy`);
    setShowDuplicateTokenGroupModal(true);
  }, [path]);

  const handleToggleCollapsed = useCallback(() => {
    dispatch.tokenState.setCollapsedTokens(
      collapsed.includes(path) ? collapsed.filter((s) => s !== path) : [...collapsed, path],
    );
  }, [collapsed, dispatch.tokenState, path]);

  const handleShowNewForm = useCallback(() => showNewForm({ name: `${path}.` }), [path, showNewForm]);

  return (
    <>
      <StyledTokenGroupHeading>
        <Stack direction="column" gap={1}>
          <StyledTokenGroupHeadingCollapsable
            collapsed={collapsed.includes(path)}
            data-testid={`tokenlisting-group-${path}`}
            type="button"
          >
            <ContextMenu>
              <ContextMenu.Trigger data-testid={`group-heading-${path}-${label}-${id}`} onClick={handleToggleCollapsed}>
                <Stack direction="row" gap={2} align="center" css={{ color: '$fgMuted' }}>
                  {collapsed.includes(path) ? <IconCollapseArrow /> : <IconExpandArrow />}
                  <Heading muted size="small">
                    {label}
                  </Heading>
                </Stack>
              </ContextMenu.Trigger>
              <ContextMenu.Portal>
                <ContextMenu.Content>
                  <ContextMenu.Item disabled={!canEdit} onSelect={handleEdit}>
                    {t('edit')}
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Item disabled={!canEdit} onSelect={handleDuplicate}>
                    {t('duplicate')}
                  </ContextMenu.Item>
                  <ContextMenu.Item disabled={!canEdit} onSelect={handleDelete}>
                    {t('delete')}
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Item onSelect={handleGenerateDocumentation}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {t('generateDocumentation')}
                      <ProBadge compact campaign="tokengroup-context-menu" />
                    </div>
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Portal>
            </ContextMenu>
          </StyledTokenGroupHeadingCollapsable>
          
          {/* Group description display */}
          {groupDescription && (
            <Text size="small" css={{ color: '$fgMuted', marginLeft: '$6' }}>
              {groupDescription}
            </Text>
          )}
        </Stack>

        <DuplicateTokenGroupModal
          isOpen={showDuplicateTokenGroupModal}
          type={type}
          newName={newTokenGroupName}
          oldName={path}
          onClose={handleDuplicateTokenGroupModalClose}
          handleNewTokenGroupNameChange={handleNewTokenGroupNameChange}
        />

        <EditTokenGroupModal
          isOpen={showEditTokenGroupModal}
          onClose={handleEditTokenGroupModalClose}
          groupPath={path}
          tokenSet={activeTokenSet}
          type={type}
          currentDescription={groupDescription}
          onRename={handleRenameFromEditModal}
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
      {modals}
    </>
  );
}
