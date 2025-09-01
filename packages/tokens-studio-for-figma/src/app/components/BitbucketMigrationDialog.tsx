import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Stack,
  Text,
  Heading,
  Link,
} from '@tokens-studio/ui';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import Modal from './Modal';
import { BitbucketCredentials } from '@/utils/bitbucketMigration';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onMigrate: (credential: BitbucketCredentials) => void;
  appPasswordCredentials: BitbucketCredentials[];
};

export default function BitbucketMigrationDialog({
  isOpen,
  onClose,
  onMigrate,
  appPasswordCredentials,
}: Props) {
  const { t } = useTranslation(['storage']);

  return (
    <Modal isOpen={isOpen} close={onClose} title="">
      <Stack direction="column" gap={4} css={{ padding: '$4' }}>
        <Stack direction="row" gap={3} align="center">
          <ExclamationTriangleIcon 
            style={{ 
              color: 'var(--colors-warning-fg)', 
              width: '24px', 
              height: '24px' 
            }} 
          />
          <Heading size="medium">
            {t('bitbucketMigration.title', 'Bitbucket App Password Migration Required')}
          </Heading>
        </Stack>

        <Text>
          {t('bitbucketMigration.description', 
            'Bitbucket App Passwords are being deprecated by Atlassian and will be discontinued. ' +
            'You have {{count}} Bitbucket sync(s) using App Passwords that need to be migrated to API Tokens.',
            { count: appPasswordCredentials.length }
          )}
        </Text>

        <Stack direction="column" gap={2}>
          <Text size="small" muted>
            {t('bitbucketMigration.affectedSyncs', 'Affected syncs:')}
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
                borderRadius: '$small'
              }}
            >
              <Stack direction="column" gap={1}>
                <Text size="small" css={{ fontWeight: '$semibold' }}>
                  {credential.name}
                </Text>
                <Text size="xsmall" muted>
                  {credential.id} • {credential.branch}
                </Text>
              </Stack>
              <Button
                variant="secondary"
                size="small"
                onClick={() => onMigrate(credential)}
              >
                {t('bitbucketMigration.migrate', 'Migrate')}
              </Button>
            </Stack>
          ))}
        </Stack>

        <Text size="small" muted>
          {t('bitbucketMigration.instructions', 
            'API Tokens provide better security and will continue to work after App Passwords are discontinued. ' +
            'You can migrate your existing syncs or create new ones with API Tokens.'
          )}
        </Text>

        <Link
          href="https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket?ref=migration"
          target="_blank"
          rel="noreferrer"
        >
          {t('bitbucketMigration.learnMore', 'Learn how to create API Tokens →')}
        </Link>

        <Stack direction="row" justify="end" gap={3}>
          <Button variant="secondary" onClick={onClose}>
            {t('bitbucketMigration.remindLater', 'Remind me later')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
