import React from 'react';
import { ValueNoneIcon } from '@radix-ui/react-icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { SingleToken } from '@/types/tokens';
import Box from './Box';
import Checkbox from './Checkbox';
import IconButton from './IconButton';
import useTokens from '../store/useTokens';
import InspectorResolvedToken from './InspectorResolvedToken';
import { Dispatch } from '../store';
import { SelectionGroup } from '@/types';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import TokenNodes from './inspector/TokenNodes';
import { inspectStateSelector } from '@/selectors';
import { useTypeForProperty } from '../hooks/useTypeForProperty';
import Button from './Button';
import DownshiftInput from './DownshiftInput';
import Modal from './Modal';
import Stack from './Stack';
import { IconBrokenLink } from '@/icons';

export default function InspectorTokenSingle({
  token,
  resolvedTokens,
}: {
  token: SelectionGroup;
  resolvedTokens: SingleToken[];
}) {
  const { handleRemap, getTokenValue } = useTokens();
  const property = useTypeForProperty(token.category);
  const inspectState = useSelector(inspectStateSelector, shallowEqual);
  const dispatch = useDispatch<Dispatch>();
  const [newTokenName, setNewTokenName] = React.useState<string>(token.value);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [isChecked, setChecked] = React.useState<boolean>(false);
  const [isBrokenLink, setIsBrokenLink] = React.useState<boolean>(false);

  const mappedToken = React.useMemo(() => getTokenValue(token.value, resolvedTokens), [token, resolvedTokens, getTokenValue]);

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.category}-${token.value}`));
    if (!resolvedTokens.find((resolvedToken) => resolvedToken.name === token.value)) setIsBrokenLink(true);
  }, [inspectState.selectedTokens, token, resolvedTokens]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setNewTokenName(newInputValue.replace(/[{}$]/g, ''));
  }, []);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    e.persist();
    setNewTokenName(e.target.value);
  }, []);

  const onConfirm = React.useCallback(() => {
    handleRemap(token.category, token.value, newTokenName, resolvedTokens);
    setShowDialog(false);
  }, [token, handleRemap, newTokenName, resolvedTokens]);

  const handleClick = React.useCallback(() => {
    setShowDialog(true);
  }, []);

  const onCancel = React.useCallback(() => {
    setShowDialog(false);
  }, []);

  const onCheckedChanged = React.useCallback(() => {
    dispatch.inspectState.toggleSelectedTokens(`${token.category}-${token.value}`);
  }, [token, dispatch.inspectState]);

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
      data-cy={`inspector-token-single-${token.category}`}
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
          onCheckedChange={onCheckedChanged}
        />
        {
          (token.value === 'none' || mappedToken?.value === 'none') && <ValueNoneIcon />
        }
        {
          isBrokenLink && token.value !== 'none' && <IconBrokenLink />
        }
        {(!!mappedToken && token.value !== 'none' && mappedToken?.value !== 'none') && (
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
        {
          showDialog && (
            <Modal title={`Choose a new token for ${mappedToken?.name || token.value}`} large isOpen close={onCancel}>
              <form
                onSubmit={onConfirm}
              >
                <Stack direction="column" gap={4} css={{ minHeight: '215px', justifyContent: 'center' }}>
                  <DownshiftInput
                    value={newTokenName}
                    type={property === 'fill' ? 'color' : property}
                    resolvedTokens={resolvedTokens}
                    handleChange={handleChange}
                    setInputValue={handleDownShiftInputChange}
                    placeholder="Choose a new token"
                    suffix
                  />

                  <Stack direction="row" gap={4} justify="between">
                    <Button variant="secondary" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Remap
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Modal>
          )
        }
      </Box>
      <TokenNodes nodes={token.nodes} />
    </Box>
  );
}
