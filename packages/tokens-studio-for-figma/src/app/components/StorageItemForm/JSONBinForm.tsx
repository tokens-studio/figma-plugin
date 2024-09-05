import React from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button, FormField, IconButton, Label, Link, Stack, Text, TextInput,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.JSONBIN }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.JSONBIN }>;
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  isNew?: boolean;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function JSONBinForm({
  isNew = false,
  onChange,
  onSubmit,
  onCancel,
  values,
  hasErrored,
  errorMessage,
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
        id: zod.string().optional(),
        secret: zod.string(),
        internalId: zod.string().optional(),
      });
      const validationResult = zodSchema.safeParse(values);
      if (validationResult.success) {
        const formFields = {
          ...validationResult.data,
          provider: AVAILABLE_PROVIDERS.JSONBIN,
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
        <Text muted>{t('providers.jsonbin.description')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link href="https://docs.tokens.studio/sync/jsonbin?ref=addprovider" target="_blank" rel="noreferrer">
            {t('providers.jsonbin.readMore')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="name">{t('name')}</Label>
          <TextInput
            autoFocus
            name="name"
            id="name"
            value={values.name || ''}
            onChange={onChange}
            type="text"
            required
          />
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.jsonbin.apiKey')}</Label>
          <TextInput
            name="secret"
            id="secret"
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
            required
          />
        </FormField>
        <FormField>
          <Label htmlFor="id">{`ID${isNew ? ' (optional)' : ''}`}</Label>
          <TextInput name="id" id="id" value={values.id || ''} onChange={onChange} type="text" required={!isNew} />
          <Text muted>{t('providers.jsonbin.idHelp')}</Text>
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
