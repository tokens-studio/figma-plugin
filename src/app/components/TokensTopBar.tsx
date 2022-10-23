import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { MagicWandIcon } from '@radix-ui/react-icons';
import TokenFilter from './TokenFilter';

import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { Dispatch } from '../store';
import Stack from './Stack';
import useConfirm from '../hooks/useConfirm';
import IconButton from './IconButton';
import Box from './Box';

export default function TokensTopBar() {
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const handleExtract = useCallback(async () => {
    const shouldApplyTokens = await confirm({
      text: 'Extract tokens',
      description: 'We\'ll extract all design decisions from selected layers. Should we also apply tokens?',
      choices: [
        {
          key: 'applyTokens', label: 'Apply tokens for properties', enabled: true,
        },
      ],
    });
    if (shouldApplyTokens) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.EXTRACT_TOKENS_FROM_SELECTION,
        categories: ['color'],
        applyTokens: shouldApplyTokens && shouldApplyTokens.data.includes('applyTokens'),
      }).then(({ uniqueValues }) => {
        dispatch.tokenState.setTokensFromStyles(uniqueValues);

        console.log('uniqueValues', uniqueValues);
      });
    }
  }, [confirm, dispatch.tokenState]);
  return (
    <Stack direction="row" gap={1} align="center" css={{ borderBottom: '1px solid', borderColor: '$borderMuted' }}>
      <TokenFilter />
      <Box css={{ padding: '$2', marginRight: '$3' }}><IconButton onClick={handleExtract} tooltip="Extract tokens from layer(s)" icon={<MagicWandIcon />} /></Box>
    </Stack>
  );
}
