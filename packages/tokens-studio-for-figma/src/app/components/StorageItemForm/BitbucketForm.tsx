import React from 'react';
import zod from 'zod';
import {
  Button, TextInput, Stack, FormField, Label, Link, IconButton, Text,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.BITBUCKET }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.BITBUCKET }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function BitbucketForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const { t } = useTranslation(['storage']);
  const [isMasked, setIsMasked] = React.useState(true);

  const toggleMask = React.useCallback(() => {
    setIsMasked((prev) => !prev);
  }, []);

  const handleMigrationMode = React.useCallback(() => {
    onChange({ target: { name: 'migrating', value: true } } as any);
  }, [onChange]);

  // Determine if this is an existing sync using app password
  // If migrating is true, treat as API token mode even for existing credentials
  const isEditingAppPasswordSync = !values.new && values.secret && !values.apiToken && !values.migrating;
  const isNewSync = values.new || values.migrating;
  const isMigrating = values.migrating;

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const zodSchema = zod.object({
        provider: zod.string(),
        name: zod.string(),
        username: zod.string(),
        id: zod.string(),
        branch: zod.string(),
        filePath: zod.string(),
        baseUrl: zod.string().optional(),
        secret: zod.string().optional(),
        apiToken: zod.string().optional(),
        internalId: zod.string().optional(),
      }).refine((data) => {
        // For new syncs or migration, require API token
        if (isNewSync) {
          return data.apiToken && data.apiToken.trim() !== '';
        }
        // For existing syncs, require either secret (app password) or API token
        return (data.secret && data.secret.trim() !== '') || (data.apiToken && data.apiToken.trim() !== '');
      }, {
        message: isNewSync
          ? 'API Token is required for new syncs'
          : 'Either App Password or API Token is required',
        path: ['apiToken'],
      });

      const validationResult = zodSchema.safeParse(values);
      if (validationResult.success) {
        const formFields = {
          ...validationResult.data,
          internalId: validationResult.data.internalId || generateId(24),
        } as ValidatedFormValues;

        // When migrating, clear the secret (app password) field
        if (isMigrating) {
          const { secret, migrating, ...cleanedFields } = formFields as any;
          onSubmit(cleanedFields);
          return;
        }

        onSubmit(formFields);
      }
    },
    [values, onSubmit, isNewSync, isMigrating],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Text muted>{t('bitBucketExplained')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link
            href="https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket?ref=addprovider"
            target="_blank"
            rel="noreferrer"
          >
            {t('readMoreBitBucket')}
          </Link>
        </Text>
        {isMigrating && (
          <Text muted css={{ marginTop: '$2' }}>
            <Link
              href="https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket/migration-from-app-passwords-to-api-tokens"
              target="_blank"
              rel="noreferrer"
            >
              {t('providers.bitbucketMigration.migrationGuide')}
            </Link>
          </Text>
        )}
        <FormField>
          <Label htmlFor="name">{t('name')}</Label>
          <TextInput value={values.name || ''} onChange={onChange} type="text" name="name" id="name" required />
          <Text muted size="xsmall">{t('nameHelpText')}</Text>
        </FormField>
        <FormField>
          <Label htmlFor="username">
            {isEditingAppPasswordSync
              ? t('providers.bitbucket.usernameAppPassword')
              : t('providers.bitbucket.username')}
          </Label>
          <TextInput
            value={values.username || ''}
            onChange={onChange}
            type="text"
            name="username"
            id="username"
            required
          />
        </FormField>

        {/* Show app password field for existing syncs that use app passwords */}
        {isEditingAppPasswordSync && (
          <>
            <FormField>
              <Label htmlFor="secret">{t('providers.bitbucket.appPassword')}</Label>
              <TextInput
                value={values.secret || ''}
                onChange={onChange}
                name="secret"
                id="secret"
                required
                type={isMasked ? 'password' : 'text'}
                trailingAction={(
                  <IconButton
                    variant="invisible"
                    size="small"
                    onClick={toggleMask}
                    icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  />
                )}
              />
              <Text muted size="xsmall">
                {t('providers.bitbucketMigration.appPasswordDeprecated')}
              </Text>
            </FormField>

            {/* Migration warning below app password field */}
            <Stack direction="row" justify="between" align="center" css={{ marginTop: '$2' }}>
              <Stack direction="row" gap={2} align="center">
                <ExclamationTriangleIcon
                  style={{
                    color: 'var(--colors-dangerFg)',
                    width: '14px',
                    height: '14px',
                  }}
                />
                <Text size="small" css={{ color: '$dangerFg' }}>
                  {t('providers.bitbucketMigration.appPasswordDeprecated')}
                </Text>
              </Stack>
              <Button
                variant="secondary"
                size="small"
                onClick={handleMigrationMode}
              >
                {t('providers.bitbucketMigration.switchToMigrationMode')}
              </Button>
            </Stack>
          </>
        )}

        {/* Show API token field for new syncs or existing syncs that already use API tokens */}
        {(isNewSync || !isEditingAppPasswordSync) && (
          <FormField>
            <Label htmlFor="apiToken">{t('providers.bitbucket.apiToken')}</Label>
            <TextInput
              value={values.apiToken || ''}
              onChange={onChange}
              name="apiToken"
              id="apiToken"
              required={isNewSync}
              type={isMasked ? 'password' : 'text'}
              trailingAction={(
                <IconButton
                  variant="invisible"
                  size="small"
                  onClick={toggleMask}
                  icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
                />
              )}
            />
            {isNewSync && !isMigrating && (
              <Text muted size="xsmall">
                {t('providers.bitbucketMigration.apiTokenRequired')}
              </Text>
            )}
            {isMigrating && (
              <Text muted size="xsmall">
                {t('providers.bitbucketMigration.migrationInProgress')}
              </Text>
            )}
          </FormField>
        )}
        <FormField>
          <Label htmlFor="id">{t('providers.bitbucket.repository')}</Label>
          <TextInput value={values.id || ''} onChange={onChange} type="text" name="id" id="id" required />
        </FormField>
        <FormField>
          <Label htmlFor="branch">{t('branch')}</Label>
          <TextInput value={values.branch || ''} onChange={onChange} type="text" name="branch" id="branch" required />
        </FormField>
        <FormField>
          <Label htmlFor="filePath">{t('filePath')}</Label>
          <TextInput
            value={values.filePath || ''}
            onChange={onChange}
            type="text"
            name="filePath"
            id="filePath"
            required
          />
          <Text muted size="xsmall">
            {t('filePathCaption')}
          </Text>
        </FormField>

        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              !values.name || (isNewSync && !values.apiToken) || (isEditingAppPasswordSync && !values.secret) || (!isEditingAppPasswordSync && !isNewSync && !values.apiToken)
            }
          >
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && <ErrorMessage data-testid="provider-modal-error">{errorMessage}</ErrorMessage>}
      </Stack>
    </form>
  );
}
