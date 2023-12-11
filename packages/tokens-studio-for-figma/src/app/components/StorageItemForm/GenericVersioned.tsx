import React, { useCallback, useMemo } from 'react';
import zod from 'zod';
import { TriangleDownIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { DropdownMenuPortal } from '@radix-ui/react-dropdown-menu';
import { IconButton, Button } from '@tokens-studio/ui';
import { StorageTypeFormValues, GenericVersionedStorageFlow } from '@/types/StorageType';
import XIcon from '@/icons/x.svg';
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
import Heading from '../Heading';
import Label from '../Label';
import { ErrorMessage } from '../ErrorMessage';
import Link from '../Link';

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
    value: zod.string().default('storage.providers.generic.'),
  })),
  internalId: zod.string().optional(),
});

export default function GenericVersionedForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const { t } = useTranslation(['storage']);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = zodSchema.safeParse({ additionalHeaders: [], ...values });
    if (validationResult.success) {
      const formFields = {
        ...validationResult.data,
        provider: StorageProviderType.GENERIC_VERSIONED_STORAGE,
        internalId: validationResult.data.internalId || generateId(24),
      } as ValidatedFormValues;
      onSubmit(formFields);
    } else {
      // eslint-disable-next-line no-console
      console.log(validationResult, values);
    }
  }, [values, onSubmit]);

  const handleValueChange = useCallback((flow: string) => onChange({
    target: {
      name: 'flow',
      value: flow as GenericVersionedStorageFlow,
    },
  }), [onChange]);

  const flow = useMemo(() => {
    // If the form was created initially, default to Read write flow
    if (typeof values.flow === 'undefined') {
      const defaultFlow = GenericVersionedStorageFlow.READ_WRITE;
      handleValueChange(defaultFlow);
      return defaultFlow;
    }
    return values.flow;
  }, [handleValueChange, values.flow]);

  // Always leave headers at the end
  const headers = useMemo(() => [...(values.additionalHeaders || []), { name: '', value: '' }], [values.additionalHeaders]);

  const headerChange = useCallback((changedHeaders: any) => {
    onChange({
      target: {
        name: 'additionalHeaders',
        value: changedHeaders,
      },
    });
  }, [onChange]);
  const onHeaderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Get the name of the target
    const key = e.target.name;
    const { value } = e.target;

    const index = Number(e.target.dataset.index);

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

  const handleClose = useCallback((e: any) => {
    const index = Number(e.target.dataset.index);

    const removedHeaders = [...headers];
    removedHeaders.splice(index, 1);
    const newHeaders = removedHeaders.filter((x) => x.name.length);
    headerChange(newHeaders);
  }, [headers, headerChange]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={4}>
        <Stack direction="column" gap={1}>
          <Heading>{t('providers.generic.addNew')}</Heading>
          <Text muted>
            {t('providers.generic.description')}
            {' '}
            <Link href="https://docs.tokens.studio/sync/generic-storage?ref=addprovider">{t('general.readMore')}</Link>
          </Text>
        </Stack>
        <Input full label="Name" value={values.name} onChange={onChange} type="text" name="name" required />
        <Input
          full
          label={t('providers.generic.url')}
          value={values.id}
          onChange={onChange}
          type="text"
          name="id"
          required
        />
        <DropdownMenu>
          <Stack direction="column" gap={0}>
            <Label htmlFor="flow-dropdown">{t('providers.generic.flowType')}</Label>
            <DropdownMenuTrigger id="flow-dropdown" bordered data-testid="flow-dropdown">
              <Text size="small">{flow}</Text>
              <TriangleDownIcon />
            </DropdownMenuTrigger>
          </Stack>
          <DropdownMenuPortal>
            <DropdownMenuContent
              side="bottom"
              css={{ minWidth: '100%' }}
            >
              <DropdownMenuRadioGroup onValueChange={handleValueChange}>
                <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_ONLY}>
                  <Text>
                    {t('providers.generic.readOnly')}
                  </Text>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_WRITE}>
                  <Text>
                    {t('providers.generic.readWrite')}
                  </Text>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={GenericVersionedStorageFlow.READ_WRITE_CREATE}>
                  <Text>
                    {t('providers.generic.readWriteCreate')}

                  </Text>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
        <Stack direction="column" gap={4}>
          <Heading>{t('providers.generic.additionalHeaders')}</Heading>
          {headers.map((x, i) => (
            <Box css={{ display: 'flex', alignItems: 'flex-end', gap: '1em' }}>
              <Input
                label={t('providers.generic.name')}
                value={x?.name}
                onChange={onHeaderChange}
                type="text"
                name="name"
                data-index={i}
              />
              <Input
                label={t('providers.generic.value')}
                value={x.value}
                disabled={!x.name}
                isMasked
                onChange={onHeaderChange}
                type="password"
                name="value"
                data-index={i}
              />
              <IconButton
                onClick={handleClose}
                data-index={i}
                size="small"
                variant="invisible"
                icon={<XIcon />}
              />
            </Box>
          ))}
        </Stack>
        <Stack direction="row" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>

          <Button variant="primary" type="submit" disabled={!values.id}>
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
