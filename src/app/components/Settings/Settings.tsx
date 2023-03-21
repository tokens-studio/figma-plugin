/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { track } from '@/utils/analytics';
import SyncSettings from '../SyncSettings';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Heading from '../Heading';
import { Dispatch } from '../../store';
import Label from '../Label';
import {
  ignoreFirstPartForStylesSelector, prefixStylesWithThemeNameSelector, jsonIndentationSelector, uiStateSelector,
} from '@/selectors';
import Stack from '../Stack';
import Box from '../Box';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import OnboardingExplainer from '../OnboardingExplainer';
import RemConfiguration from '../RemConfiguration';
import Text from '../Text';
import Select from '../Select';
import { JSONIndentationSettings } from '@/types';

function Settings() {
  const onboardingData = {
    title: 'Set up where tokens should be stored',
    text: 'Connect your tokens to an external source of truth that you can push and pull to. This allows you to use tokens across files.',
    url: 'https://docs.figmatokens.com/sync/sync?ref=onboarding_explainer_syncproviders',
  };

  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
  const jsonIndentation = useSelector(jsonIndentationSelector);
  const uiState = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();

  const handleIgnoreChange = React.useCallback(
    (state: CheckedState) => {
      track('setIgnoreFirstPartForStyles', { value: state });
      dispatch.settings.setIgnoreFirstPartForStyles(!!state);
    },
    [dispatch.settings],
  );

  const handlePrefixWithThemeNameChange = React.useCallback(
    (state: CheckedState) => {
      track('setPrefixStylesWithThemeName', { value: state });

      dispatch.settings.setPrefixStylesWithThemeName(!!state);
    },
    [dispatch.settings],
  );

  const handleJsonIndentationChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      track('setJsonIndentation', { value: e.target.value });
      dispatch.settings.setJSONIndentation(e.target.value as JSONIndentationSettings);
    },
    [dispatch.settings],
  );

  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSyncProviders(false);
  }, [dispatch]);

  const handleResetButton = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSets(true);
    dispatch.uiState.setOnboardingExplainerInspect(true);
    dispatch.uiState.setOnboardingExplainerSyncProviders(true);
    dispatch.uiState.setLastOpened(0);
  }, [dispatch]);

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
        <Stack direction="column" gap={5} css={{ padding: '0 $4' }}>
          <Stack direction="column" gap={4}>
            <Heading size="medium">Styles</Heading>
            <Stack direction="row" gap={3}>
              <Checkbox
                id="ignoreFirstPartForStyles"
                checked={!!ignoreFirstPartForStyles}
                defaultChecked={ignoreFirstPartForStyles}
                onCheckedChange={handleIgnoreChange}
              />
              <Label htmlFor="ignoreFirstPartForStyles" css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
                <Text bold size="small">Ignore first part of token name for styles</Text>
                <Text muted size="small">This will ignore the first part of the token name when generating styles, e.g. the `colors` in a token called `colors.blue.500`.</Text>
              </Label>
            </Stack>
            <Stack direction="row" gap={3}>
              <Checkbox
                id="prefixStylesWithThemeName"
                checked={!!prefixStylesWithThemeName}
                defaultChecked={prefixStylesWithThemeName}
                onCheckedChange={handlePrefixWithThemeNameChange}
              />
              <Label htmlFor="prefixStylesWithThemeName" css={{ display: 'flex', flexDirection: 'column', gap: '$2' }}>
                <Text bold size="small">Prefix styles with active theme name</Text>
                <Text muted size="small">This will prefix all styles with the active theme name.</Text>
              </Label>
            </Stack>
          </Stack>
          <Stack direction="column" gap={2}>
            <Heading size="medium">Base font size token (rem)</Heading>
            <Text muted size="small">This is the base font size used to calculate rem values. You can change this to a token to enable dynamic theming, or keep to a value (default 16px)</Text>
            <RemConfiguration />
          </Stack>
          <Stack direction="column" gap={2}>
            <Heading size="medium">JSON indendation</Heading>
            <Text muted size="small">This is the number of spaces used to indent the JSON output. Or tabs if you prefer that.</Text>
            <Select
              id="jsonIndentation"
              value={jsonIndentation}
              onChange={handleJsonIndentationChange}
            >
              <option value={JSONIndentationSettings.TwoSpaces}>2 spaces</option>
              <option value={JSONIndentationSettings.FourSpaces}>4 spaces</option>
              <option value={JSONIndentationSettings.Tab}>Tab</option>
            </Select>
          </Stack>
          <Stack direction="column" gap={3}>
            <Heading size="medium">Onboarding</Heading>
            <Text muted size="small">Need to run through the onboarding hints again?</Text>
            <Box>
              <Button variant="secondary" size="small" id="reset-onboarding" onClick={handleResetButton}>Reset onboarding</Button>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
