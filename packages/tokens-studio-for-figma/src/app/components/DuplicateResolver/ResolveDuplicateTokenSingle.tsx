import React from 'react';
import { useTranslation } from 'react-i18next';
import { ValueNoneIcon } from '@radix-ui/react-icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { IconButton, Button } from '@tokens-studio/ui';
import { SingleToken } from '@/types/tokens';
import Box from '../Box';
import Checkbox from '../Checkbox';
import useTokens from '../../store/useTokens';
import InspectorResolvedToken from '../InspectorResolvedToken';
import { Dispatch } from '../../store';
import { SelectionGroup } from '@/types';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import TokenNodes from '../inspector/TokenNodes';
import { inspectStateSelector } from '@/selectors';
import { useTypeForProperty } from '../../hooks/useTypeForProperty';
import DownshiftInput from '../DownshiftInput';
import Modal from '../Modal';
import Stack from '../Stack';
import { IconBrokenLink, IconVariable } from '@/icons';
import StyleIcon from '@/icons/style.svg';
import Tooltip from '../Tooltip';
import { TokenTypes } from '@/constants/TokenTypes';
import { TokensContext } from '@/context';

export default function ResolveDuplicateTokenSingle({
  token,
  resolvedTokens,
}: {
  token: SingleToken;
  resolvedTokens: SingleToken[];
}) {
  // If token has the resolvedValue property, that means it is the style not a token
  const { handleRemap, getTokenValue } = useTokens();
  // const property = useTypeForProperty(token.type);
  const inspectState = useSelector(inspectStateSelector, shallowEqual);
  const dispatch = useDispatch<Dispatch>();
  const [newTokenName, setNewTokenName] = React.useState<string>(token.name);
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [isChecked, setChecked] = React.useState<boolean>(false);
  const [isBrokenLink, setIsBrokenLink] = React.useState<boolean>(false);
  const tokensContext = React.useContext(TokensContext);

  const { t } = useTranslation(['inspect']);

  const tokenToDisplay = React.useMemo(() => {
    if (token.rawValue) {
      return { name: token.value, value: token.rawValue, type: token.type };
    }
    const resolvedToken = getTokenValue(token.name, resolvedTokens);
    if (resolvedToken) {
      if (resolvedToken.type === TokenTypes.COMPOSITION) {
        return {
          name: resolvedToken.name, value: resolvedToken.value, rawValue: resolvedToken.rawValue, type: resolvedToken.type,
        };
      }

      return { name: resolvedToken.name, value: resolvedToken.value, type: resolvedToken.type };
    }
    return null;
  }, [token, getTokenValue, resolvedTokens]);

  React.useEffect(() => {
    setChecked(inspectState.selectedTokens.includes(`${token.name}-${token.value}`));
    if (!resolvedTokens.find((resolvedToken) => resolvedToken.name === token.value) && !token.rawValue) setIsBrokenLink(true);
  }, [inspectState.selectedTokens, token]);

  React.useEffect(() => {
    tokensContext.resolvedTokens = resolvedTokens;
  }, [resolvedTokens]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setNewTokenName(newInputValue.replace(/[{}$]/g, ''));
  }, []);

  const handleChange = React.useCallback((property: string, value: string) => {
    setNewTokenName(value);
  }, []);

  const onConfirm = React.useCallback(() => {
    handleRemap(token.type, token.name, newTokenName, resolvedTokens);
    setShowDialog(false);
  }, [token, handleRemap, newTokenName, resolvedTokens]);

  const handleClick = React.useCallback(() => {
    setShowDialog(true);
  }, []);

  const onCancel = React.useCallback(() => {
    setShowDialog(false);
  }, []);

  const onCheckedChanged = React.useCallback(() => {
    dispatch.inspectState.toggleSelectedTokens(`${token.name}-${token.value}`);
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
      data-testid={`inspector-token-single-${token.name}`}
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
          id={`${token.name}-${token.value}`}
          onCheckedChange={onCheckedChanged}
        />
        {
           (token.value === 'none' || tokenToDisplay?.value === 'none') && <ValueNoneIcon />
        }
        {
          isBrokenLink && token.value !== 'none' && <IconBrokenLink />
        }
        {/* {(tokenToDisplay && tokenToDisplay.value !== 'none' && tokenToDisplay.name !== 'none') && (
          <InspectorResolvedToken token={tokenToDisplay} />
        )} */}
        <Box
          css={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '$1',
          }}
        >
          {/* {token.appliedType === 'variable' && <Tooltip label={t('appliedVariable')}><IconVariable /></Tooltip>}
          {token.appliedType === 'style' && <Tooltip label={t('appliedStyle')}><StyleIcon /></Tooltip>} */}
          <Box css={{ fontSize: '$small' }}>{token.name}</Box>
          {
            !token.rawValue && (
            <IconButton
              tooltip={t('changeToAnotherToken')}
              data-testid="button-token-remap"
              onClick={handleClick}
              icon={<IconToggleableDisclosure />}
              size="small"
              variant="invisible"
            />
            )
          }
        </Box>
        {
          showDialog && (
            <Modal modal={false} title={t('chooseANewTokenForValue', { value: tokenToDisplay?.name || token.value })} size="large" isOpen close={onCancel}>
              <form
                onSubmit={onConfirm}
              >
                <Stack direction="column" gap={4}>
                  <DownshiftInput
                    value={newTokenName}
                    type={token.type}
                    resolvedTokens={resolvedTokens}
                    handleChange={handleChange}
                    setInputValue={handleDownShiftInputChange}
                    placeholder={t('chooseANewToken')}
                    suffix
                    onSubmit={onConfirm}
                  />

                  <Stack direction="row" gap={4} justify="between">
                    <Button variant="secondary" onClick={onCancel}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" variant="primary">
                      {t('remap')}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Modal>
          )
        }
      </Box>
      {/* <TokenNodes nodes={token.nodes} /> */}
    </Box>
  );
}
