import React from 'react';
import zod from 'zod';
import {
  Box,
  Button,
  FormField,
  IconButton,
  Label,
  Stack,
  TextInput,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.WEB_SOCKET }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.WEB_SOCKET }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function WebSocketForm({
  onChange, onSubmit, onCancel, values, hasErrored, errorMessage,
}: Props) {
  const { t } = useTranslation(['storage']);
  const [isMasked, setIsMasked] = React.useState(true);

  const toggleMask = React.useCallback(() => {
    setIsMasked((prev) => !prev);
  }, []);

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
    <Box>
      <h1>Web socket</h1>
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={5}>
          <FormField>
            <Label htmlFor="name">{t('providers.websocket.name')}</Label>
            <TextInput name="name" id="name" value={values.name || ''} onChange={onChange} type="text" required />
          </FormField>
          <FormField>
            <Label htmlFor="id">{t('providers.websocket.address')}</Label>
            <TextInput
              value={values.id || ''}
              onChange={onChange}
              type="text"
              name="id"
              id="id"
              required
            />
          </FormField>
          <FormField>
            <Label htmlFor="secret">{t('providers.websocket.secret')}</Label>
            <TextInput
              value={values.secret || ''}
              onChange={onChange}
              name="secret"
              id="secret"
              required
              type={isMasked ? 'password' : 'text'}
              trailingAction={
                <IconButton variant="invisible" size="small" onClick={toggleMask} icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />} />
              }
            />
          </FormField>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
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
    </Box>
  );
}
