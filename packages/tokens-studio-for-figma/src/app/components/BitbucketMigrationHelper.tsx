import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Stack,
  Text,
  Heading,
  Link,
  Box,
} from '@tokens-studio/ui';
import { ExclamationTriangleIcon, CheckIcon } from '@radix-ui/react-icons';
import { useBitbucketMigration } from '@/app/hooks/useBitbucketMigration';
import { BitbucketCredentials } from '@/utils/bitbucketMigration';

type Props = {
  onEditCredential: (credential: BitbucketCredentials) => void;
};

export default function BitbucketMigrationHelper({ onEditCredential }: Props) {
  const { t } = useTranslation(['storage']);
  const { hasAppPasswords, appPasswordCredentials } = useBitbucketMigration();

  if (!hasAppPasswords) {
    return (
      <Box css={{ 
        padding: '$3', 
        backgroundColor: '$bgSuccess', 
        borderRadius: '$small',
        border: '1px solid $borderSuccess'
      }}>
        <Stack direction="row" gap={2} align="center">
          <CheckIcon style={{ color: 'var(--colors-success-fg)' }} />
          <Text size="small" css={{ color: '$fgSuccess' }}>
            {t('bitbucketMigration.allUpToDate', 'All your Bitbucket syncs are using API Tokens. No migration needed!')}
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box css={{ 
      padding: '$4', 
      backgroundColor: '$bgWarning', 
      borderRadius: '$small',
      border: '1px solid $borderWarning'
    }}>
      <Stack direction="column" gap={3}>
        <Stack direction="row" gap={2} align="center">
          <ExclamationTriangleIcon style={{ color: 'var(--colors-warning-fg)' }} />
          <Heading size="small" css={{ color: '$fgWarning' }}>
            {t('bitbucketMigration.migrationNeeded', 'Bitbucket Migration Needed')}
          </Heading>
        </Stack>

        <Text size="small" css={{ color: '$fgWarning' }}>
          {t('bitbucketMigration.helperDescription', 
            'You have {{count}} Bitbucket sync(s) using deprecated App Passwords. ' +
            'Migrate them to API Tokens to ensure continued access.',
            { count: appPasswordCredentials.length }
          )}
        </Text>

        <Stack direction="column" gap={2}>
          <Text size="small" css={{ color: '$fgWarning', fontWeight: '$semibold' }}>
            {t('bitbucketMigration.syncsToMigrate', 'Syncs to migrate:')}
          </Text>
          {appPasswordCredentials.map((credential) => (
            <Stack 
              key={credential.internalId} 
              direction="row" 
              justify="between" 
              align="center"
              css={{ 
                padding: '$2', 
                backgroundColor: '$bgDefault',
                borderRadius: '$small',
                border: '1px solid $borderDefault'
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
                onClick={() => onEditCredential(credential)}
              >
                {t('bitbucketMigration.migrate', 'Migrate')}
              </Button>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" gap={2} align="center">
          <Link
            href="https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket?ref=migration-helper"
            target="_blank"
            rel="noreferrer"
          >
            {t('bitbucketMigration.learnMore', 'Learn how to create API Tokens →')}
          </Link>
        </Stack>
      </Stack>
    </Box>
  );
}
