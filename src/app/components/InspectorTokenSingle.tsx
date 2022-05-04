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
import { checkIfContainsAlias } from '@/utils/alias';
import { IconToggleableDisclosure } from './icons/IconToggleableDisclosure';
import Button from './Button';
import Heading from './Heading';
import DownshiftInput from './DownshiftInput';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
import Modal from './Modal';
import Stack from './Stack';
import ColorPicker from './ColorPicker';
import { Properties } from '@/constants/Properties';

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
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);
  const [newTokenName, setNewTokenName] = React.useState<string>('');
  const [inputHelperOpen, setInputHelperOpen] = React.useState<boolean>(false);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);

  const mappedToken = React.useMemo(() => {
    if (checkIfContainsAlias(token.value)) {
      let nameToLookFor: string = '';
      const tokenValueString = String(token.value);
      if (tokenValueString.charAt(0) === '$') nameToLookFor = tokenValueString.slice(1, tokenValueString.length);
      if (tokenValueString.charAt(0) === '{') nameToLookFor = tokenValueString.slice(1, tokenValueString.length - 1);
      return getTokenValue(nameToLookFor, resolvedTokens);  
    } 
    return getTokenValue(token.value, resolvedTokens);
  }, [token, resolvedTokens, getTokenValue]);
  const [isChecked, setChecked] = React.useState(false);

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.category}-${token.value}`));
  }, [inspectState.selectedTokens, token]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      e.persist();
      setNewTokenName(e.target.value);
    },
    [newTokenName],
  );

  const handleColorValueChange = React.useCallback(
    (color: string) => {
      setNewTokenName(color);
    },
    [newTokenName],
  );

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setNewTokenName(newInputValue);
  }, [newTokenName]);

  const handleToggleInputHelper = React.useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

  const handleAutoSuggest = React.useCallback(() => {
    setShowAutoSuggest(!showAutoSuggest);
  }, [showAutoSuggest]
  );

  const onConfirm = React.useCallback(() => {
    handleRemap(token.category, token.value, newTokenName);
    setShowDialog(false);
  }, [token, handleRemap, newTokenName]);

  const handleClick = React.useCallback(() => {
    setShowDialog(true);
  }, [showDialog]);

  const onCancel = React.useCallback(() => {
    setShowDialog(false);
  }, [showDialog])

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
          <Box css={{ fontSize: '$small' }}>{ mappedToken?.name || token.value}</Box>
          <IconButton
            tooltip="Change to another token"
            dataCy="button-token-remap"
            onClick={handleClick}
            icon={<IconToggleableDisclosure />}
          />
        </Box>
        {
          showDialog && (
            <Modal large isOpen close={onCancel}>
              <form
                onSubmit={onConfirm}
              >
                <Stack direction="column" gap={4}>
                  <Stack direction="column" gap={2}>
                    <Heading>Choose a new token for {token.value}</Heading>
                    <DownshiftInput
                      value={newTokenName}
                      type={Properties[token.category] === 'fill' ? 'color' : Properties[token.category]}
                      showAutoSuggest={showAutoSuggest}
                      resolvedTokens={resolvedTokens}
                      handleChange={handleChange}
                      setShowAutoSuggest={setShowAutoSuggest}
                      setInputValue={handleDownShiftInputChange}
                      placeholder={
                        Properties[token.category] === 'fill' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
                      }
                      prefix={
                        Properties[token.category] === 'fill' && (
                          <button
                            type="button"
                            className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                            style={{ background: newTokenName, fontSize: 0 }}
                            onClick={handleToggleInputHelper}
                          >
                            {newTokenName}
                          </button>
                        )
                      }
                      suffix={(
                        <StyledInputSuffix type="button" onClick={handleAutoSuggest}>
                          <StyledIconDisclosure />
                        </StyledInputSuffix>
                      )}
                    />
                    {inputHelperOpen && Properties[token.category] === 'fill' && (
                      <ColorPicker value={newTokenName} onChange={handleColorValueChange} />
                    )}

                  </Stack>
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
