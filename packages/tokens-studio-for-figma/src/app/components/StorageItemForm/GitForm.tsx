import React, { useRef } from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Heading } from '@tokens-studio/ui';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import Box from '../Box';
import Input from '../Input';
import Stack from '../Stack';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';
import { transformProviderName } from '@/utils/transformProviderName';
import Text from '../Text';
import Link from '../Link';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function GitForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const inputEl = useRef<HTMLInputElement | null>(null);

  const { t } = useTranslation(['storage']);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
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
  }, [values, onSubmit]);

  const baseUrlPlaceholder = `https://${values.provider}.acme-inc.com${values.provider === StorageProviderType.GITHUB ? '/api/v3' : ''}`;

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={1}>
          <Heading>
            {t('addNew')}
            {' '}
            {transformProviderName(values.provider)}
            {' '}
            {t('credentials')}

          </Heading>
          <Text muted>
            {t('gitExplained')}
            {' '}
            <Link href={`https://docs.tokens.studio/sync/${values.provider}?ref=addprovider`}>{t('readMore')}</Link>
          </Text>
        </Stack>
        <Input autofocus full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label={t('pat')}
            value={values.secret}
            onChange={onChange}
            inputRef={inputEl}
            isMasked
            type="password"
            name="secret"
            required
          />
        </Box>
        <Input
          full
          label={t('repo')}
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <Input
          full
          label={t('branch')}
          value={values.branch}
          onChange={onChange}
          type="text"
          name="branch"
          required
        />
        <Input
          full
          label={t('filePath')}
          defaultValue=""
          value={values.filePath}
          onChange={onChange}
          type="text"
          name="filePath"
        />
        <Input
          full
          label={t('baseUrl')}
          value={values.baseUrl}
          placeholder={baseUrlPlaceholder}
          onChange={onChange}
          type="text"
          name="baseUrl"
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && (
          <ErrorMessage data-testid="provider-modal-error">
            {errorMessage}
          </ErrorMessage>
        )}
      </Stack>
    </form>
  );
}
