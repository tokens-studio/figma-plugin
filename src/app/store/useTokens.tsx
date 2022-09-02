import { useDispatch, useSelector, useStore } from 'react-redux';
import { useCallback, useMemo, useContext } from 'react';
import {
  AnyTokenList,
  SingleToken,
} from '@/types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import useConfirm from '../hooks/useConfirm';
import { Properties } from '@/constants/Properties';
import { track } from '@/utils/analytics';
import { checkIfAlias } from '@/utils/alias';
import {
  activeTokenSetSelector,
  settingsStateSelector,
  tokensSelector,
  usedTokenSetSelector,
} from '@/selectors';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import { isEqual } from '@/utils/isEqual';
import { UpdateMode } from '@/constants/UpdateMode';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { NodeInfo } from '@/types/NodeInfo';
import { TokensContext } from '@/context';
import { Dispatch, RootState } from '../store';
import { DeleteTokenPayload } from '@/types/payloads';

type ConfirmResult =
  ('textStyles' | 'colorStyles' | 'effectStyles')[]
  | string;

type GetFormattedTokensOptions = {
  includeAllTokens: boolean;
  includeParent: boolean;
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
};

type RemoveTokensByValueData = { property: Properties; nodes: NodeInfo[] }[];

export default function useTokens() {
  const dispatch = useDispatch<Dispatch>();
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const tokens = useSelector(tokensSelector);
  const settings = useSelector(settingsStateSelector, isEqual);
  const { confirm } = useConfirm<ConfirmResult>();
  const store = useStore<RootState>();
  const tokensContext = useContext(TokensContext);

  // Gets value of token
  const getTokenValue = useCallback((name: string, resolved: AnyTokenList) => (
    resolved.find((t) => t.name === name)
  ), []);

  // Returns resolved value of a specific token
  const isAlias = useCallback((token: SingleToken, resolvedTokens: AnyTokenList) => (
    checkIfAlias(token, resolvedTokens)
  ), []);

  // Returns formatted tokens for style dictionary
  const getFormattedTokens = useCallback((opts: GetFormattedTokensOptions) => {
    const {
      includeAllTokens = false, includeParent = true, expandTypography = false, expandShadow = false, expandComposition = false,
    } = opts;
    const tokenSets = includeAllTokens ? Object.keys(tokens) : [activeTokenSet];
    return formatTokens({
      tokens, tokenSets, resolvedTokens: tokensContext.resolvedTokens, includeAllTokens, includeParent, expandTypography, expandShadow, expandComposition,
    });
  }, [tokens, activeTokenSet]);

  // Returns stringified tokens for the JSON editor
  const getStringTokens = useCallback(() => (
    stringifyTokens(tokens, activeTokenSet)
  ), [tokens, activeTokenSet]);

  // Calls Figma asking for all local text- and color styles
  const pullStyles = useCallback(async () => {
    const userDecision = await confirm({
      text: 'Import styles',
      description: 'What styles should be imported?',
      confirmAction: 'Import',
      choices: [
        { key: 'colorStyles', label: 'Color', enabled: true },
        { key: 'textStyles', label: 'Text', enabled: true },
        { key: 'effectStyles', label: 'Shadows', enabled: true },
      ],
    });

    if (userDecision && Array.isArray(userDecision.data) && userDecision.data.length) {
      track('Import styles', {
        textStyles: userDecision.data.includes('textStyles'),
        colorStyles: userDecision.data.includes('colorStyles'),
        effectStyles: userDecision.data.includes('effectStyles'),
      });

      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.PULL_STYLES,
        styleTypes: {
          textStyles: userDecision.data.includes('textStyles'),
          colorStyles: userDecision.data.includes('colorStyles'),
          effectStyles: userDecision.data.includes('effectStyles'),
        },
      });
    }
  }, [confirm]);

  const removeTokensByValue = useCallback((data: RemoveTokensByValueData) => {
    track('removeTokensByValue', { count: data.length });

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove: data,
    });
  }, []);

  const handleRemap = useCallback(async (type: Properties | TokenTypes, name: string, newTokenName: string, resolvedTokens: SingleToken[]) => {
    const settings = settingsStateSelector(store.getState());
    track('remapToken', { fromInspect: true });
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMAP_TOKENS,
      category: type,
      oldName: name,
      newName: newTokenName,
      updateMode: UpdateMode.SELECTION,
      tokens: resolvedTokens,
      settings,
    });
  }, [confirm]);

  // Calls Figma with an old name and new name and asks it to update all tokens that use the old name
  const remapToken = useCallback(async (oldName: string, newName: string, updateMode?: UpdateMode) => {
    track('remapToken', { fromRename: true });

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName,
      newName,
      updateMode: updateMode || settings.updateMode,
    });
  }, [settings.updateMode]);

  // Asks user which styles to create, then calls Figma with all tokens to create styles
  const createStylesFromTokens = useCallback(async () => {
    const userDecision = await confirm({
      text: 'Create styles',
      description: 'What styles should be created?',
      confirmAction: 'Create',
      choices: [
        { key: 'colorStyles', label: 'Color', enabled: true },
        { key: 'textStyles', label: 'Text', enabled: true },
        { key: 'effectStyles', label: 'Shadows', enabled: true },
      ],
    });

    if (userDecision && Array.isArray(userDecision.data) && userDecision.data.length) {
      track('createStyles', {
        textStyles: userDecision.data.includes('textStyles'),
        colorStyles: userDecision.data.includes('colorStyles'),
        effectStyles: userDecision.data.includes('effectStyles'),
      });

      const enabledTokenSets = Object.entries(usedTokenSet)
        .filter(([, status]) => status === TokenSetStatus.ENABLED)
        .map(([tokenSet]) => tokenSet);
      const resolved = resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet));
      const withoutIgnoredAndSourceTokens = resolved.filter((token) => (
        !token.name.split('.').some((part) => part.startsWith('_')) // filter out ignored tokens
        && (!token.internal__Parent || enabledTokenSets.includes(token.internal__Parent)) // filter out SOURCE tokens
      ));

      const tokensToCreate = withoutIgnoredAndSourceTokens.filter((token) => (
        [
          userDecision.data.includes('textStyles') && token.type === TokenTypes.TYPOGRAPHY,
          userDecision.data.includes('colorStyles') && token.type === TokenTypes.COLOR,
          userDecision.data.includes('effectStyles') && token.type === TokenTypes.BOX_SHADOW,
        ].some((isEnabled) => isEnabled)
      ));

      const createStylesResult = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREATE_STYLES,
        tokens: tokensToCreate,
        settings,
      });
      dispatch.tokenState.assignStyleIdsToCurrentTheme(createStylesResult.styleIds);
    }
  }, [confirm, usedTokenSet, tokens, settings, dispatch.tokenState]);

  const removeStylesFromTokens = useCallback(async (token: DeleteTokenPayload) => {
    track('removeStyles', token);

    const styleId = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMOVE_STYLES,
      token,
      settings,
    });
    dispatch.tokenState.removeStyleIdsToCurrentTheme(styleId);
  }, []);

  return useMemo(() => ({
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromTokens,
    pullStyles,
    remapToken,
    removeTokensByValue,
    handleRemap,
    removeStylesFromTokens,
  }), [
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromTokens,
    pullStyles,
    remapToken,
    removeTokensByValue,
    handleRemap,
    removeStylesFromTokens,
  ]);
}
