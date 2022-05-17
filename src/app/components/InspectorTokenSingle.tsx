import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import Box from './Box';
import Checkbox from './Checkbox';
import IconButton from './IconButton';
import useTokens from '../store/useTokens';
import InspectorResolvedToken from './InspectorResolvedToken';
import { Dispatch } from '../store';
import { SelectionGroup } from '@/types';
import TokenNodes from './inspector/TokenNodes';
import { inspectStateSelector } from '@/selectors';
import { IconToggleableDisclosure } from '@/icons/IconToggleableDisclosure';

export default function InspectorTokenSingle({
  token,
  resolvedTokens,
}: {
  token: SelectionGroup;
  resolvedTokens: SingleToken[];
}) {
  const { handleRemap, getTokenValue } = useTokens();
  const inspectState = useSelector(inspectStateSelector, shallowEqual);
  const dispatch = useDispatch<Dispatch>();
  const mappedToken = React.useMemo(() => (
    getTokenValue(token.value, resolvedTokens)
  ), [token, resolvedTokens, getTokenValue]);
  const [isChecked, setChecked] = React.useState(false);

  const handleClick = React.useCallback(() => {
    handleRemap(token.category, token.value);
  }, [token, handleRemap]);

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.category}-${token.value}`));
  }, [inspectState.selectedTokens, token]);

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
        {(!!mappedToken) && (
          <InspectorResolvedToken token={mappedToken} />
        )}

        <Box
          css={{
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
            onClick={handleClick}
            icon={<IconToggleableDisclosure />}
          />
        </Box>
      </Box>
      <TokenNodes nodes={token.nodes} />
    </Box>
  );
}
