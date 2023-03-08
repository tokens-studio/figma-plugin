import React, { useRef } from 'react';
import zod from 'zod';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import Box from '../Box';
import Button from '../Button';
import Input from '../Input';
import Stack from '../Stack';
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
  const inputEl = useRef<HTMLInputElement | null>(null);

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
      <Stack direction="column" gap={4}>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label="App Password"
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
          label="Repository (workspace/repo)"
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <Input
          full
          label="Branch"
          value={values.branch}
          onChange={onChange}
          type="text"
          name="branch"
          required
        />
        <Input
          full
          label="File Path (e.g. tokens.json) or Folder Path (e.g. tokens)"
          value={values.filePath}
          onChange={onChange}
          type="text"
          name="filePath"
          required
        />
        <Input
          full
          label="baseUrl (optional)"
          value={values.baseUrl}
          placeholder="https://api.bitbucket.com/v2"
          onChange={onChange}
          type="text"
          name="baseUrl"
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            Save
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
