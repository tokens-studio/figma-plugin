import React, { useCallback } from 'react';
import zod from 'zod';
import { StorageTypeFormValues, GenericVersionedStorageFlow } from '@/types/StorageType';
import XIcon from '@/icons/x.svg';
import Button from '../Button';
import Input from '../Input';
import Box from '../Box';
import Stack from '../Stack';
import {
  DropdownMenu, DropdownMenuRadioGroup, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioItem,
} from '../DropdownMenu';
import Text from '../Text';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE; }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE; }>
  onChange: ChangeEventHandler;
  onCancel: () => void;
  onSubmit: (values: ValidatedFormValues) => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

const zodSchema = zod.object({
  provider: zod.string(),
  id: zod.string(),
  name: zod.string(),
  flow: zod.string(),
  additionalHeaders: zod.array(zod.object({
    name: zod.string(),
    value: zod.string().default(''),
  })),
  internalId: zod.string().optional(),
});


export default function GenericVersionedForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
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

  // Always leave headers at the end
  const headers = [...(values.additionalHeaders || []), { name: '', value: '' }];

  const headerChange = useCallback((headers) => {
    onChange({
      target: {
        name: 'additionalHeaders',
        value: headers,
      },
    });
  }, [onChange]);
  const onHeaderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the name of the target
    const key = e.target.name;
    const { value } = e.target;

    const index = Number(e.target.getAttribute('data-index'));
    // const accessor = e.target.name.split('.');

    // Attempt to access the header at that value
    const sampleHeader = headers[index];

    // Create a new header. Don't mutate the existing header
    const newHeader = {
      ...sampleHeader,
      [key]: value,
    };

    headers[index] = newHeader;

    const newHeaders = headers.filter((x) => x.name.length);
    headerChange(newHeaders);
  }, [headerChange, headers]);

  const handleClose = useCallback((e) => {
    const index = Number(e.target.getAttribute('data-index'));

    const removedHeaders = [...headers];
    removedHeaders.splice(index, 1);
    const newHeaders = removedHeaders.filter((x) => x.name.length);
    headerChange(newHeaders);
  }, [headers, headerChange]);

  const handleValueChange = useCallback((flow: string) => onChange({
    target: {
      name: 'flow',
      value: flow as GenericVersionedStorageFlow,
    },
  }), [onChange]);

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
        <DropdownMenu>
          <DropdownMenuTrigger data-cy="flow-dropdown" data-testid="flow-dropdown">
            <Box css={{ display: 'flex', gap: '1em' }}>
              <Text size="small">Flow Type: </Text>
              <Text size="small">{values.flow}</Text>
            </Box>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            css={{ minWidth: '100%' }}
          >
            <DropdownMenuRadioGroup onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_ONLY}>
                <Text>
                  {GenericVersionedStorageFlow.READ_ONLY}
                </Text>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_WRITE}>
                <Text>
                  {GenericVersionedStorageFlow.READ_WRITE}
                </Text>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_WRITE_CREATE}>
                <Text>
                  {GenericVersionedStorageFlow.READ_WRITE_CREATE}
                </Text>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Stack direction="column" gap={4}>
          <div className="font-bold">Additional Headers</div>
          {headers.map((x, i) => (
            <Box css={{ display: 'flex', gap: '1em' }}>
              <Input
                label="Name"
                value={x?.name}
                onChange={onHeaderChange}
                type="text"
                name="name"
                data-index={i}
              />
              <Input
                label="Value"
                value={x.value}
                disabled={!x.name}
                onChange={onHeaderChange}
                type="text"
                name="value"
                data-index={i}
              />
              <button
                type="button"
                onClick={handleClose}
                data-index={i}
                className="p-4 hover:bg-gray-100 rounded focus:outline-none"
              >
                <XIcon />
              </button>
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
            {errorMessage}
          </div>
        )}
      </Stack>
    </form>
  );
}
