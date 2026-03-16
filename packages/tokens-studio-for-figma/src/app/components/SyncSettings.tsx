/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Heading, Button, Box, Stack, Dialog,
} from '@tokens-studio/ui';
import { track } from '@/utils/analytics';
import StorageItem from './StorageItem';
import EditStorageItemModal from './modals/EditStorageItemModal';
import CreateStorageItemModal from './modals/CreateStorageItemModal';
import { Dispatch } from '../store';
import { apiProvidersSelector, localApiStateSelector, triggerMigrationEditSelector } from '@/selectors';
import { StorageProviderType } from '@/constants/StorageProviderType';
import useRemoteTokens from '../store/remoteTokens';
import { StorageTypeCredentials } from '@/types/StorageType';
import LocalStorageItem from './LocalStorageItem';
import { getProviderIcon } from '@/utils/getProviderIcon';
import { StyledBetaBadge } from './StyledBetaBadge';
import { useAuthStore } from '@/app/store/useAuthStore';

const SyncSettings = () => {
  const localApiState = useSelector(localApiStateSelector);
  const triggerMigrationEdit = useSelector(triggerMigrationEditSelector);

  const { t } = useTranslation(['storage']);

  const providers = useMemo(() => [
    {
      text: 'Tokens Studio',
      type: StorageProviderType.TOKENS_STUDIO,
    },
    {
      text: t('providers.url.title'),
      type: StorageProviderType.URL,
    },
    {
      text: t('providers.jsonbin.title'),
      type: StorageProviderType.JSONBIN,
    },
    {
      text: 'GitHub',
      type: StorageProviderType.GITHUB,
    },
    {
      text: 'GitLab',
      type: StorageProviderType.GITLAB,
    },
    {
      text: 'Azure DevOps',
      type: StorageProviderType.ADO,
    },
    {
      text: 'BitBucket',
      type: StorageProviderType.BITBUCKET,
      beta: true,
    },
    {
      text: 'Supernova',
      type: StorageProviderType.SUPERNOVA,
    },
    {
      text: t('providers.generic.title'),
      type: StorageProviderType.GENERIC_VERSIONED_STORAGE,
    },
  ], [t]);

  const apiProviders = useSelector(apiProvidersSelector);
  const dispatch = useDispatch<Dispatch>();

  const { isAuthenticated, organizations } = useAuthStore();

  const studioProviders = React.useMemo(() => {
    if (isAuthenticated && organizations?.length) {
      return organizations.map(org => {
        console.log('[SyncSettings] Raw organization API object:', org);
        if (org.subscription) console.log('[SyncSettings] Subscription object:', org.subscription);
        
        const hasAccess = org.subscription?.access?.includes('figma_plugin');
        
        let planName = '';
        if (org.subscription) {
          const sub = org.subscription as any;
          if (typeof sub.plan === 'string') planName = sub.plan;
          else if (sub.plan?.name) planName = sub.plan.name;
          else if (sub.plan_name) planName = sub.plan_name;
          else if (sub.current_plan) planName = sub.current_plan;
          
          if (sub.current_plan === null) planName = 'Starter';
        }

        return {
          provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
          internalId: `tokens-studio-${org.id}`,
          name: org.name,
          orgId: org.id,
          id: org.projects?.data?.[0]?.id || '',
          // Inject custom property so StorageItem can know without cross-referencing
          __isAccessDisabled: !hasAccess,
          __planName: planName,
          __subscriptionStatus: org.subscription?.subscription_status || '',
        } as StorageTypeCredentials & { __isAccessDisabled: boolean; __planName: string; __subscriptionStatus: string };
      });
    }
    return [];
  }, [isAuthenticated, organizations]);

  const [open, setOpen] = React.useState(false);

  // Track when user opens the create new sync provider dialog
  React.useEffect(() => {
    if (open) {
      track('Create Sync Provider Dialog Opened', {
        source: 'sync-settings',
      });
    }
  }, [open]);

  const { fetchBranches } = useRemoteTokens();

  const [editStorageItemModalVisible, setShowEditStorageModalVisible] = React.useState(Boolean(localApiState.new));
  const [createStorageItemModalVisible, setShowCreateStorageModalVisible] = React.useState(false);
  const [storageProvider, setStorageProvider] = React.useState(localApiState.provider);

  const setLocalBranches = React.useCallback(
    async (provider: StorageTypeCredentials) => {
      const branches = await fetchBranches(provider);
      if (branches) {
        dispatch.branchState.setBranches(branches);
      }
    },
    [dispatch.branchState, fetchBranches],
  );

  // Handle migration trigger from AppContainer
  React.useEffect(() => {
    if (triggerMigrationEdit) {
      dispatch.uiState.setLocalApiState(triggerMigrationEdit);
      setShowEditStorageModalVisible(true);
      // Handle async branch fetching with error handling
      setLocalBranches(triggerMigrationEdit);
      // Clear the trigger
      dispatch.uiState.setTriggerMigrationEdit(null);
    }
  }, [triggerMigrationEdit, dispatch, setLocalBranches]);

  const handleEditClick = React.useCallback(
    (provider: any, migrating = false) => () => {
      track('Edit Credentials');
      dispatch.uiState.setLocalApiState({ ...provider, migrating });
      setShowEditStorageModalVisible(true);
      setLocalBranches(provider);
    },
    [dispatch.uiState, setLocalBranches],
  );

  const handleShowAddCredentials = React.useCallback((provider: StorageProviderType) => {
    track('Add Credentials', { provider });
    setShowCreateStorageModalVisible(true);
  }, []);

  const handleProviderClick = React.useCallback(
    (provider: StorageProviderType) => () => {
      setOpen(false);
      setStorageProvider(provider);
      handleShowAddCredentials(provider);
    },
    [handleShowAddCredentials],
  );

  const handleHideStorageModal = React.useCallback(() => {
    setShowEditStorageModalVisible(false);
  }, []);

  const handleHideAddCredentials = React.useCallback(() => {
    setShowCreateStorageModalVisible(false);
  }, []);

  return (
    <Box css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {editStorageItemModalVisible && (
        <EditStorageItemModal
          isOpen={editStorageItemModalVisible}
          onClose={handleHideStorageModal}
          initialValue={localApiState}
          onSuccess={handleHideStorageModal}
        />
      )}
      {createStorageItemModalVisible && (
        <CreateStorageItemModal
          isOpen={createStorageItemModalVisible}
          onClose={handleHideAddCredentials}
          onSuccess={handleHideAddCredentials}
          storageProvider={storageProvider}
        />
      )}
      <Box css={{ padding: '0 $4' }}>
        <Stack gap={4} direction="column" align="start">
          <Stack direction="row" justify="between" align="center" css={{ width: '100%' }}>
            <Heading size="medium">{t('syncProviders')}</Heading>
            <Dialog modal open={open} onOpenChange={setOpen}>
              <Dialog.Trigger asChild>
                <Button variant="secondary" size="small" data-testid="add-storage-item-button">
                  {t('addNewSyncProvider')}
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content className="content scroll-container">
                  <Heading>{t('addNewSyncProvider')}</Heading>

                  <Stack direction="column" gap={4}>
                    {
                      providers.map((provider) => (
                        <Stack direction="row" justify="between" align="center" key={provider.text}>
                          <Stack direction="column">
                            <Box css={{
                              color: '$fgDefault', display: 'inline-flex', gap: '$2', alignItems: 'center',
                            }}
                            >
                              <Box css={{ color: '$fgMuted' }}>{getProviderIcon(provider.type)}</Box>
                              {provider.text}
                              {provider.beta && <StyledBetaBadge>BETA</StyledBetaBadge>}
                            </Box>
                          </Stack>
                          <Button
                            key={provider.type}
                            onClick={handleProviderClick(provider.type)}
                            variant="secondary"
                            size="small"
                            data-testid={`add-${provider.text}-credential`}
                          >
                            {t('choose')}
                          </Button>
                        </Stack>
                      ))
                    }
                  </Stack>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog>
          </Stack>

          <Stack direction="column" gap={2} width="full" align="start">
            {studioProviders.map((item) => (
              <StorageItem
                key={item.internalId}
                onEdit={handleEditClick(item)}
                onMigrate={handleEditClick(item, true)}
                item={item}
              />
            ))}
            <LocalStorageItem />
            {apiProviders.length > 0 && (
              <Box css={{ width: '100%', height: '1px', backgroundColor: '$borderSubtle', margin: '$2 0' }} />
            )}
            {apiProviders.length > 0 && apiProviders.map((item) => (
              <StorageItem
                key={item?.internalId || `${item.provider}-${item.id}`}
                onEdit={handleEditClick(item)}
                onMigrate={handleEditClick(item, true)}
                item={item}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SyncSettings;
