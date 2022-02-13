import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectionGroup, SingleTokenObject } from '@/types/tokens';
import Box from './Box';
import Checkbox from './Checkbox';
import IconButton from './IconButton';
import useTokens from '../store/useTokens';
import IconLayers from '@/icons/layers.svg';
import IconDisclosure from '@/icons/disclosure.svg';
import InspectorResolvedToken from './InspectorResolvedToken';
import { Dispatch, RootState } from '../store';

export default function InspectorTokenSingle({ token, resolvedTokens }: { token: SelectionGroup, resolvedTokens: SingleTokenObject[] }) {
  const { handleRemap, getTokenValue } = useTokens();
  const inspectState = useSelector((state: RootState) => state.inspectState);
  const dispatch = useDispatch<Dispatch>();
  const [isChecked, setChecked] = React.useState(false);
  const { getTokenValue } = useTokens();

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.category}-${token.value}`));
  }, [inspectState.selectedTokens, token]);

  // TODO: can this even be undefned?
  const mappedToken = getTokenValue(token.value, resolvedTokens);

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
