/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { InfoCircledIcon, Cross1Icon } from '@radix-ui/react-icons';
import SyncSettings from '../SyncSettings';
import Checkbox from '../Checkbox';
import Heading from '../Heading';
import { Dispatch } from '../../store';
import Label from '../Label';
import { ignoreFirstPartForStylesSelector, prefixStylesWithThemeNameSelector, uiStateSelector } from '@/selectors';
import Stack from '../Stack';
import Box from '../Box';
import AddLicenseKey from '../AddLicenseKey/AddLicenseKey';
import { Divider } from '../Divider';
import { track } from '@/utils/analytics';
import IconButton from '../IconButton';

function Settings() {
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

  const closeOnboarding = React.useCallback(async () => {
    dispatch.uiState.setOnboardingExplainerSyncProviders('false');
  }, [dispatch]);

  return (
    <Box className="content scroll-container">
      <Stack direction="column" gap={4} css={{ padding: '$3 0' }}>
        <AddLicenseKey />
        <Divider />
        {uiState.onboardingExplainerSyncProviders === 'true' && (
          <Stack direction="column" gap={2} css={{ padding: '$4' }}>
            <Box css={{
              display: 'flex', flexDirection: 'column', gap: '$2', padding: '$4', border: '1px solid $borderMuted', borderTop: '1px solid $borderMuted',
            }}
            >
              <Stack direction="row" gap={2} justify="between">
                <Stack direction="row" justify="between" gap={2} align="center">
                  <InfoCircledIcon className="text-primary-500" />
                  <Heading size="medium">Set up where tokens should be stored</Heading>
                </Stack>
                <IconButton data-testid="onboardingCloseButton" onClick={closeOnboarding} icon={<Cross1Icon />} />
              </Stack>
              <p className="text-xs">
                Connect your tokens to an external source of truth that you can push and pull to. This allows you to use tokens across files.
              </p>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://docs.figmatokens.com/sync/sync?ref=onboarding_explainer_syncproviders"
                className="inline-flex text-xs text-primary-500"
              >
                Read more
              </a>
            </Box>
          </Stack>
        )}
        <SyncSettings />
        <Divider />
        <Stack direction="column" gap={3} css={{ padding: '0 $4' }}>
          <Heading size="medium">Styles</Heading>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="ignoreFirstPartForStyles"
              checked={!!ignoreFirstPartForStyles}
              defaultChecked={ignoreFirstPartForStyles}
              onCheckedChange={handleIgnoreChange}
            />
            <Label htmlFor="ignoreFirstPartForStyles">Ignore first part of token name for styles</Label>
          </Stack>
          <Stack direction="row" gap={2} align="center">
            <Checkbox
              id="prefixStylesWithThemeName"
              checked={!!prefixStylesWithThemeName}
              defaultChecked={prefixStylesWithThemeName}
              onCheckedChange={handlePrefixWithThemeNameChange}
            />
            <Label htmlFor="prefixStylesWithThemeName">Prefix styles with active theme name</Label>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
