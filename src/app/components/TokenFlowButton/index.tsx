import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import FlowIcon from '@/icons/flow.svg';
import IconButton from '../IconButton';

import {
  themeObjectsSelector,
  activeThemeSelector,
  themeOptionsSelector,
  usedTokenSetSelector,
  tokensSelector,
} from '@/selectors';
import { track } from '@/utils/analytics';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { licenseKeyErrorSelector } from '@/selectors/licenseKeyErrorSelector';

export default function TokenFlowButton() {
  const activeTheme = useSelector(activeThemeSelector);
  const availableThemes = useSelector(themeOptionsSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const themeObjects = useSelector(themeObjectsSelector);
  const tokens = useSelector(tokensSelector);
  const existingKey = useSelector(licenseKeySelector);
  const licenseKeyError = useSelector(licenseKeyErrorSelector);

  const [loading, setLoading] = useState(false);

  const handleOpenTokenFlowApp = useCallback(async () => {
    setLoading(true);
    track('Open visualization');
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
    setLoading(false);
  }, [activeTheme, availableThemes, themeObjects, tokens, usedTokenSet]);

  return (
    (existingKey && !licenseKeyError)
      ? (
        <IconButton
          size="large"
          tooltip="Open visualization flow"
          dataCy="token-flow-button"
          loading={loading}
          onClick={handleOpenTokenFlowApp}
          icon={<FlowIcon />}
        />
      ) : null
  );
}
