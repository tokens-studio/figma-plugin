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
import { isTokensStudioOAuthType } from '@/utils/is';
import { StudioProjectSelector } from './Subscription/StudioProjectSelector';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useTokensStudioOAuth } from '../store/providers/tokens-studio/tokensStudioOAuth';

type Props = {
  item: StorageTypeCredentials;
  onEdit: () => void;
  onMigrate?: () => void;
  isOAuthApp?: boolean;
};

const StorageItem = ({
  item, onEdit, onMigrate, isOAuthApp,
}: Props) => {
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
  const {
    activeProject, setActiveOrganization, setActiveProject, organizations,
  } = useAuthStore();
  const { loadProjectTokens } = useTokensStudioOAuth();
  const isOAuth = React.useMemo(() => isTokensStudioOAuthType(item), [item]);

  const oauthItem = isTokensStudioOAuthType(item) ? item : null;
  
  const org = React.useMemo(() => {
    return oauthItem && oauthItem.orgId 
      ? organizations.find((o) => o.id === oauthItem.orgId) 
      : null;
  }, [oauthItem, organizations]);

  const hasAccess = org?.subscription?.access?.includes('figma_plugin') ?? true;
  const isAccessDisabled = oauthItem ? !hasAccess : false;
  
  const planName = React.useMemo(() => {
    if (!org?.subscription) return '';
    const sub = org.subscription as any;
    if (typeof sub.plan === 'string') return sub.plan;
    if (sub.plan?.name) return sub.plan.name;
    if (sub.plan_name) return sub.plan_name;
    if (sub.current_plan) return sub.current_plan;
    if (sub.current_plan === null) return 'Starter';
    return '';
  }, [org]);
  
  const subscriptionStatus = org?.subscription?.subscription_status || '';
  const isActive = React.useCallback(() => isSameCredentials(item, storageType), [item, storageType]);

  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    isActive() && oauthItem ? oauthItem.id : undefined,
  );

  // Check if this is a Bitbucket item using app password
  const isBitbucketWithAppPassword = React.useMemo(() => (
    item.provider === StorageProviderType.BITBUCKET && isUsingAppPassword(item as Extract<StorageTypeCredentials, { provider: StorageProviderType.BITBUCKET }>)
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
    if (oauthItem) {
      let fallbackId = oauthItem.id;
      const isCurrentlyActiveOrg = !oauthItem.orgId || oauthItem.orgId === useAuthStore.getState().activeOrganizationId;
      if (isCurrentlyActiveOrg && activeProject) {
        fallbackId = activeProject.id;
      }

      const idToLoad = selectedProjectId || fallbackId;
      if (idToLoad) {
        try {
          if (oauthItem.orgId) {
            setActiveOrganization(oauthItem.orgId);
          }
          setActiveProject(idToLoad);
          await loadProjectTokens(idToLoad);
          const newItem = { ...oauthItem, id: idToLoad };
          dispatch.uiState.setLocalApiState(newItem);
          dispatch.uiState.setApiData(newItem);
          setStorageType({ provider: newItem, shouldSetInDocument: true });

          try {
            const branches = await fetchBranches(newItem);
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
                {(() => {
                  if (isOAuth) {
                    return subscriptionStatus === 'trial_expired' ? 'Trial expired' : planName;
                  }
                  return (
                    <>
                      {id}
                      {' '}
                      {branch && ` (${branch})`}
                    </>
                  );
                })()}
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
                  <StudioProjectSelector orgId={oauthItem?.orgId} />
                  <Badge>{t('active')}</Badge>
                </>
              ) : (
                <Badge>{t('active')}</Badge>
              )}
            </Stack>
          ) : (
            <Stack gap={2} align="center">
              {isOAuth && <StudioProjectSelector orgId={oauthItem?.orgId} value={selectedProjectId} onChange={setSelectedProjectId} />}
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
