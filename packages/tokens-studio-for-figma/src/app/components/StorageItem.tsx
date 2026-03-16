import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DotsVerticalIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import {
  Button, Box, Badge, Stack, IconButton, DropdownMenu,
} from '@tokens-studio/ui';
import isSameCredentials from '@/utils/isSameCredentials';
import useRemoteTokens from '../store/remoteTokens';
import { storageTypeSelector } from '@/selectors';
import { StyledStorageItem } from './StyledStorageItem';
import { StorageProviderType, type StorageTypeCredentials } from '@/types/StorageType';
import { isGitProvider } from '@/utils/is';
import useConfirm from '../hooks/useConfirm';
import { getProviderIcon } from '@/utils/getProviderIcon';
import useStorage from '../store/useStorage';
import { Dispatch } from '../store';
import { TokenFormatBadge } from './TokenFormatBadge';
import { isUsingAppPassword } from '@/utils/bitbucketMigration';
import { StudioProjectSelector } from './Subscription/StudioProjectSelector';
import { useAuthStore } from '@/app/store/useAuthStore';
type Props = {
  item: StorageTypeCredentials;
  onEdit: () => void;
  onMigrate?: () => void;
  isOAuthApp?: boolean;
};

const StorageItem = ({ item, onEdit, onMigrate, isOAuthApp }: Props) => {
  const [hasErrored, setHasErrored] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const storageType = useSelector(storageTypeSelector);
  const { provider, id, name } = item;
  const branch = isGitProvider(item) ? item.branch : null;
  const { restoreStoredProvider, deleteProvider, fetchBranches } = useRemoteTokens();
  const { confirm } = useConfirm();
  const { setStorageType } = useStorage();
  const dispatch = useDispatch<Dispatch>();

  const { t } = useTranslation(['storage']);
  const { loadProjectTokens, activeProject, setActiveOrganization, setActiveProject } = useAuthStore();
  const isOAuth = React.useMemo(() => item.provider === StorageProviderType.TOKENS_STUDIO_OAUTH, [item]);
  const isAccessDisabled = (item as any).__isAccessDisabled;
  const planName = (item as any).__planName;
  const subscriptionStatus = (item as any).__subscriptionStatus;
  const isActive = React.useCallback(() => isSameCredentials(item, storageType), [item, storageType]);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    isActive() ? (item as any).id : undefined
  );

  // Check if this is a Bitbucket item using app password
  const isBitbucketWithAppPassword = React.useMemo(() => (
    item.provider === StorageProviderType.BITBUCKET && isUsingAppPassword(item as any)
  ), [item]);

  const askUserIfDelete = React.useCallback(async () => {
    const shouldDelete = await confirm({
      text: t('confirmDelete') as string,
    });
    return shouldDelete;
  }, [confirm, t]);
  const handleDelete = React.useCallback(async () => {
    if (await askUserIfDelete()) {
      deleteProvider(item);
      dispatch.tokenState.setEditProhibited(false);
      dispatch.uiState.setLocalApiState({ provider: StorageProviderType.LOCAL });
      setStorageType({
        provider: { provider: StorageProviderType.LOCAL },
        shouldSetInDocument: true,
      });
    }
  }, [deleteProvider, item, askUserIfDelete, setStorageType, dispatch.uiState, dispatch.tokenState]);

  const handleRestore = React.useCallback(async () => {
    if (isOAuth) {
      let fallbackId = item.id;
      const isCurrentlyActiveOrg = !(item as any).orgId || (item as any).orgId === useAuthStore.getState().activeOrganizationId;
      if (isCurrentlyActiveOrg && activeProject) {
          fallbackId = activeProject.id;
      }

      const idToLoad = selectedProjectId || fallbackId;
      if (idToLoad) {
        try {
          if ((item as any).orgId) {
            setActiveOrganization((item as any).orgId as string);
          }
          setActiveProject(idToLoad);
          await loadProjectTokens(idToLoad);
          const newItem = { ...item, id: idToLoad };
          dispatch.uiState.setLocalApiState(newItem);
          dispatch.uiState.setApiData(newItem);
          setStorageType({
            provider: newItem,
            shouldSetInDocument: true,
          });
          setHasErrored(false);

          try {
            const branches = await fetchBranches(newItem as any);
            if (branches) {
              dispatch.branchState.setBranches(branches);
            }
          } catch (e: any) {
             console.error('Failed to fetch branches', e);
          }

        } catch (e: any) {
          setHasErrored(true);
          setErrorMessage(e.message || 'Failed to load project tokens');
        }
      }
      return;
    }

    const response = await restoreStoredProvider(item);
    if (response.status === 'success') {
      setHasErrored(false);
    } else {
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [item, restoreStoredProvider, fetchBranches, isOAuthApp, activeProject, loadProjectTokens, dispatch.uiState, dispatch.branchState, setStorageType, selectedProjectId, isOAuth, setActiveOrganization, setActiveProject]);

  return (
    <StyledStorageItem data-testid={`storageitem-${provider}-${id}`} key={`${provider}-${item.internalId || id}`} active={isActive()} hasError={isBitbucketWithAppPassword} css={isAccessDisabled ? { opacity: 0.6, pointerEvents: 'none' } : {}}>
      <div style={{
        display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center',
      }}
      >
        <Stack
          direction="column"
          gap={1}
          css={{
            flexGrow: '1',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            gap={3}
            css={{
              flexGrow: '1',
              overflow: 'hidden',
              maxWidth: 'stretch',
            }}
          >
            <Box css={{ color: '$fgDefault' }}>{getProviderIcon(provider)}</Box>
            <Stack direction="column" gap={0} css={{ overflow: 'hidden' }}>
              <Box
                css={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  fontSize: '$small',
                  fontWeight: '$sansBold',
                }}
              >
                {name}
              </Box>
              <Box
                css={{
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  color: '$fgMuted',
                  fontSize: '$xsmall',
                  maxWidth: '100%',
                }}
              >
                {isOAuth ? (
                  subscriptionStatus === 'trial_expired' ? 'Trial expired' : planName
                ) : (
                  <>
                    {id}
                    {' '}
                    {branch && ` (${branch})`}
                  </>
                )}
              </Box>
            </Stack>
          </Stack>
          {hasErrored && isActive() && (
            <Box
              css={{
                display: 'flex',
                flexDirection: 'row',
                color: '$dangerFg',
                gap: '$3',
                marginTop: '$3',
              }}
              data-testid="error-message"
            >
              <ExclamationTriangleIcon />
              {errorMessage}
            </Box>
          )}
        </Stack>
        <Box css={{ marginRight: '$1' }}>
          {isActive() ? (
            <Stack gap={2} align="center">
              {storageType.provider !== StorageProviderType.TOKENS_STUDIO && storageType.provider !== StorageProviderType.TOKENS_STUDIO_OAUTH && (
                <TokenFormatBadge extended />
              )}
              {isOAuth ? (
                <>
                  <StudioProjectSelector orgId={(item as any).orgId} />
                  <Badge>{t('active')}</Badge>
                </>
              ) : (
                <Badge>{t('active')}</Badge>
              )}
            </Stack>
          ) : (
            <Stack gap={2} align="center">
              {isOAuth && <StudioProjectSelector orgId={(item as any).orgId} value={selectedProjectId} onChange={setSelectedProjectId} />}
              <Button data-testid="button-storage-item-apply" variant="secondary" size="small" onClick={handleRestore}>
                {t('apply')}
              </Button>
            </Stack>
          )}
        </Box>
        {!isOAuth && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild data-testid="storage-item-tools-dropdown">
              <IconButton icon={<DotsVerticalIcon />} variant="invisible" size="small" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content>
                <DropdownMenu.Item textValue={t('edit')} onSelect={onEdit}>
                  {t('edit')}
                </DropdownMenu.Item>
                <DropdownMenu.Item textValue={t('delete')} onSelect={handleDelete} css={{ color: '$dangerFg' }}>
                  {t('delete')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu>
        )}
      </div>
      {isBitbucketWithAppPassword && (
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
            gap: '$2',
            marginTop: '$1',
            padding: '$1 $2',
            backgroundColor: '$bgWarning',
            borderRadius: '$small',
            border: '1px solid $borderWarning',
          }}
        >
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '$2',
            }}
          >
            <ExclamationTriangleIcon
              style={{
                color: 'var(--colors-dangerFg',
              }}
            />
            <Box
              css={{
                fontSize: '$xsmall',
                color: '$dangerFg',
                fontWeight: '$sansMedium',
              }}
            >
              {t('providers.bitbucketMigration.appPasswordWarning')}
            </Box>
          </Box>
          {onMigrate && (
            <Button
              size="small"
              onClick={onMigrate}
            >
              {t('providers.bitbucketMigration.migrate')}
            </Button>
          )}
        </Box>
      )}
    </StyledStorageItem>
  );
};

export default StorageItem;
