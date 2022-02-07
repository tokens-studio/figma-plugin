import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectionGroup } from '@/types/tokens';
import Box from './Box';
import Checkbox from './Checkbox';
import useTokens from '../store/useTokens';
import IconLayers from '@/icons/layers.svg';
import InspectorResolvedToken from './InspectorResolvedToken';
import { Dispatch, RootState } from '../store';

export default function InspectorTokenSingle({ token }: { token: SelectionGroup }) {
  const { findToken } = useTokens();
  const inspectState = useSelector((state: RootState) => state.inspectState);
  const dispatch = useDispatch<Dispatch>();

  const resolvedToken = findToken(token.value);
  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: '$2',
        paddingBottom: '$2',
      }}
    >
      <Box
        css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '$4',
        }}
      >
        <Checkbox
          checked={inspectState.selectedTokens.includes(`${token.category}-${token.value}`)}
          id={`${token.category}-${token.value}`}
          onCheckedChange={() => dispatch.inspectState.toggleSelectedTokens(`${token.category}-${token.value}`)}
        />
        <InspectorResolvedToken token={resolvedToken} />

        <Box css={{ fontSize: '$small' }}>{token.value}</Box>
      </Box>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '$3',
          fontWeight: '$bold',
          fontSize: '$small',
        }}
      >
        <Box css={{ color: '$fgSubtle' }}>
          <IconLayers />
        </Box>
        {token.nodes.length}
      </Box>
    </Box>
  );
}
