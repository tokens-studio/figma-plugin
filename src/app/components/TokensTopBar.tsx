import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import TokenFilter from './TokenFilter';

import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Dispatch } from '../store';
import Button from './Button';
import Stack from './Stack';

export default function TokensTopBar() {
  const dispatch = useDispatch<Dispatch>();
  const handleExtract = useCallback(() => {
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.EXTRACT_TOKENS_FROM_SELECTION,
      categories: ['color'],
    }).then(({ uniqueValues }) => {
      dispatch.tokenState.setTokensFromStyles(uniqueValues);

      console.log('uniqueValues', uniqueValues);
    });
  }, [dispatch.tokenState]);
  return (
    <Stack direction="row" gap={1}>
      <TokenFilter />
      <Button variant="ghost" onClick={handleExtract}>
        Extract
      </Button>
    </Stack>
  );
}
