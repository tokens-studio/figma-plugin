import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import Box from './Box';
import Checkbox from './Checkbox';
import IconButton from './IconButton';
import useTokens from '../store/useTokens';
import IconDisclosure from '@/icons/disclosure.svg';
import InspectorResolvedToken from './InspectorResolvedToken';
import { Dispatch, RootState } from '../store';
import { SelectionGroup } from '@/types';
import TokenNodes from './inspector/TokenLayers';

export default function InspectorTokenSingle({ token, resolvedTokens }: { token: SelectionGroup, resolvedTokens: SingleToken[] }) {
  const { handleRemap, getTokenValue } = useTokens();
  const inspectState = useSelector((state: RootState) => state.inspectState);
  const dispatch = useDispatch<Dispatch>();
  const [isChecked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.category}-${token.value}`));
  }, [inspectState.selectedTokens, token]);

  const mappedToken = getTokenValue(token.value, resolvedTokens);
  console.log(token);
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
          checked={isChecked}
          id={`${token.category}-${token.value}`}
          onCheckedChange={() => dispatch.inspectState.toggleSelectedTokens(`${token.category}-${token.value}`)}
        />
        <InspectorResolvedToken token={mappedToken} />

        <Box css={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '$1',
        }}
        >
          <Box css={{ fontSize: '$small' }}>{token.value}</Box>
          <IconButton
            tooltip="Change to another token"
            dataCy="button-token-remap"
            onClick={() => handleRemap(token.category, token.value)}
            icon={<IconDisclosure />}
          />
        </Box>
      </Box>
      <TokenNodes nodes={token.nodes} />
    </Box>
  );
}
