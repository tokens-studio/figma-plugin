import { useDispatch, useSelector, useStore } from 'react-redux';
import { useCallback, useMemo, useContext } from 'react';
import {
  AnyTokenList,
  SingleToken,
} from '@/types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import useConfirm, { ResolveCallbackPayload } from '../hooks/useConfirm';
import { Properties } from '@/constants/Properties';
import { track } from '@/utils/analytics';
import { checkIfAlias } from '@/utils/alias';
import {
  activeTokenSetSelector,
  inspectStateSelector,
  settingsStateSelector,
  tokensSelector,
  uiStateSelector,
  updateModeSelector,
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
import { notifyToUI } from '@/plugin/notifiers';

type ConfirmResult =
  ('textStyles' | 'colorStyles' | 'effectStyles')[]
  | string;

type GetFormattedTokensOptions = {
  includeAllTokens: boolean;
  includeParent: boolean;
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
  expandBorder: boolean;
};

type RemoveTokensByValueData = { property: Properties; nodes: NodeInfo[] }[];

export type SyncOption = 'removeStyle' | 'renameStyle';

export default function useTokens() {
  const dispatch = useDispatch<Dispatch>();
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const updateMode = useSelector(updateModeSelector);
  const tokens = useSelector(tokensSelector);
  const settings = useSelector(settingsStateSelector, isEqual);
  const { confirm } = useConfirm<ConfirmResult>();
  const store = useStore<RootState>();
  const tokensContext = useContext(TokensContext);
  const shouldConfirm = useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

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
      includeAllTokens = false, includeParent = true, expandTypography = false, expandShadow = false, expandComposition = false, expandBorder = false,
    } = opts;
    const tokenSets = includeAllTokens ? Object.keys(tokens) : [activeTokenSet];
    return formatTokens({
      tokens, tokenSets, resolvedTokens: tokensContext.resolvedTokens, includeAllTokens, includeParent, expandTypography, expandShadow, expandComposition, expandBorder,
    });
  }, [tokens, activeTokenSet]);

  // Returns stringified tokens for the JSON editor
  const getStringTokens = useCallback(() => (
    stringifyTokens(tokens, activeTokenSet)
  ), [tokens, activeTokenSet]);

  // handles updating JSON
  const handleJSONUpdate = useCallback((newTokens: string) => {
    track('Update JSON');
    dispatch.tokenState.setJSONData(newTokens);
  }, [dispatch.tokenState]);

  // Handles the update operation
  const handleUpdate = useCallback(() => {
    track('Update Tokens');
    if (shouldConfirm) {
      confirm({
        text: 'Are you sure?',
        description:
            'You are about to run a document wide update. This operation can take more than 30 minutes on very large documents.',
      }).then((result) => {
        if (result && result.result) {
          dispatch.tokenState.updateDocument();
        }
      });
    } else {
      dispatch.tokenState.updateDocument();
    }
  }, [confirm, dispatch.tokenState, shouldConfirm]);

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

  const handleBulkRemap = useCallback(async (newName: string, oldName: string, updateMode = UpdateMode.SELECTION) => {
    track('bulkRemapToken', { fromInspect: true });
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName,
      newName,
      updateMode,
    });
  }, []);

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

  const remapTokensInGroup = useCallback(async ({ oldGroupName, newGroupName }: { oldGroupName: string, newGroupName: string }) => {
    const shouldRemap = await confirm({
      text: `Remap all tokens that use tokens in ${oldGroupName} group?`,
      description: 'This will change all layers that used the old token name. This could take a while.',
      choices: [
        {
          key: UpdateMode.SELECTION, label: 'Selection', unique: true, enabled: UpdateMode.SELECTION === settings.updateMode,
        },
        {
          key: UpdateMode.PAGE, label: 'Page', unique: true, enabled: UpdateMode.PAGE === settings.updateMode,
        },
        {
          key: UpdateMode.DOCUMENT, label: 'Document', unique: true, enabled: UpdateMode.DOCUMENT === settings.updateMode,
        },
      ],
    });
    if (shouldRemap) {
      await handleBulkRemap(newGroupName, oldGroupName, shouldRemap.data[0]);
      dispatch.settings.setUpdateMode(shouldRemap.data[0] as UpdateMode);
    }
  }, [settings.updateMode, confirm, handleBulkRemap, dispatch.settings]);

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
      if (enabledTokenSets.length === 0) {
        notifyToUI('No styles created. Make sure token sets are active.', { error: true });
        return;
      }
      const resolved = resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet));
      const withoutSourceTokens = resolved.filter((token) => (
        !token.internal__Parent || enabledTokenSets.includes(token.internal__Parent) // filter out SOURCE tokens
      ));

      const tokensToCreate = withoutSourceTokens.filter((token) => (
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
      dispatch.tokenState.assignStyleIdsToCurrentTheme(createStylesResult.styleIds, tokensToCreate);
    }
  }, [confirm, usedTokenSet, tokens, settings, dispatch.tokenState]);

  const syncStyles = useCallback(async () => {
    const userConfirmation = await confirm({
      text: 'Sync styles',
      description: 'This will try to rename any styles that were connected via Themes and try to remove any styles that are not connected to any theme.',
      choices: [
        { key: 'removeStyles', label: 'Remove styles without connection' },
        { key: 'renameStyles', label: 'Rename styles' },
      ],
    }) as ResolveCallbackPayload<any>;

    if (userConfirmation && Array.isArray(userConfirmation.data) && userConfirmation.data.length) {
      track('syncStyles', userConfirmation.data);

      const syncStyleResult = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SYNC_STYLES,
        tokens,
        options: {
          renameStyle: userConfirmation.data.includes('renameStyles'),
          removeStyle: userConfirmation.data.includes('removeStyles'),
        },
        settings,
      });
      dispatch.tokenState.removeStyleIdsFromThemes(syncStyleResult.styleIdsToRemove);
    }
  }, [confirm, tokens, dispatch.tokenState, settings]);

  const renameStylesFromTokens = useCallback(async ({ oldName, newName, parent }: { oldName: string, newName: string, parent: string }) => {
    track('renameStyles', { oldName, newName, parent });

    const renameStylesResult = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.RENAME_STYLES,
      oldName,
      newName,
      parent,
      settings,
    });
    dispatch.tokenState.renameStyleIdsToCurrentTheme(renameStylesResult.styleIds, newName);
  }, [settings, dispatch.tokenState]);

  const removeStylesFromTokens = useCallback(async (token: DeleteTokenPayload) => {
    track('removeStyles', token);

    const removeStylesResult = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMOVE_STYLES,
      token,
      settings,
    });
    dispatch.tokenState.removeStyleIdsFromThemes(removeStylesResult.styleIds);
  }, [settings, dispatch.tokenState]);

  const setNoneValuesOnNode = useCallback((resolvedTokens: SingleToken[]) => {
    const uiState = uiStateSelector(store.getState());
    const inspectState = inspectStateSelector(store.getState());
    const tokensToSet = uiState.selectionValues
      .filter((v) => inspectState.selectedTokens.includes(`${v.category}-${v.value}`))
      .map((v) => ({ nodes: v.nodes, property: v.type })) as ({
      property: Properties;
      nodes: NodeInfo[];
    }[]);

    track('setNoneValuesOnNode', tokensToSet);

    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.SET_NONE_VALUES_ON_NODE,
      tokensToSet,
      tokens: resolvedTokens,
    });
  }, []);

  return useMemo(() => ({
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromTokens,
    pullStyles,
    remapToken,
    remapTokensInGroup,
    removeTokensByValue,
    handleRemap,
    renameStylesFromTokens,
    handleBulkRemap,
    removeStylesFromTokens,
    syncStyles,
    setNoneValuesOnNode,
    handleUpdate,
    handleJSONUpdate,
  }), [
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromTokens,
    pullStyles,
    remapToken,
    remapTokensInGroup,
    removeTokensByValue,
    handleRemap,
    renameStylesFromTokens,
    handleBulkRemap,
    removeStylesFromTokens,
    syncStyles,
    setNoneValuesOnNode,
    handleUpdate,
    handleJSONUpdate,
  ]);
}
