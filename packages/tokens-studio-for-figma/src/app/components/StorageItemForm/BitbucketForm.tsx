import React from 'react';
import zod from 'zod';
import {
  Button, Box, TextInput, Stack, FormField, Label, Link, IconButton, Text,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import type { StorageProviderType } from '@sync-providers/types';
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
        secret: zod.string(),
        internalId: zod.string().optional(),
      });
      const validationResult = zodSchema.safeParse(values);
      if (validationResult.success) {
        const formFields = {
          ...validationResult.data,
          internalId: validationResult.data.internalId || generateId(24),
        } as ValidatedFormValues;
        onSubmit(formFields);
      }
    },
    [values, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Text muted>{t('bitBucketExplained')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link
            href={`https://docs.tokens.studio/sync/${values.provider}?ref=addprovider`}
            target="_blank"
            rel="noreferrer"
          >
            {t('readMoreBitBucket')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="name">{t('name')}</Label>
          <TextInput value={values.name || ''} onChange={onChange} type="text" name="name" id="name" required />
          <Text muted>{t('nameHelpText')}</Text>
        </FormField>
        <FormField>
          <Label htmlFor="name">{t('providers.bitbucket.username')}</Label>
          <TextInput
            value={values.username || ''}
            onChange={onChange}
            type="text"
            name="username"
            id="username"
            required
          />
        </FormField>
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
        </FormField>
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
          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && <ErrorMessage data-testid="provider-modal-error">{errorMessage}</ErrorMessage>}
      </Stack>
    </form>
  );
}
