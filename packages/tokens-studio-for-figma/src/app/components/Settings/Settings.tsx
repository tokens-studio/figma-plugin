/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Link, Text, Button, Heading, Label, Stack, Switch,
} from '@tokens-studio/ui';
import { track } from '@/utils/analytics';
import SyncSettings from '../SyncSettings';
import { LanguageSelector } from '../LanguageSelector';
import { Dispatch } from '../../store';
import {
  storeTokenIdInJsonEditorSelector,
  uiStateSelector,
  settingsStateSelector,
  inspectDeepSelector,
  autoApplyThemeOnDropSelector,
  variablesColorSelector,
  variablesNumberSelector,
  variablesBooleanSelector,
  variablesStringSelector,
  stylesColorSelector,
  stylesTypographySelector,
  stylesEffectSelector,
  ignoreFirstPartForStylesSelector,
  prefixStylesWithThemeNameSelector,
  createStylesWithVariableReferencesSelector,
  renameExistingStylesAndVariablesSelector,
  removeStylesAndVariablesWithoutConnectionSelector,
  localApiStateSelector,
} from '@/selectors';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import OnboardingExplainer from '../OnboardingExplainer';
import RemConfiguration from '../RemConfiguration';
import { replay } from '@/app/sentry';
import { sessionRecordingSelector } from '@/selectors/sessionRecordingSelector';
import { useFlags } from '../LaunchDarkly';
import { ExplainerModal } from '../ExplainerModal';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { isEqual } from '@/utils/isEqual';

// TODO: expose types from @tokens-studio/ui/checkbox
type CheckedState = boolean | 'indeterminate';

function Settings() {
  const { t } = useTranslation(['settings', 'tokens', 'manageStylesAndVariables']);

  const onboardingData = {
    title: t('whereTokensStored'),
    text: t('whereTokensStoredOnboarding'),
    url: 'https://docs.tokens.studio/token-storage/remote?ref=onboarding_explainer_syncproviders',
  };

  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const uiState = useSelector(uiStateSelector);
  const settingsState = useSelector(settingsStateSelector, isEqual);
  const localApiState = useSelector(localApiStateSelector);
  const dispatch = useDispatch<Dispatch>();
  const debugMode = useSelector(sessionRecordingSelector);
  const [debugSession, setDebugSession] = useState('');
  const { idStorage } = useFlags();

  // Get all settings selectors
  const inspectDeep = useSelector(inspectDeepSelector);
  const autoApplyThemeOnDrop = useSelector(autoApplyThemeOnDropSelector);
  const variablesColor = useSelector(variablesColorSelector);
  const variablesNumber = useSelector(variablesNumberSelector);
  const variablesBoolean = useSelector(variablesBooleanSelector);
  const variablesString = useSelector(variablesStringSelector);
  const stylesColor = useSelector(stylesColorSelector);
  const stylesTypography = useSelector(stylesTypographySelector);
  const stylesEffect = useSelector(stylesEffectSelector);
  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
  const createStylesWithVariableReferences = useSelector(createStylesWithVariableReferencesSelector);
  const renameExistingStylesAndVariables = useSelector(renameExistingStylesAndVariablesSelector);
  const removeStylesAndVariablesWithoutConnection = useSelector(removeStylesAndVariablesWithoutConnectionSelector);

  const toggleDebugMode = React.useCallback(async (checked: CheckedState) => {
    if (checked && process.env.ENVIRONMENT === 'development') {
      console.warn('Session recording is disabled in development mode');
    }

    dispatch.settings.setSessionRecording(!!checked);
    if (checked) {
      // Display the info to the user
      try {
        let id = await replay.getReplayId();
        if (!id) {
          // Force start the replay functionality
          replay.start();
          id = await replay.getReplayId();
        }
        setDebugSession(id || '');
      } catch (err) {
        console.warn('Replay is likely in progress already', err);
      }
    } else {
      try {
        replay.stop();
      } catch (err) {
        console.warn('Replay is likely stopped already', err);
      }
    }
  }, []);

  // Load once on mount.
  useEffect(() => {
    async function getSessionId() {
      try {
        const id = replay.getReplayId();
        setDebugSession(id || '');
      } catch (err) {
        // Silently fail
      }
    }
    getSessionId();
  });

  const handleStoreTokenIdInJsonEditorChange = React.useCallback(
    (state: CheckedState) => {
      track('setStoreTokenIdInJsonEditorSelector', { value: state });
      dispatch.settings.setStoreTokenIdInJsonEditorSelector(!!state);
    },
    [dispatch.settings],
  );

  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSyncProviders(false);
  }, [dispatch]);

  const handleResetButton = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSets(true);
    dispatch.uiState.setOnboardingExplainerExportSets(true);
    dispatch.uiState.setOnboardingExplainerInspect(true);
    dispatch.uiState.setOnboardingExplainerSyncProviders(true);
    dispatch.uiState.setLastOpened(0);
  }, [dispatch]);

  // Token Application Settings handlers
  const handleUpdateOnChange = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setUpdateOnChange(!!checked);
  }, [dispatch.settings]);

  const handleUpdateRemote = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setUpdateRemote(!!checked);
  }, [dispatch.settings]);

  const handleShouldSwapStyles = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setShouldSwapStyles(!!checked);
  }, [dispatch.settings]);

  const handleShouldUpdateStyles = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setShouldUpdateStyles(!!checked);
  }, [dispatch.settings]);

  const handleAutoApplyThemeOnDrop = React.useCallback((checked: CheckedState) => {
    track('autoApplyThemeOnDrop', { value: checked });
    dispatch.settings.setAutoApplyThemeOnDrop(!!checked);
  }, [dispatch.settings]);

  const handleInspectDeep = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setInspectDeep(!!checked);
  }, [dispatch.settings]);

  // Export Variables handlers
  const handleVariablesColor = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setVariablesColor(!!checked);
    if (checked) dispatch.settings.setStylesColor(!checked);
  }, [dispatch.settings]);

  const handleVariablesNumber = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setVariablesNumber(!!checked);
  }, [dispatch.settings]);

  const handleVariablesBoolean = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setVariablesBoolean(!!checked);
  }, [dispatch.settings]);

  const handleVariablesString = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setVariablesString(!!checked);
  }, [dispatch.settings]);

  // Export Styles handlers
  const handleStylesColor = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setStylesColor(!!checked);
    if (checked) dispatch.settings.setVariablesColor(!checked);
  }, [dispatch.settings]);

  const handleStylesTypography = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setStylesTypography(!!checked);
  }, [dispatch.settings]);

  const handleStylesEffect = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setStylesEffect(!!checked);
  }, [dispatch.settings]);

  // Export Rules handlers
  const handleIgnoreFirstPartForStyles = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setIgnoreFirstPartForStyles(!!checked);
  }, [dispatch.settings]);

  const handlePrefixStylesWithThemeName = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setPrefixStylesWithThemeName(!!checked);
  }, [dispatch.settings]);

  const handleCreateStylesWithVariableReferences = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setCreateStylesWithVariableReferences(!!checked);
  }, [dispatch.settings]);

  const handleRenameExistingStylesAndVariables = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setRenameExistingStylesAndVariables(!!checked);
  }, [dispatch.settings]);

  const handleRemoveStylesAndVariablesWithoutConnection = React.useCallback((checked: CheckedState) => {
    dispatch.settings.setRemoveStylesAndVariablesWithoutConnection(!!checked);
  }, [dispatch.settings]);

  return (
    <Box className="content scroll-container">
      <Stack direction="column" gap={4} css={{ padding: '$3 0' }}>
        <AddLicenseKey />
        <Divider />
        {uiState.onboardingExplainerSyncProviders && (
          <Stack direction="column" gap={2} css={{ padding: '$4' }}>
            <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
          </Stack>
        )}
        <SyncSettings />
        <Divider />
        <Stack direction="column" align="start" gap={4} css={{ padding: '0 $4' }}>
          <Heading size="medium">{t('settings')}</Heading>
          <Stack
            direction="column"
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <LanguageSelector />
          </Stack>
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >

            {idStorage && (
              <Stack direction="row" gap={3} align="center" css={{ width: '100%' }}>
                <Label htmlFor="storeTokenIdInJsonEditor">{t('storeTokenId')}</Label>
                <Switch
                  id="storeTokenIdInJsonEditor"
                  checked={!!storeTokenIdInJsonEditor}
                  defaultChecked={storeTokenIdInJsonEditor}
                  onCheckedChange={handleStoreTokenIdInJsonEditorChange}
                />
              </Stack>
            )}
            <RemConfiguration />
          </Stack>

          {/* Token Application Settings */}
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Heading size="small">{t('Token Application Settings', 'Token Application Settings')}</Heading>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="updateOnChange">{t('tokens:update.onChange.title')}</Label>
              <Switch
                id="updateOnChange"
                checked={!!settingsState.updateOnChange}
                defaultChecked={settingsState.updateOnChange}
                onCheckedChange={handleUpdateOnChange}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('tokens:update.onChange.description')}
            </Text>

            {localApiState?.provider === StorageProviderType.JSONBIN && (
              <>
                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="updateRemote">{t('tokens:update.remoteJSONBin.title')}</Label>
                  <Switch
                    id="updateRemote"
                    checked={!!settingsState.updateRemote}
                    defaultChecked={settingsState.updateRemote}
                    onCheckedChange={handleUpdateRemote}
                  />
                </Stack>
                <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
                  {t('tokens:update.remoteJSONBin.description')}
                </Text>
              </>
            )}

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="shouldSwapStyles">{t('tokens:update.swapStyles.title')}</Label>
              <Switch
                id="shouldSwapStyles"
                checked={!!settingsState.shouldSwapStyles}
                defaultChecked={settingsState.shouldSwapStyles}
                onCheckedChange={handleShouldSwapStyles}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('tokens:update.swapStyles.description')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="shouldUpdateStyles">{t('tokens:update.shouldUpdateStyles.title')}</Label>
              <Switch
                id="shouldUpdateStyles"
                checked={!!settingsState.shouldUpdateStyles}
                defaultChecked={settingsState.shouldUpdateStyles}
                onCheckedChange={handleShouldUpdateStyles}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('tokens:update.shouldUpdateStyles.description')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="autoApplyThemeOnDrop">{t('tokens:update.autoApplyThemeOnDrop.title')}</Label>
              <Switch
                id="autoApplyThemeOnDrop"
                checked={!!autoApplyThemeOnDrop}
                defaultChecked={autoApplyThemeOnDrop}
                onCheckedChange={handleAutoApplyThemeOnDrop}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('tokens:update.autoApplyThemeOnDrop.description')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="inspectDeep">Inspect deep</Label>
              <Switch
                id="inspectDeep"
                checked={!!inspectDeep}
                defaultChecked={inspectDeep}
                onCheckedChange={handleInspectDeep}
              />
            </Stack>
          </Stack>

          {/* Export Options */}
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Heading size="small">{t('manageStylesAndVariables:options.createAndUpdate')}</Heading>

            <Box css={{
              width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '$5',
            }}
            >
              <Stack direction="column" gap={3}>
                <Text css={{ fontWeight: '$sansMedium' }}>{t('manageStylesAndVariables:generic.variables')}</Text>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="variablesColor">{t('manageStylesAndVariables:variables.color')}</Label>
                  <Switch
                    id="variablesColor"
                    checked={!!variablesColor}
                    defaultChecked={variablesColor}
                    onCheckedChange={handleVariablesColor}
                  />
                </Stack>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="variablesString">{t('manageStylesAndVariables:variables.string')}</Label>
                  <Switch
                    id="variablesString"
                    checked={!!variablesString}
                    defaultChecked={variablesString}
                    onCheckedChange={handleVariablesString}
                  />
                </Stack>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="variablesNumber">{t('manageStylesAndVariables:variables.number')}</Label>
                  <Switch
                    id="variablesNumber"
                    checked={!!variablesNumber}
                    defaultChecked={variablesNumber}
                    onCheckedChange={handleVariablesNumber}
                  />
                </Stack>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="variablesBoolean">{t('manageStylesAndVariables:variables.boolean')}</Label>
                  <Switch
                    id="variablesBoolean"
                    checked={!!variablesBoolean}
                    defaultChecked={variablesBoolean}
                    onCheckedChange={handleVariablesBoolean}
                  />
                </Stack>
              </Stack>

              <Stack direction="column" gap={3}>
                <Text css={{ fontWeight: '$sansMedium' }}>{t('manageStylesAndVariables:generic.styles')}</Text>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="stylesColor">{t('manageStylesAndVariables:styles.color')}</Label>
                  <Switch
                    id="stylesColor"
                    checked={!!stylesColor}
                    defaultChecked={stylesColor}
                    onCheckedChange={handleStylesColor}
                  />
                </Stack>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="stylesTypography">{t('manageStylesAndVariables:styles.typography')}</Label>
                  <Switch
                    id="stylesTypography"
                    checked={!!stylesTypography}
                    defaultChecked={stylesTypography}
                    onCheckedChange={handleStylesTypography}
                  />
                </Stack>

                <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
                  <Label htmlFor="stylesEffect">{t('manageStylesAndVariables:styles.effects')}</Label>
                  <Switch
                    id="stylesEffect"
                    checked={!!stylesEffect}
                    defaultChecked={stylesEffect}
                    onCheckedChange={handleStylesEffect}
                  />
                </Stack>
              </Stack>
            </Box>
          </Stack>

          {/* Export Rules */}
          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Heading size="small">{t('manageStylesAndVariables:options.tokensExportedToFigmaShould')}</Heading>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="ignoreFirstPartForStyles">{t('manageStylesAndVariables:options.ignorePrefix')}</Label>
              <Switch
                id="ignoreFirstPartForStyles"
                checked={!!ignoreFirstPartForStyles}
                defaultChecked={ignoreFirstPartForStyles}
                onCheckedChange={handleIgnoreFirstPartForStyles}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('manageStylesAndVariables:options.ignorePrefixExplanation')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="prefixStylesWithThemeName">{t('manageStylesAndVariables:options.prefixStyles')}</Label>
              <Switch
                id="prefixStylesWithThemeName"
                checked={!!prefixStylesWithThemeName}
                defaultChecked={prefixStylesWithThemeName}
                onCheckedChange={handlePrefixStylesWithThemeName}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('manageStylesAndVariables:options.prefixStylesExplanation')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="createStylesWithVariableReferences">{t('manageStylesAndVariables:options.createStylesWithVariableReferences')}</Label>
              <Switch
                id="createStylesWithVariableReferences"
                checked={!!createStylesWithVariableReferences}
                defaultChecked={createStylesWithVariableReferences}
                onCheckedChange={handleCreateStylesWithVariableReferences}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('manageStylesAndVariables:options.createStylesWithVariableReferencesExplanation')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="renameExistingStylesAndVariables">{t('manageStylesAndVariables:options.renameExisting')}</Label>
              <Switch
                id="renameExistingStylesAndVariables"
                checked={!!renameExistingStylesAndVariables}
                defaultChecked={renameExistingStylesAndVariables}
                onCheckedChange={handleRenameExistingStylesAndVariables}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('manageStylesAndVariables:options.renameExistingExplanation')}
            </Text>

            <Stack direction="row" gap={3} align="center" justify="between" css={{ width: '100%' }}>
              <Label htmlFor="removeStylesAndVariablesWithoutConnection">{t('manageStylesAndVariables:options.removeWithoutConnection')}</Label>
              <Switch
                id="removeStylesAndVariablesWithoutConnection"
                checked={!!removeStylesAndVariablesWithoutConnection}
                defaultChecked={removeStylesAndVariablesWithoutConnection}
                onCheckedChange={handleRemoveStylesAndVariablesWithoutConnection}
              />
            </Stack>
            <Text css={{ color: '$fgMuted', fontSize: '$xsmall' }}>
              {t('manageStylesAndVariables:options.removeWithoutConnectionExplanation')}
            </Text>
          </Stack>

          <Stack
            direction="column"
            gap={4}
            css={{
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              padding: '$4',
              width: '100%',
            }}
          >
            <Stack direction="column" gap={2} css={{ width: '100%' }}>
              <Stack direction="row" align="center" justify="between" gap={1}>
                <Stack direction="row" gap={2} align="center">
                  <Label htmlFor="enableDebugging">{t('enableSessionRecording')}</Label>
                  <ExplainerModal title={t('enableSessionRecording')}>
                    <Box css={{
                      color: '$fgMuted',
                      fontSize: '$xsmall',
                    }}
                    >
                      {t('sessionRecordingDescription')}
                      {' '}
                      {t('dataCollectedIsAnonymised')}
                      {' '}
                      {t('forMoreInformationPleaseSeeOur')}
                      {' '}
                      <Link href="https://tokens.studio/privacy" target="_blank" rel="noreferrer">{t('privacyPolicy')}</Link>
                    </Box>
                  </ExplainerModal>
                </Stack>
                <Box css={{ flexShrink: 0 }}>
                  <Switch
                    id="enableDebugging"
                    checked={!!debugMode}
                    defaultChecked={debugMode}
                    onCheckedChange={toggleDebugMode}
                  />
                </Box>
              </Stack>
              <Box
                css={{
                  color: '$fgMuted',
                  fontSize: '$xsmall',
                  lineHeight: 1.5,
                }}
              >
                {debugSession && (
                <Text>
                  {t('yourCurrentSessionIdIs')}
                  {' '}
                  <b>{debugSession}</b>
                </Text>
                )}
              </Box>
            </Stack>
            <Stack direction="row" justify="between" gap={2} align="center" css={{ width: '100%' }}>
              <Label>{t('resetOnboarding')}</Label>
              <Button variant="secondary" data-testid="reset-onboarding" onClick={handleResetButton}>
                {t('resetOnboarding')}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
