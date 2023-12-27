import React, { useRef } from 'react';
import zod from 'zod';
import {
  Box, Button, Stack, TextInput,
} from '@tokens-studio/ui';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.TOKENS_STUDIO }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function TokensStudioForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const zodSchema = zod.object({
        provider: zod.string(),
        name: zod.string(),
        id: zod.string(),
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
      <Stack direction="column" gap={4}>
        <TextInput value={values.name || ''} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <TextInput
            value={values.secret || ''}
            onChange={onChange}
            type="password"
            name="secret"
            required
          />
        </Box>
        <TextInput
          value={values.id || ''}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            Save
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
