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

type Props = {
  item: StorageTypeCredentials;
  onEdit: () => void;
  onMigrate?: () => void;
};

const StorageItem = ({ item, onEdit, onMigrate }: Props) => {
  const [hasErrored, setHasErrored] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const storageType = useSelector(storageTypeSelector);
  const { provider, id, name } = item;
  const branch = isGitProvider(item) ? item.branch : null;
  const { restoreStoredProvider, deleteProvider } = useRemoteTokens();
  const { confirm } = useConfirm();
  const { setStorageType } = useStorage();
  const dispatch = useDispatch<Dispatch>();

  const { t } = useTranslation(['storage']);

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

  const isActive = React.useCallback(() => isSameCredentials(item, storageType), [item, storageType]);

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
    const response = await restoreStoredProvider(item);
    if (response.status === 'success') {
      setHasErrored(false);
    } else {
      setHasErrored(true);
      setErrorMessage(response?.errorMessage);
    }
  }, [item, restoreStoredProvider]);

  return (
    <StyledStorageItem data-testid={`storageitem-${provider}-${id}`} key={`${provider}-${id}`} active={isActive()} hasError={isBitbucketWithAppPassword}>
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
                {id}
                {' '}
                {branch && ` (${branch})`}
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
              {storageType.provider !== StorageProviderType.TOKENS_STUDIO && (
              <TokenFormatBadge extended />
              )}
              <Badge>{t('active')}</Badge>
            </Stack>
          ) : (
            <Button data-testid="button-storage-item-apply" variant="secondary" size="small" onClick={handleRestore}>
              {t('apply')}
            </Button>
          )}
        </Box>
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
