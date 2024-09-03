import React, { useCallback, useMemo } from 'react';
import zod from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stack,
  Text,
  Link,
  IconButton,
  Button,
  Heading,
  Select,
  TextInput,
  Label,
  FormField,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import type { StorageProviderType } from '@sync-providers/types';
import { AVAILABLE_PROVIDERS } from '@sync-providers/constants';
import { StorageTypeFormValues, GenericVersionedStorageFlow } from '@/types/StorageType';
import XIcon from '@/icons/x.svg';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<
StorageTypeFormValues<false>,
{ provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }
>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.GENERIC_VERSIONED_STORAGE }>;
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
  additionalHeaders: zod.array(
    zod.object({
      name: zod.string(),
      value: zod.string().default('storage.providers.generic.'),
    }),
  ),
  internalId: zod.string().optional(),
});

export default function GenericVersionedForm({
  onChange,
  onSubmit,
  onCancel,
  values,
  hasErrored,
  errorMessage,
}: Props) {
  const { t } = useTranslation(['storage']);
  const [isMasked, setIsMasked] = React.useState(true);

  const toggleMask = useCallback(() => {
    setIsMasked((prev) => !prev);
  }, []);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const validationResult = zodSchema.safeParse({ additionalHeaders: [], ...values });
      if (validationResult.success) {
        const formFields = {
          ...validationResult.data,
          provider: AVAILABLE_PROVIDERS.GENERIC_VERSIONED_STORAGE,
          internalId: validationResult.data.internalId || generateId(24),
        } as ValidatedFormValues;
        onSubmit(formFields);
      } else {
        // eslint-disable-next-line no-console
        console.log(validationResult, values);
      }
    },
    [values, onSubmit],
  );

  const handleValueChange = useCallback(
    (flow: string) => onChange({
      target: {
        name: 'flow',
        value: flow as GenericVersionedStorageFlow,
      },
    }),
    [onChange],
  );

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
  const headers = useMemo(
    () => [...(values.additionalHeaders || []), { name: '', value: '' }],
    [values.additionalHeaders],
  );

  const headerChange = useCallback(
    (changedHeaders: any) => {
      onChange({
        target: {
          name: 'additionalHeaders',
          value: changedHeaders,
        },
      });
    },
    [onChange],
  );
  const onHeaderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [headerChange, headers],
  );

  const handleClose = useCallback(
    (e: any) => {
      const index = Number(e.target.dataset.index);

      const removedHeaders = [...headers];
      removedHeaders.splice(index, 1);
      const newHeaders = removedHeaders.filter((x) => x.name.length);
      headerChange(newHeaders);
    },
    [headers, headerChange],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Text muted>{t('providers.generic.description')}</Text>
        <Text muted css={{ marginTop: '$2' }}>
          <Link href="https://docs.tokens.studio/sync/generic-storage?ref=addprovider" target="_blank" rel="noreferrer">
            {t('providers.generic.readMore')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="name">{t('providers.generic.name')}</Label>
          <TextInput name="name" id="name" value={values.name || ''} onChange={onChange} type="text" required />
        </FormField>
        <FormField>
          <Label htmlFor="id">{t('providers.generic.url')}</Label>
          <TextInput value={values.id || ''} onChange={onChange} type="text" name="id" id="id" required />
        </FormField>
        <FormField>
          <Label>{t('providers.generic.flowType')}</Label>
          <Select value={flow} onValueChange={handleValueChange}>
            <Select.Trigger data-testid="flow-dropdown" value={flow} />
            <Select.Content>
              <Select.Item value={GenericVersionedStorageFlow.READ_ONLY}>{t('providers.generic.readOnly')}</Select.Item>
              <Select.Item value={GenericVersionedStorageFlow.READ_WRITE}>
                {t('providers.generic.readWrite')}
              </Select.Item>
              <Select.Item value={GenericVersionedStorageFlow.READ_WRITE_CREATE}>
                {t('providers.generic.readWriteCreate')}
              </Select.Item>
            </Select.Content>
          </Select>
        </FormField>
        <Stack direction="column" gap={5}>
          <Heading size="medium">{t('providers.generic.additionalHeaders')}</Heading>
          {headers.map((x, i) => (
            <Box css={{ display: 'flex', alignItems: 'flex-end', gap: '1em' }}>
              <FormField>
                <Label htmlFor="name">{t('providers.generic.name')}</Label>
                <TextInput value={x?.name} onChange={onHeaderChange} type="text" name="name" id="name" data-index={i} />
              </FormField>
              <FormField>
                <Label htmlFor="name">{t('providers.generic.value')}</Label>
                <TextInput
                  value={x.value}
                  disabled={!x.name}
                  onChange={onHeaderChange}
                  type={isMasked ? 'password' : 'text'}
                  trailingAction={(
                    <IconButton
                      variant="invisible"
                      size="small"
                      onClick={toggleMask}
                      icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    />
                  )}
                  name="value"
                  id="value"
                  data-index={i}
                />
              </FormField>
              <IconButton onClick={handleClose} data-index={i} variant="invisible" icon={<XIcon />} />
            </Box>
          ))}
        </Stack>
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={!values.id}>
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && <ErrorMessage data-testid="provider-modal-error">{errorMessage}</ErrorMessage>}
      </Stack>
    </form>
  );
}
