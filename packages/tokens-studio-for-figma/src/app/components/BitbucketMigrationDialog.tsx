import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Stack,
  Text,
  Heading,
  Link,
} from '@tokens-studio/ui';
import Modal from './Modal';
import { useBitbucketMigration } from '@/app/hooks/useBitbucketMigration';

export default function BitbucketMigrationDialog() {
  const {
    showDialog,
    appPasswordCredentials,
    closeDialog,
    handleMigrate,
    checkAndShowMigrationDialog,
  } = useBitbucketMigration();
  const { t } = useTranslation(['storage']);
  const [hasMigrationBeenChecked, setHasMigrationBeenChecked] = useState(false);

  const createMigrateHandler = React.useCallback((credential: any) => () => {
    handleMigrate(credential);
  }, [handleMigrate]);

  // Check for migration dialog once on mount (simulating startup completion)
  useEffect(() => {
    if (!hasMigrationBeenChecked) {
      // Small delay to let the UI settle after startup
      const timer = setTimeout(() => {
        checkAndShowMigrationDialog();
        setHasMigrationBeenChecked(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hasMigrationBeenChecked, checkAndShowMigrationDialog]);

  return (
    <Modal isOpen={showDialog} close={closeDialog} title="">
      <Stack direction="column" gap={4} css={{ padding: '$4' }}>
        <Heading size="medium">
          {t('providers.bitbucketMigration.title')}
        </Heading>

        <Text>
          {t('providers.bitbucketMigration.description', { count: appPasswordCredentials.length })}
        </Text>

        <Stack direction="column" gap={2}>
          <Text size="small" muted>
            {t('providers.bitbucketMigration.affectedSyncs')}
          </Text>
          {appPasswordCredentials.map((credential) => (
            <Stack
              key={credential.internalId}
              direction="row"
              justify="between"
              align="center"
              css={{
                padding: '$2',
                backgroundColor: '$bgSubtle',
                borderRadius: '$small',
              }}
            >
              <Stack direction="column" gap={1}>
                <Text size="small" css={{ fontWeight: '$semibold' }}>
                  {credential.name}
                </Text>
                <Text size="xsmall" muted>
                  {credential.id}
                  {' • '}
                  {credential.branch}
                </Text>
              </Stack>
              <Button
                variant="secondary"
                size="small"
                onClick={createMigrateHandler(credential)}
              >
                {t('providers.bitbucketMigration.migrate')}
              </Button>
            </Stack>
          ))}
        </Stack>

        <Text size="small" muted>
          {t('providers.bitbucketMigration.instructions')}
        </Text>

        <Link
          href="https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket/migration-from-app-passwords-to-api-tokens"
          target="_blank"
          rel="noreferrer"
        >
          {t('providers.bitbucketMigration.learnMore')}
        </Link>

        <Stack direction="row" justify="end" gap={3}>
          <Button variant="secondary" onClick={closeDialog}>
            {t('providers.bitbucketMigration.remindLater')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
