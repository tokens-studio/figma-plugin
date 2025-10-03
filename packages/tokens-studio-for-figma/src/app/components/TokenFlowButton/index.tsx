import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@tokens-studio/ui';
import FlowIcon from '@/icons/flow.svg';

import {
  themeObjectsSelector,
  activeThemeSelector,
  themeOptionsSelector,
  usedTokenSetSelector,
  tokensSelector,
} from '@/selectors';
import { track } from '@/utils/analytics';
import { useIsProUser } from '@/app/hooks/useIsProUser';

export default function TokenFlowButton() {
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const themeObjects = useSelector(themeObjectsSelector);
  const tokens = useSelector(tokensSelector);
  const isProUser = useIsProUser();

  const [loading, setLoading] = useState(false);

  const handleOpenTokenFlowApp = useCallback(async () => {
    setLoading(true);
    track('Open visualization');
    const tokenData = JSON.stringify(tokens, null, 2);
    try {
      const response = await fetch(`${process.env.TOKEN_FLOW_APP_URL}/api/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenData,
          activeTheme,
          availableThemes,
          usedTokenSet,
          themeObjects,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        window.open(`${process.env.TOKEN_FLOW_APP_URL}?id=${data.result}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [activeTheme, availableThemes, themeObjects, tokens, usedTokenSet]);

  return (
    isProUser
      ? (
        <IconButton
          size="small"
          variant="invisible"
          tooltip="Open visualization flow"
          data-testid="token-flow-button"
          loading={loading}
          onClick={handleOpenTokenFlowApp}
          icon={<FlowIcon />}
        />
      ) : null
  );
}
