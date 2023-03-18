import React from 'react';
import zod from 'zod';
import { StorageTypeFormValues } from '@/types/StorageType';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';
import Heading from '../Heading';
import Link from '../Link';
import Text from '../Text';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.JSONBIN; }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.JSONBIN; }>
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  isNew?: boolean;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function JSONBinForm({
  isNew = false, onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
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
        provider: StorageProviderType.JSONBIN,
        internalId: validationResult.data.internalId || generateId(24),
      } as ValidatedFormValues;
      onSubmit(formFields);
    }
  }, [values, onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={1}>
          <Heading>Add new JSONBin.io credentials</Heading>
          <Text muted>
            Access tokens stored on JSONBin.io, a free JSON storage service for two-way sync.
            {' '}
            <Link href="https://docs.tokens.studio/sync/jsonbin?ref=addprovider">Read more</Link>
          </Text>
        </Stack>
        <Input autofocus full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Input
          full
          label="Secret"
          value={values.secret}
          onChange={onChange}
          type="text"
          name="secret"
          required
        />
        <Input
          full
          label={`ID${isNew ? ' (optional)' : ''}`}
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required={!isNew}
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            Save credentials
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
