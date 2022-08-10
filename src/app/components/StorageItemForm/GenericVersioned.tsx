import React from 'react';
import zod from 'zod';
import { StorageTypeFormValues } from '@/types/StorageType';
import Button from '../Button';
import Input from '../Input';
import Box from '../Box';
import Stack from '../Stack';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { generateId } from '@/utils/generateId';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE; }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE; }>
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
};

const zodSchema = zod.object({
  provider: zod.string(),
  id: zod.string(),
  name: zod.string(),
  additionalHeaders: zod.array(zod.object({
    name: zod.string(),
    value: zod.string().default(''),
  })),
  internalId: zod.string().optional(),
});

export default function GenericVersionedForm({
  onChange, onSubmit, onCancel, values, hasErrored,
}: Props) {
  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = zodSchema.safeParse(values);
    if (validationResult.success) {
      const formFields = {
        ...validationResult.data,
        provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
        internalId: validationResult.data.internalId || generateId(24),
      } as ValidatedFormValues;
      onSubmit(formFields);
    }
  }, [values, onSubmit]);

  console.log(values)

  const withAdditionalHeaders = [...(values.additionalHeaders || []), {
    name: '',
    value: '',
  }];

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Input
          full
          label="URL"
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <Stack direction="column" gap={4}>
          <div className="font-bold">Additional Headers</div>
          {withAdditionalHeaders.map((x, i) => (
            <Box css={{ display: 'flex', gap: '1em' }}>
              <Input
                label="Name"
                value={x.name}
                onChange={onChange}
                type="text"
                name={`additionalHeaders.${i}.name`}
              />
              <Input
                label="Value"
                value={x.value}
                onChange={onChange}
                type="text"
                name={`additionalHeaders.${i}.value`}
              />
            </Box>
          ))}
        </Stack>
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.id}>
            Save
          </Button>
        </Stack>
        {hasErrored && (
        <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold" data-cy="provider-modal-error">
          There was an error connecting. Check your credentials.
        </div>
        )}
      </Stack>
    </form>
  );
}
