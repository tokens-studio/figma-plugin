import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { XCircleFillIcon } from '@primer/octicons-react';
import { Box, IconButton } from '@tokens-studio/ui';
import { Search } from 'iconoir-react';
import { Dispatch } from '../store';
import { styled } from '@/stitches.config';
import { tokenFilterSelector } from '@/selectors';

const StyledInput = styled('input', {
  background: 'transparent',
  border: 'none',
  borderRadius: '$small',
  color: '$fgDefault',
  fontSize: '$small',
  width: '100%',
  height: '$controlMedium',
  paddingLeft: '$6',
  paddingRight: '$1',
  gap: '$2',
  '&:hover': {
    backgroundColor: '$bgSubtle',
  },
  '&:focus-visible': {
    outline: 'none',
    boxShadow: '$focus',
  },
});

const TokenFilter = () => {
  const tokenFilter = useSelector(tokenFilterSelector);
  const [tokenString, setTokenString] = React.useState(tokenFilter);
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['general']);

  const debounced = useDebouncedCallback((value) => {
    dispatch.uiState.setTokenFilter(value);
  }, 250);

  const handleChange = React.useCallback((e: any) => {
    const { value } = e.target;
    setTokenString(value);
    debounced(value);
  }, [debounced]);

  const handleResetSearchString = React.useCallback(() => {
    setTokenString('');
    dispatch.uiState.setTokenFilter('');
  }, [dispatch.uiState]);

  return (
    <Box
      css={{
        display: 'flex',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        alignItems: 'center',
        gap: '$2',
        position: 'relative',
      }}
    >
      <Box css={{ position: 'absolute', left: '$2' }}><Search /></Box>
      <StyledInput
        spellCheck={false}
        type="text"
        value={tokenString}
        onChange={handleChange}
        placeholder={t('search') as string}
      />
      {tokenString && (
        <Box css={{ position: 'absolute', right: '$2' }}>
          <IconButton
            onClick={handleResetSearchString}
            icon={<XCircleFillIcon />}
            css={{ color: '$fgMuted' }}
            variant="invisible"
            size="small"
          />
        </Box>
      )}
    </Box>
  );
};

export default TokenFilter;
