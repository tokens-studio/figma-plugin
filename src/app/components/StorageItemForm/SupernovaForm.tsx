import React, { useRef } from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import Box from '../Box';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';
import Text from '../Text';
import { generateId } from '@/utils/generateId';
import Heading from '../Heading';
import Link from '../Link';
import Textarea from '../Textarea';
import { ErrorMessage } from '../ErrorMessage';
import Label from '../Label';

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

  const { t } = useTranslation(['storage', 'general']);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
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
  }, [values, onSubmit]);

  const handleMappingChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event);
    },
    [onChange],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={1}>
          <Heading>
            {t('providers.supernova.addNew')}
          </Heading>
          <Text muted>
            {t('providers.supernova.description')}
            {' '}
            <Link href="https://learn.supernova.io/">{t('readMore', { ns: 'general' })}</Link>
          </Text>
        </Stack>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label={t('providers.supernova.accessToken')}
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
          label={t('providers.supernova.dsUrl')}
          value={values.designSystemUrl}
          onChange={onChange}
          type="text"
          name="designSystemUrl"
          required
        />
        <Label htmlFor="mapping">
          Supernova &lt;&gt; Tokens Studio mapping
        </Label>
        <Textarea
          id="mapping"
          name="mapping"
          border
          rows={8}
          value={values.mapping ?? ''}
          onChange={handleMappingChange}
          placeholder=""
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={!values.secret && !values.name && !values.designSystemUrl && !values.mapping}>
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && (
          <ErrorMessage data-cy="provider-modal-error">
            {errorMessage}
          </ErrorMessage>
        )}
      </Stack>
    </form>
  );
}
