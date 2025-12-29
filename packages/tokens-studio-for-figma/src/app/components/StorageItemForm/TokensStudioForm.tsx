import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'use-debounce';
import zod from 'zod';
import {
  Button,
  FormField,
  IconButton,
  Label,
  Link,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Heading,
  Box,
} from '@tokens-studio/ui';
import { EyeClosedIcon, EyeOpenIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { create, Organization } from '@tokens-studio/sdk';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageTypeFormValues } from '@/types/StorageType';
import { generateId } from '@/utils/generateId';
import { ChangeEventHandler } from './types';
import { ErrorMessage } from '../ErrorMessage';
import { GET_ORGS_QUERY } from '@/storage/tokensStudio/graphql';
import { Dispatch } from '@/app/store';
import { StudioConfigurationService } from '@/storage/tokensStudio/StudioConfigurationService';
import { shouldUseSecureConnection } from '@/utils/shouldUseSecureConnection';
import { isJWTError, getErrorMessage } from '@/utils/jwtErrorUtils';
import { track } from '@/utils/analytics';

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
  const { t } = useTranslation(['storage']);
  const [fetchOrgsError, setFetchOrgsError] = React.useState<string | null>(null);
  const [baseUrlError, setBaseUrlError] = React.useState<string | null>(null);
  const [orgData, setOrgData] = React.useState<Organization[]>([]);
  const [isMasked, setIsMasked] = React.useState(true);
  const [isValidatingBaseUrl, setIsValidatingBaseUrl] = React.useState(false);
  const dispatch = useDispatch<Dispatch>();

  const [debouncedSecret] = useDebounce(values.secret, 500);

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
        baseUrl: zod.string().optional(),
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

  const handleStartTrial = React.useCallback(() => {
    track('Start Free Trial Clicked', {
      source: 'tokens-studio-form',
    });
    window.open('https://app.prod.tokens.studio', '_blank');
  }, []);

  const validateBaseUrl = React.useCallback(async (baseUrl: string) => {
    if (!baseUrl.trim()) {
      setBaseUrlError(null);
      return;
    }

    setIsValidatingBaseUrl(true);
    setBaseUrlError(null);

    try {
      const configService = StudioConfigurationService.getInstance();
      const validation = await configService.validateBaseUrl(baseUrl);

      if (!validation.valid) {
        setBaseUrlError(validation.error || 'Invalid base URL');
      }
    } catch (error) {
      setBaseUrlError('Failed to validate base URL');
    } finally {
      setIsValidatingBaseUrl(false);
    }
  }, []);

  const fetchOrgData = React.useCallback(async () => {
    try {
      setFetchOrgsError(null);

      const configService = StudioConfigurationService.getInstance();
      const host = await configService.getGraphQLHost(values.baseUrl);

      const client = create({
        host,
        secure: shouldUseSecureConnection(values.baseUrl, host),
        auth: `Bearer ${values.secret}`,
      });
      const result = await client.query({
        query: GET_ORGS_QUERY,
      });
      if (result.data?.organizations && values.secret) {
        setOrgData(result.data.organizations.data as Organization[]);
        dispatch.userState.setTokensStudioPAT(values.secret);
      }
    } catch (error) {
      // Check if it's a JWT/authentication error
      const errorMsg = getErrorMessage(error);

      if (isJWTError(errorMsg)) {
        dispatch.userState.setTokensStudioPAT(null);
        setFetchOrgsError('Authentication token expired. Please re-enter your Tokens Studio API key.');
      } else {
        setFetchOrgsError('Error fetching organization data. Please check your Studio API key and base URL.');
      }
    }
  }, [values.secret, values.baseUrl, dispatch]);

  useEffect(() => {
    if (debouncedSecret) {
      fetchOrgData();
    }
  }, [debouncedSecret, fetchOrgData]);

  const orgOptions = React.useMemo(() => {
    const opts = (orgData ?? []).map((org) => ({
      label: org.name,
      value: org.id,
    }));
    return opts.sort((a, b) => (a.label ?? '').trim().localeCompare((b.label ?? '').trim(), undefined, { sensitivity: 'base' }));
  }, [orgData]);

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
    const sortedProjects = [...(selectedOrgData.projects?.data ?? [])].sort((a, b) => (a.name ?? '').trim().localeCompare((b.name ?? '').trim(), undefined, { sensitivity: 'base' }));
    return sortedProjects.map((project) => ({
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

  const handleBaseUrlBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      validateBaseUrl(e.target.value);
    },
    [validateBaseUrl],
  );

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="column" gap={5}>
        <Stack direction="column" align="start" gap={4}>
          <Heading size="large">{t('tokensStudioForm.heading')}</Heading>
          <Box>
            {t('tokensStudioForm.description')}
            <br />
            <br />
            {t('tokensStudioForm.description2')}
            <br />
            <Link
              href="https://tokens.studio/studio"
              target="_blank"
              rel="noreferrer"
            >
              {t('tokensStudioForm.learnMore')}
            </Link>
            {' '}
            or check out our
            {' '}
            <Link
              href="https://documentation.tokens.studio/guides/migrating-from-tokens-studio-for-figma-plugin-to-the-tokens-studio-platform"
              target="_blank"
              rel="noreferrer"
            >
              {t('tokensStudioForm.migrationGuide')}
            </Link>
            .
          </Box>
          <Stack direction="row" gap={3}>
            <Button variant="primary" onClick={handleStartTrial}>{t('tokensStudioForm.startFreeTrial')}</Button>
          </Stack>
        </Stack>
        <FormField>
          <Stack direction="row" align="center" gap={2}>
            <Label htmlFor="name">{t('providers.tokensstudio.name')}</Label>
            <Tooltip label={t('nameHelpText')}>
              <QuestionMarkCircledIcon style={{ width: '16px', height: '16px', color: 'var(--color-fg-muted)' }} />
            </Tooltip>
          </Stack>
          <TextInput name="name" id="name" value={values.name || ''} onChange={onChange} type="text" required />
        </FormField>
        <FormField>
          <Stack direction="row" align="center" gap={2}>
            <Label htmlFor="baseUrl">{t('tokensStudioForm.studioBaseUrl')}</Label>
            <Tooltip label={t('tokensStudioForm.baseUrlTooltip')}>
              <QuestionMarkCircledIcon style={{ width: '16px', height: '16px', color: 'var(--color-fg-muted)' }} />
            </Tooltip>
          </Stack>
          <TextInput
            name="baseUrl"
            id="baseUrl"
            value={values.baseUrl || ''}
            onChange={onChange}
            onBlur={handleBaseUrlBlur}
            type="text"
            placeholder="https://app.prod.tokens.studio"
          />
          {baseUrlError && <Text css={{ color: '$dangerFg' }}>{baseUrlError}</Text>}
          {isValidatingBaseUrl && <Text muted>{t('tokensStudioForm.validatingBaseUrl')}</Text>}
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
            trailingAction={(
              <IconButton
                variant="invisible"
                size="small"
                onClick={toggleMask}
                icon={isMasked ? <EyeClosedIcon /> : <EyeOpenIcon />}
              />
            )}
          />
          {fetchOrgsError && <Text muted>{fetchOrgsError}</Text>}
        </FormField>
        {orgOptions?.length > 0 && (
          <Stack direction="column" gap={2}>
            <Label htmlFor="org">{t('providers.tokensstudio.selectOrgLabel')}</Label>
            <div>
              <Select value={values.orgId ?? ''} onValueChange={onOrgChange} name="org">
                <Select.Trigger value={selectedOrg?.label || t('tokensStudioForm.chooseOrganization')} />
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
                <Select.Trigger value={selectedProject?.label || t('tokensStudioForm.chooseProject')} />
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
