import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Dispatch } from '../store';
import Box from './Box';
import { styled } from '@/stitches.config';
import { tokenFilterSelector } from '@/selectors';

const StyledInput = styled('input', {
  background: 'transparent',
  border: 'none',
  color: '$text',
  fontSize: '$small',
  width: '100%',
  padding: '$3 $5',
  paddingLeft: '$6',
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
  const { t } = useTranslation('');

  const debounced = useDebouncedCallback((value) => {
    dispatch.uiState.setTokenFilter(value);
  }, 250);

  const handleChange = React.useCallback((e) => {
    const { value } = e.target;
    setTokenString(value);
    debounced(value);
  }, [debounced]);

  return (
    <Box
      css={{
        display: 'flex',
        flexGrow: 1,
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
        placeholder={t('general.search') as string}
      />
    </Box>
  );
};

export default TokenFilter;
