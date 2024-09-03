import React, { useRef } from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button, Textarea, TextInput, Stack, Text, Link, Label, IconButton, FormField,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { StorageProviderType } from '@sync-providers/types';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.SUPERNOVA }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.SUPERNOVA }>;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function SupernovaForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const [isMasked, setIsMasked] = React.useState(true);

  const toggleMask = React.useCallback(() => {
    setIsMasked((prev) => !prev);
  }, []);

  const { t } = useTranslation(['storage']);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const zodSchema = zod.object({
        provider: zod.string(),
        name: zod.string(),
        designSystemUrl: zod.string(),
        secret: zod.string(),
        mapping: zod.string(),
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

  const handleMappingChange = React.useCallback(
    (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => {
      // TODO: Refactor how we pass on state here. Right now storage item form requires the full event.
      onChange({ ...event, target: { ...event.target, name: 'mapping', value: event.target.value } });
    },
    [onChange],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Text muted>{t('providers.supernova.description')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link href={`https://docs.tokens.studio/sync/${values.provider}?ref=addprovider`} target="_blank" rel="noreferrer">
            {t('providers.supernova.readMore')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="name">{t('name')}</Label>
          <TextInput name="name" id="name" value={values.name || ''} onChange={onChange} type="text" required />
          <Text muted>{t('nameHelpText')}</Text>
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.supernova.accessToken')}</Label>
          <TextInput
            name="secret"
            id="secret"
            value={values.secret || ''}
            onChange={onChange}
            ref={inputEl}
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
          <Label htmlFor="designSystemUrl">{t('providers.supernova.dsUrl')}</Label>
          <TextInput
            name="designSystemUrl"
            id="designSystemUrl"
            value={values.designSystemUrl || ''}
            onChange={onChange}
            type="text"
            required
          />
        </FormField>
        <FormField>
          <Label htmlFor="mapping">Supernova &lt;&gt; Tokens Studio mapping</Label>
          <Textarea id="mapping" rows={8} value={values.mapping ?? ''} onChange={handleMappingChange} placeholder="" />
        </FormField>
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!values.secret && !values.name && !values.designSystemUrl && !values.mapping}
          >
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && <ErrorMessage data-testid="provider-modal-error">{errorMessage}</ErrorMessage>}
      </Stack>
    </form>
  );
}
