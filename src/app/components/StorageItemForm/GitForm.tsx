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
import { transformProviderName } from '@/utils/transformProviderName';
import Heading from '../Heading';
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
            Add new
            {' '}
            {transformProviderName(values.provider)}
            {' '}
            credentials
          </Heading>
          <Text muted>
            Access tokens stored on your repository, push and pull tokens in a two-way sync.
            {' '}
            <Link href={`https://docs.tokens.studio/sync/${values.provider}?ref=addprovider`}>Read more</Link>
          </Text>
        </Stack>
        <Input autofocus full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label="Personal Access Token"
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
          label="Repository (owner/repo)"
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
          defaultValue=""
          value={values.filePath}
          onChange={onChange}
          type="text"
          name="filePath"
        />
        <Input
          full
          label="baseUrl (optional)"
          value={values.baseUrl}
          placeholder={baseUrlPlaceholder}
          onChange={onChange}
          type="text"
          name="baseUrl"
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
