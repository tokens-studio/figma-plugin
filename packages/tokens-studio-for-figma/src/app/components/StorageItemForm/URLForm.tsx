import React from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button, TextInput, Stack, Text, Link, Label, IconButton, FormField,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.URL }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.URL }>;
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function URLForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const { t } = useTranslation(['storage']);

  const [isMasked, setIsMasked] = React.useState(false);

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
        secret: zod.string().optional(),
        internalId: zod.string().optional(),
      });
      const validationResult = zodSchema.safeParse(values);
      if (validationResult.success) {
        const formFields = {
          ...validationResult.data,
          provider: AVAILABLE_PROVIDERS.URL,
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
        <Text muted>{t('providers.url.description')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link href="https://docs.tokens.studio/sync/url?ref=addprovider" target="_blank" rel="noreferrer">
            {t('providers.url.readMore')}
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
          <Text muted>{t('nameHelpText')}</Text>
        </FormField>
        <FormField>
          <Label htmlFor="id">{t('providers.url.url')}</Label>
          <TextInput name="id" id="id" value={values.id || ''} onChange={onChange} type="text" required />
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.url.headers')}</Label>
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
          />
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
