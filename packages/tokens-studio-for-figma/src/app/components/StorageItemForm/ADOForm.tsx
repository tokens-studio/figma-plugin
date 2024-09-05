import React from 'react';
import zod from 'zod';
import {
  Button, FormField, Stack, Text, Link, IconButton, Label, TextInput,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import type { StorageProviderType } from '@sync-providers/types';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.ADO }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.ADO }>;
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function ADOForm({
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
        name: zod.string().optional(),
        id: zod.string(),
        branch: zod.string(),
        filePath: zod.string(),
        baseUrl: zod.string(),
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
        <Text muted>
          {t('providers.ado.description')}
          {' '}
          <Link href="https://docs.tokens.studio/sync/ado?ref=addprovider" target="_blank" rel="noreferrer">
            {t('providers.ado.readMore')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="baseUrl">{t('providers.ado.orgUrl')}</Label>
          <TextInput
            autoFocus
            value={values.baseUrl || ''}
            placeholder="https://dev.azure.com/my_organization_name"
            onChange={onChange}
            type="text"
            name="baseUrl"
            id="baseUrl"
            required
          />
        </FormField>
        <FormField>
          <Label htmlFor="name">{t('providers.ado.projectName')}</Label>
          <TextInput value={values.name || ''} onChange={onChange} type="text" name="name" id="name" required />
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.ado.pat')}</Label>
          <TextInput
            value={values.secret || ''}
            onChange={onChange}
            type={isMasked ? 'password' : 'text'}
            trailingAction={(
              <IconButton
                variant="invisible"
                size="small"
                onClick={toggleMask}
                icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
              />
            )}
            name="secret"
            id="secret"
            required
          />
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.ado.repositoryName')}</Label>
          <TextInput value={values.id || ''} onChange={onChange} type="text" name="id" id="id" required />
        </FormField>
        <FormField>
          <Label htmlFor="branch">{t('branch')}</Label>
          <TextInput name="branch" id="branch" value={values.branch || ''} onChange={onChange} type="text" required />
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
          <Text muted>{t('filePathCaption')}</Text>
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
