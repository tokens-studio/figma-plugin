import React, { useEffect } from 'react';
import zod from 'zod';
import {
  Box,
  Button,
  FormField,
  Heading,
  IconButton,
  Label,
  Link,
  Select,
  Stack,
  Text,
  TextInput,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { create, Organization } from '@tokens-studio/sdk';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';
import TokensStudioWord from '@/icons/tokensstudio-word.svg';
import { styled } from '@/stitches.config';
import { GET_ORGS_QUERY } from '@/storage/tokensStudio/graphql';

const StyledTokensStudioWord = styled(TokensStudioWord, {
  width: '200px',
  height: '25px',
});

type ValidatedFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.TOKENS_STUDIO }>;
type Props = {
  values: Extract<StorageTypeFormValues<true>, { provider: StorageProviderType.TOKENS_STUDIO }>;
  onChange: ChangeEventHandler;
  onSubmit: (values: ValidatedFormValues) => void;
  onCancel: () => void;
  hasErrored?: boolean;
  errorMessage?: string;
};

export default function TokensStudioForm({ onChange, onSubmit, onCancel, values, hasErrored, errorMessage }: Props) {
  const { t } = useTranslation(['storage']);
  const [fetchOrgsError, setFetchOrgsError] = React.useState<string | null>(null);
  const [orgData, setOrgData] = React.useState<Organization[]>([]);
  const syncGuideUrl = 'tokens-studio';
  const [isMasked, setIsMasked] = React.useState(true);
  const [showTeaser, setShowTeaser] = React.useState(true);

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
        orgId: zod.string(),
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

  React.useEffect(() => {
    if (values.secret) {
      setShowTeaser(false);
    }
  }, [values]);

  const handleDismissTeaser = React.useCallback(() => {
    setShowTeaser(false);
  }, []);

  const fetchOrgData = React.useCallback(async () => {
    try {
      const client = create({
        host: process.env.API_HOST || 'localhost:4200',
        secure: process.env.NODE_ENV !== 'development',
        auth: `Bearer ${values.secret}`,
      });
      const result = await client.query({
        query: GET_ORGS_QUERY,
      });
      if (result.data?.organizations) {
        setOrgData(result.data.organizations.data as Organization[]);
      }
    } catch (error) {
      setFetchOrgsError('Error fetching organization data. Please check your PAT.');
    }
  }, [values.secret]);

  useEffect(() => {
    if (values.secret) {
      fetchOrgData();
    }
  }, [values.secret, fetchOrgData]);

  const orgOptions = React.useMemo(
    () =>
      orgData?.map((org) => ({
        label: org.name,
        value: org.id,
      })),
    [orgData],
  );

  const onOrgChange = React.useCallback(
    (value: string) => {
      onChange({ target: { name: 'orgId', value } });
    },
    [onChange],
  );

  const projectOptions = React.useMemo(() => {
    if (!orgData) return [];
    const selectedOrgData = orgData.find((org) => org.id === values.orgId);
    if (!selectedOrgData) return [];
    return selectedOrgData.projects.data.map((project) => ({
      label: project.name,
      value: project.id,
    }));
  }, [orgData, values.orgId]);

  const selectedOrg = orgOptions?.find((org) => org.value === values.orgId);

  const selectedProject = projectOptions?.find((project) => project.value === values.id);

  const onProjectChange = React.useCallback(
    (value: string) => {
      onChange({ target: { name: 'id', value } });
    },
    [onChange],
  );

  return showTeaser ? (
    <Stack direction="column" align="start" gap={5}>
      <StyledTokensStudioWord />
      <Stack direction="column" gap={3}>
        <Heading size="large">A dedicated design tokens management platform</Heading>
        <Box>
          We are working a dedicated design tokens management platform built on our powerful node-based graph engine
          including plug and play token transformation - suitable for enterprises! Still in early access, sign up for
          the waitlist!
        </Box>
        <Link href="https://tokens.studio/studio" target="_blank" rel="noreferrer">
          Learn more
        </Link>
      </Stack>
      <Button onClick={handleDismissTeaser}>Already got access?</Button>
    </Stack>
  ) : (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Text muted>
          {t('providers.tokensstudio.descriptionFirstPart')}{' '}
          <Link
            href="https://q2gsw2tok1e.typeform.com/to/pJCwLVh2?typeform-source=tokens.studio"
            target="_blank"
            rel="noreferrer"
          >
            {t('providers.tokensstudio.signupText')}
          </Link>
        </Text>
        <Text muted css={{ marginTop: '$2' }}>
          {t('providers.tokensstudio.descriptionSecondPart')}
          <Link
            href={`https://docs.tokens.studio/sync/${syncGuideUrl}?ref=addprovider`}
            target="_blank"
            rel="noreferrer"
          >
            {t('providers.tokensstudio.tokensStudioSyncGuide')}
          </Link>
        </Text>
        <FormField>
          <Label htmlFor="name">{t('providers.tokensstudio.name')}</Label>
          <TextInput name="name" id="name" value={values.name || ''} onChange={onChange} type="text" required />
          <Text muted>{t('nameHelpText')}</Text>
        </FormField>
        <FormField>
          <Label htmlFor="secret">{t('providers.tokensstudio.pat')}</Label>
          <TextInput
            value={values.secret || ''}
            onChange={onChange}
            name="secret"
            id="secret"
            onBlur={fetchOrgData}
            required
            type={isMasked ? 'password' : 'text'}
            trailingAction={
              <IconButton
                variant="invisible"
                size="small"
                onClick={toggleMask}
                icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
              />
            }
          />
          {fetchOrgsError && <Text muted>{fetchOrgsError}</Text>}
        </FormField>
        {orgOptions?.length > 0 && (
          <Stack direction="column" gap={2}>
            <Label htmlFor="org">{t('providers.tokensstudio.selectOrgLabel')}</Label>
            <div>
              <Select value={values.orgId ?? ''} onValueChange={onOrgChange} name="org">
                <Select.Trigger value={selectedOrg?.label || 'Choose an organization'} />
                <Select.Content>
                  {orgOptions?.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Stack>
        )}

        {projectOptions?.length > 0 && (
          <Stack direction="column" gap={2}>
            <Label htmlFor="org">{t('providers.tokensstudio.selectProjectLabel')}</Label>
            <div>
              <Select value={values.id ?? ''} onValueChange={onProjectChange} name="id">
                <Select.Trigger value={selectedProject?.label || 'Choose a project'} />
                <Select.Content>
                  {projectOptions?.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Stack>
        )}
        <Stack direction="row" justify="end" gap={4}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={!values.secret && !values.name}>
            {t('save')}
          </Button>
        </Stack>
        {hasErrored && <ErrorMessage data-testid="provider-modal-error">{errorMessage}</ErrorMessage>}
      </Stack>
    </form>
  );
}
