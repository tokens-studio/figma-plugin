import React, { useRef } from 'react';
import zod from 'zod';
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

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.SUPERNOVA }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.SUPERNOVA }>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
};

export default function SupernovaForm({
  onChange, onSubmit, onCancel, values, hasErrored,
}: Props) {
  const inputEl = useRef<HTMLInputElement | null>(null);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const zodSchema = zod.object({
      provider: zod.string(),
      name: zod.string(),
      designSystemUrl: zod.string(),
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

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={1}>
          <Heading>
            Add new Supernova credentials
          </Heading>
          <Text muted>
            Allows you to push tokens into specific brand and theme in a selected design system.
            {' '}
            <Link href="https://learn.supernova.io/">Read more</Link>
          </Text>
        </Stack>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Box css={{ position: 'relative' }}>
          <Input
            full
            label="Supernova Access Token"
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
          label="Design System URL"
          value={values.designSystemUrl}
          onChange={onChange}
          type="text"
          name="designSystemUrl"
          required
        />
        <Stack direction="row" gap={4}>
          <Button variant="secondary" size="large" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="primary" type="submit" disabled={!values.secret && !values.name && !values.designSystemUrl}>
            Save
          </Button>
        </Stack>
        {hasErrored && (
          <div className="bg-red-200 text-red-700 rounded p-4 text-xs font-bold" data-cy="provider-modal-error">
            There was an error connecting to Supernova. Check your API key / Design System URL.
          </div>
        )}
      </Stack>
    </form>
  );
}