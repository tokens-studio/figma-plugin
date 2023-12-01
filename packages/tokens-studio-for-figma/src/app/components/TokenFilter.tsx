import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { XCircleFillIcon } from '@primer/octicons-react';
import { Dispatch } from '../store';
import Box from './Box';
import { styled } from '@/stitches.config';
import { tokenFilterSelector } from '@/selectors';
import IconButton from './IconButton';

const StyledInput = styled('input', {
  background: 'transparent',
  border: 'none',
  color: '$fgDefault',
  fontSize: '$small',
  width: '100%',
  padding: '$3 $5',
  paddingLeft: '$6',
  paddingRight: '$1',
  gap: '$2',
  '&:focus, &:hover': {
    outline: 'none',
    boxShadow: 'none',
    backgroundColor: '$bgSubtle',
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
      <Box css={{ position: 'absolute', left: '$2' }}><MagnifyingGlassIcon /></Box>
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
            css={{ color: '$fgSubtle' }}
          />
        </Box>
      )}
    </Box>
  );
};

export default TokenFilter;
