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
  ignoreFirstPartForStylesSelector, prefixStylesWithThemeNameSelector, uiStateSelector,
} from '@/selectors';
import Stack from '../Stack';
import Box from '../Box';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import OnboardingExplainer from '../OnboardingExplainer';
import RemConfiguration from '../RemConfiguration';

function Settings() {
  const onboardingData = {
    title: 'Set up where tokens should be stored',
    text: 'Connect your tokens to an external source of truth that you can push and pull to. This allows you to use tokens across files.',
    url: 'https://docs.figmatokens.com/sync/sync?ref=onboarding_explainer_syncproviders',
  };

  const ignoreFirstPartForStyles = useSelector(ignoreFirstPartForStylesSelector);
  const prefixStylesWithThemeName = useSelector(prefixStylesWithThemeNameSelector);
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
        <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
          <Heading size="small">Settings</Heading>
          <Stack direction="row" gap={3} align="start">
            <Checkbox
              id="ignoreFirstPartForStyles"
              checked={!!ignoreFirstPartForStyles}
              defaultChecked={ignoreFirstPartForStyles}
              onCheckedChange={handleIgnoreChange}
            />
            <Label htmlFor="ignoreFirstPartForStyles">
              <Stack direction="column" gap={2}>
                <Box css={{ fontWeight: '$bold' }}>Ignore first part of token name for styles</Box>
                <Box css={{ color: '$textMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>
                  Useful if you want to ignore
                  {' '}
                  <code>colors</code>
                  {' '}
                  in a token called
                  {' '}
                  <code>colors.blue.500</code>
                  {' '}
                  for your styles
                </Box>
              </Stack>
            </Label>
          </Stack>
          <Stack direction="row" gap={3} align="start">
            <Checkbox
              id="prefixStylesWithThemeName"
              checked={!!prefixStylesWithThemeName}
              defaultChecked={prefixStylesWithThemeName}
              onCheckedChange={handlePrefixWithThemeNameChange}
            />

            <Label htmlFor="prefixStylesWithThemeName">
              <Stack direction="column" gap={2}>
                <Box css={{ fontWeight: '$bold' }}>Prefix styles with active theme name</Box>
                <Box css={{ color: '$textMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>Adds the active theme name to any styles created. Note: Using this with multi-dimensional themes will lead to unexpected results.</Box>
              </Stack>
            </Label>
          </Stack>
          <Heading size="small">Base font size token</Heading>
          <Box css={{ color: '$textMuted', fontSize: '$xsmall', lineHeight: 1.5 }}>Lets you configure the value 1rem represents. You can also set this to a token, to have it change between sets.</Box>
          <RemConfiguration />
          <Box>
            <Button variant="secondary" size="small" id="reset-onboarding" onClick={handleResetButton}>Reset onboarding</Button>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
