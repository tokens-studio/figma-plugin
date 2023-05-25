/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { Dispatch } from '../store';
import {
  tokensSelector, usedTokenSetSelector, activeTokenSetSelector, aliasBaseFontSizeSelector,
} from '@/selectors';
import Box from './Box';
import DownshiftInput from './DownshiftInput';
import { getAliasValue } from '@/utils/alias';

const RemConfiguration = () => {
  const aliasBaseFontSize = useSelector(aliasBaseFontSizeSelector);
  const tokens = useSelector(tokensSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();

  const resolvedTokens = React.useMemo(() => (
    resolveTokenValues(mergeTokenGroups(tokens, {
      ...usedTokenSet,
      [activeTokenSet]: TokenSetStatus.ENABLED,
    }))
  ), [tokens, usedTokenSet, activeTokenSet]);

  const handleBaseFontSizeChange = React.useCallback((property: string, value: string) => {
    dispatch.settings.setAliasBaseFontSize(value);
    const resolvedValue = getAliasValue(value, resolvedTokens);
    if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') {
      dispatch.settings.setBaseFontSize(String(resolvedValue));
    }
  }, [dispatch.settings, resolvedTokens]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    dispatch.settings.setAliasBaseFontSize(newInputValue);
    const resolvedValue = getAliasValue(newInputValue, resolvedTokens);
    if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') {
      dispatch.settings.setBaseFontSize(String(resolvedValue));
    }
  }, [dispatch.settings, resolvedTokens]);

  return (
    <Box css={{ maxWidth: '300px' }}>
      <DownshiftInput
        value={aliasBaseFontSize}
        type={TokenTypes.FONT_SIZES}
        resolvedTokens={resolvedTokens}
        handleChange={handleBaseFontSizeChange}
        setInputValue={handleDownShiftInputChange}
        placeholder="Choose a new token"
        suffix
        arrow="top"
      />
    </Box>

  );
};

export default RemConfiguration;
