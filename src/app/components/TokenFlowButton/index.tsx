import React, { useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { LightningBoltIcon } from '@radix-ui/react-icons';
import IconButton from '../IconButton';
import { useFlags } from '../LaunchDarkly';

import {
  themeObjectsSelector,
  activeThemeSelector,
  themeOptionsSelector,
  usedTokenSetSelector,
  tokensSelector,
} from '@/selectors';

export default function TokenFlowButton() {
  const { tokenFlowButton } = useFlags();
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const themeObjects = useSelector(themeObjectsSelector);
  const tokens = useSelector(tokensSelector);

  const handleOpenTokenFlowApp = useCallback(async () => {
    const tokenData = JSON.stringify(tokens, null, 2);
    const response = await axios({
      method: 'post',
      url: `${process.env.TOKEN_FLOW_APP_URL}/api/tokens`,
      data: {
        tokenData,
        activeTheme,
        availableThemes,
        usedTokenSet,
        themeObjects,
      },
    });
    if (response.status === 200) window.open(`${process.env.TOKEN_FLOW_APP_URL}?id=${response.data.result}`);
  }, [activeTheme, availableThemes, themeObjects, tokens, usedTokenSet]);

  return (
    tokenFlowButton && (
      <IconButton
        tooltip="Open visualization"
        dataCy="token-flow-button"
        onClick={handleOpenTokenFlowApp}
        icon={<LightningBoltIcon />}
      />
    )
  );
}
