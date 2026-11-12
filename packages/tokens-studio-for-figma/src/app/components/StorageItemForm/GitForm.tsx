import React from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button, FormField, IconButton, Label, Link, Stack, Text, TextInput,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { StorageTypeFormValues } from '@/types/StorageType';

import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';
import { gitFormConfig, GitFormProvider } from './gitFormConfig';

type ValidatedFormValues = Extract<
StorageTypeFormValues<false>,
{ provider: GitFormProvider }
>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: GitFormProvider }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function GitForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const config = gitFormConfig[values.provider];
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
        <Text muted>{t(config.descriptionKey)}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link
            href={config.documentationUrl ?? `https://docs.tokens.studio/sync/${values.provider}?ref=addprovider`}
            target="_blank"
            rel="noreferrer"
          >
            {t(config.readMoreKey)}
          </Link>
        </Text>
        {config.setupNoteKey && <Text muted>{t(config.setupNoteKey)}</Text>}
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
          <Label htmlFor="secret">{t('pat')}</Label>
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
          {config.tokenHelpKey && <Text muted>{t(config.tokenHelpKey)}</Text>}
        </FormField>
        <FormField>
          <Label htmlFor="id">{t('repo')}</Label>
          <TextInput name="id" id="id" value={values.id || ''} onChange={onChange} type="text" required />
        </FormField>
        <FormField>
          <Label htmlFor="branch">{t('branch')}</Label>
          <TextInput name="branch" id="branch" value={values.branch || ''} onChange={onChange} type="text" required />
        </FormField>
        <FormField>
          <Label htmlFor="filePath">{t('filePath')}</Label>
          <TextInput
            name="filePath"
            id="filePath"
            defaultValue=""
            value={values.filePath || ''}
            onChange={onChange}
            type="text"
          />
          <Text muted size="xsmall">
            {t('filePathCaption')}
          </Text>
        </FormField>
        <FormField>
          <Label htmlFor="baseUrl">{t(config.baseUrl.labelKey)}</Label>
          <TextInput
            name="baseUrl"
            id="baseUrl"
            value={values.baseUrl || ''}
            required={config.baseUrl.required}
            placeholder={config.baseUrl.placeholder}
            onChange={onChange}
            type="text"
          />
          <Text muted>{t(config.baseUrl.helpKey)}</Text>
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
