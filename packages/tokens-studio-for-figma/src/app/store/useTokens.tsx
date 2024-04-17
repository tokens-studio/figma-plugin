import { useDispatch, useSelector, useStore } from 'react-redux';
import { useCallback, useMemo, useContext } from 'react';
import { AnyTokenList, SingleToken, TokenToRename } from '@/types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import { mergeTokenGroups } from '@/utils/tokenHelpers';
import useConfirm, { ResolveCallbackPayload } from '../hooks/useConfirm';
import { Properties } from '@/constants/Properties';
import { track } from '@/utils/analytics';
import { checkIfAlias, getAliasValue } from '@/utils/alias';
import {
  activeTokenSetSelector,
  storeTokenIdInJsonEditorSelector,
  inspectStateSelector,
  settingsStateSelector,
  tokensSelector,
  uiStateSelector,
  updateModeSelector,
  usedTokenSetSelector,
  themesListSelector,
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
import { UpdateTokenVariablePayload } from '@/types/payloads/UpdateTokenVariablePayload';
import { wrapTransaction } from '@/profiling/transaction';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { defaultTokenResolver } from '@/utils/TokenResolver';
import { getFormat } from '@/plugin/TokenFormatStoreClass';
import { theme } from '@/stitches.config';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { ThemeObject } from '@/types';

type ConfirmResult = ('textStyles' | 'colorStyles' | 'effectStyles' | string)[] | string;

type GetFormattedTokensOptions = {
  includeAllTokens: boolean;
  includeParent: boolean;
  expandTypography: boolean;
  expandShadow: boolean;
  expandComposition: boolean;
  expandBorder: boolean;
};

type RemoveTokensByValueData = { property: Properties; nodes: NodeInfo[] }[];

let lastUsedRenameOption: UpdateMode = UpdateMode.SELECTION;

export type SyncOption = 'removeStyle' | 'renameStyle';
export type SyncVariableOption = 'removeVariable' | 'renameVariable';

export type TokensToRenamePayload = {
  oldName: string;
  newName: string;
};

export default function useTokens() {
  const dispatch = useDispatch<Dispatch>();
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const updateMode = useSelector(updateModeSelector);
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const settings = useSelector(settingsStateSelector, isEqual);
  const storeTokenIdInJsonEditor = useSelector(storeTokenIdInJsonEditorSelector);
  const { confirm } = useConfirm<ConfirmResult>();
  const store = useStore<RootState>();
  const tokensContext = useContext(TokensContext);
  const shouldConfirm = useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);
  const VALID_TOKEN_TYPES = [TokenTypes.DIMENSION, TokenTypes.BORDER_RADIUS, TokenTypes.BORDER, TokenTypes.BORDER_WIDTH, TokenTypes.SPACING];
  const tokenFormat = getFormat();

  // Gets value of token
  const getTokenValue = useCallback((name: string, resolved: AnyTokenList) => (
    resolved.find((t) => t.name === name)
  ), []);

  // Returns resolved value of a specific token
  const isAlias = useCallback((token: SingleToken, resolvedTokens: AnyTokenList) => (
    checkIfAlias(token, resolvedTokens)
  ), []);

  // Returns formatted tokens for style dictionary
  const getFormattedTokens = useCallback(
    (opts: GetFormattedTokensOptions) => {
      const {
        includeAllTokens = false, includeParent = true, expandTypography = false, expandShadow = false, expandComposition = false, expandBorder = false,
      } = opts;
      const tokenSets = includeAllTokens ? Object.keys(tokens) : [activeTokenSet];
      return formatTokens({
        tokens,
        tokenSets,
        resolvedTokens: tokensContext.resolvedTokens,
        includeAllTokens,
        includeParent,
        expandTypography,
        expandShadow,
        expandComposition,
        expandBorder,
        storeTokenIdInJsonEditor,
      });
    },
    // Adding tokenFormat as a dependency to cause a change when format changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, activeTokenSet, storeTokenIdInJsonEditor, tokensContext.resolvedTokens, tokenFormat],
  );

  // Returns stringified tokens for the JSON editor
  const getStringTokens = useCallback(
    () => stringifyTokens(tokens, activeTokenSet, storeTokenIdInJsonEditor),
    // Adding tokenFormat as a dependency to cause a change when format changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokens, activeTokenSet, storeTokenIdInJsonEditor, tokenFormat],
  );

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
          // @ts-ignore
          dispatch.tokenState.updateDocument();
        }
      });
    } else {
      // @ts-ignore
      dispatch.tokenState.updateDocument();
    }
  }, [confirm, dispatch.tokenState, shouldConfirm]);

  // Calls Figma asking for all local text- and color styles
  const pullStyles = useCallback(async () => {
    const userDecision = await confirm({
      text: 'Import styles',
      description: 'Which styles should be imported?',
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

  const pullVariables = useCallback(async () => {
    const userDecision = await confirm({
      text: 'Import variables',
      description: 'Sets will be created for each variable mode.',
      choices: [
        { key: 'useDimensions', label: 'Convert numbers to dimensions', enabled: false },
        { key: 'useRem', label: 'Use rem for dimension values', enabled: false },
      ],
      confirmAction: 'Import',
    });

    if (userDecision) {
      track('Import variables');
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.PULL_VARIABLES,
        options: {
          useDimensions: userDecision.data.includes('useDimensions'),
          useRem: userDecision.data.includes('useRem'),
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
    track('remapToken', { fromInspect: true });

    wrapTransaction({ name: 'remapToken' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMAP_TOKENS,
      category: type,
      oldName: name,
      newName: newTokenName,
      updateMode: UpdateMode.SELECTION,
      tokens: resolvedTokens,
      settings,
    }));
  }, [settings]);

  const handleBulkRemap = useCallback(async (newName: string, oldName: string, bulkUpdateMode = UpdateMode.SELECTION) => {
    track('bulkRemapToken', { fromInspect: true });

    wrapTransaction({ name: 'bulkRemapToken' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.BULK_REMAP_TOKENS,
      oldName,
      newName,
      updateMode: bulkUpdateMode,
    }));
  }, []);

  // Calls Figma with an old name and new name and asks it to update all tokens that use the old name
  const remapToken = useCallback(async (oldName: string, newName: string, remapUpdateMode?: UpdateMode) => {
    track('remapToken', { fromRename: true });

    wrapTransaction({ name: 'remapToken' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.REMAP_TOKENS,
      oldName,
      newName,
      updateMode: remapUpdateMode || settings.updateMode,
    }));
  }, [settings.updateMode]);

  const remapTokensInGroup = useCallback(async ({
    oldGroupName, newGroupName, type, tokensToRename,
  }: { oldGroupName: string, newGroupName: string, type: string, tokensToRename: TokenToRename[] }) => {
    const confirmData = await confirm({
      text: `Remap all tokens that use tokens in ${oldGroupName} group?`,
      description: 'This will change all layers that used the old token name. This could take a while.',
      choices: [
        {
          key: UpdateMode.SELECTION, label: 'Selection', unique: true, enabled: UpdateMode.SELECTION === lastUsedRenameOption,
        },
        {
          key: UpdateMode.PAGE, label: 'Page', unique: true, enabled: UpdateMode.PAGE === lastUsedRenameOption,
        },
        {
          key: UpdateMode.DOCUMENT, label: 'Document', unique: true, enabled: UpdateMode.DOCUMENT === lastUsedRenameOption,
        },
        {
          key: 'rename-variable-token-group', label: 'Rename variables',
        },
        {
          key: 'rename-style-token-group', label: 'Rename styles',
        },
      ],
    });
    if (confirmData && confirmData.result) {
      if (Array.isArray(confirmData.data) && confirmData.data.some((data: string) => [UpdateMode.DOCUMENT, UpdateMode.PAGE, UpdateMode.SELECTION].includes(data as UpdateMode))) {
        await Promise.all(tokensToRename.map((tokenToRename) => handleBulkRemap(tokenToRename.newName, tokenToRename.oldName, confirmData.data[0] as UpdateMode)));
        lastUsedRenameOption = confirmData.data[0] as UpdateMode;
      }
      if (confirmData.data.includes('rename-variable-token-group')) {
        track('renameVariablesInTokenGroup', { newGroupName, oldGroupName });
        const tokensInParent = tokens[activeTokenSet] ?? [];
        const tokensToRename: TokenToRename[] = [];
        tokensInParent.map((token) => {
          if (token.name.startsWith(oldGroupName) && token.type === type) {
            tokensToRename.push({
              oldName: token.name,
              newName: token.name.replace(`${oldGroupName}`, `${newGroupName}`),
            });
          }
          return token;
        }) as AnyTokenList;

        const result = await AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.RENAME_VARIABLES,
          tokens: tokensToRename,
        });
        dispatch.tokenState.renameVariableIdsToTheme(result.renameVariableToken);
      }

      if (confirmData.data.includes('rename-style-token-group')) {
        track('renameStylesInTokenGroup', { newGroupName, oldGroupName });
        const tokensInParent = tokens[activeTokenSet] ?? [];
        const tokensToRename = tokensInParent
          .filter((token) => token.name.startsWith(oldGroupName) && token.type === type)
          .map((filteredToken) => ({
            oldName: filteredToken.name,
            newName: filteredToken.name.replace(oldGroupName, newGroupName),
          }));

        const renameStylesResult = await AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.RENAME_STYLES,
          tokensToRename,
          parent: activeTokenSet,
          settings,
        });
        dispatch.tokenState.renameStyleIdsToCurrentTheme(renameStylesResult.styleIds, tokensToRename);
      }
    }
  }, [activeTokenSet, tokens, confirm, handleBulkRemap, dispatch.tokenState, settings]);

  const remapTokensWithOtherReference = useCallback(async ({
    oldName, newName,
  }: { oldName: string, newName:string }) => {
    dispatch.tokenState.updateOtherAliases([oldName, newName]);
  }, [dispatch.tokenState]);

  // Asks user which styles to create, then calls Figma with all tokens to create styles
  const createStylesFromSelectedTokenSets = useCallback(async (selectedSets: ExportTokenSet[]) => {
    const shouldCreateStyles = ((settings.stylesTypography || settings.stylesColor || settings.stylesEffect) && selectedSets.length > 0);
    if (!shouldCreateStyles) return;

    track('createStyles', {
      textStyles: settings.stylesTypography,
      colorStyles: settings.stylesColor,
      effectStyles: settings.stylesEffect,
    });

    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATE_STYLES,
      isInfinite: true,
    });

    const enabledTokenSets = selectedSets
      .filter((set) => set.status === TokenSetStatus.ENABLED)
      .map((tokenSet) => tokenSet.set);

    if (enabledTokenSets.length === 0) {
      notifyToUI('No styles created. Make sure token sets are active.', { error: true });
      return;
    }

    const tokensToResolve = selectedSets.flatMap((set) => mergeTokenGroups(tokens, { [set.set]: TokenSetStatus.ENABLED }));

    const resolved = defaultTokenResolver.setTokens(tokensToResolve);
    const withoutSourceTokens = resolved.filter((token) => (
      !token.internal__Parent || enabledTokenSets.includes(token.internal__Parent) // filter out SOURCE tokens
    ));

    const tokensToCreate = withoutSourceTokens.reduce((acc: SingleToken[], curr) => {
      const shouldCreate = [
        settings.stylesTypography && curr.type === TokenTypes.TYPOGRAPHY,
        settings.stylesColor && curr.type === TokenTypes.COLOR,
        settings.stylesEffect && curr.type === TokenTypes.BOX_SHADOW,
      ].some((isEnabled) => isEnabled);
      if (shouldCreate) {
        if (!acc.find((token) => curr.name === token.name)) {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    const createStylesResult = await wrapTransaction({ name: 'createStyles' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_STYLES,
      tokens: tokensToCreate,
      settings,
    }));

    dispatch.tokenState.assignStyleIdsToCurrentTheme(createStylesResult.styleIds, tokensToCreate);
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATE_STYLES);
  }, [tokens, settings, dispatch.tokenState, dispatch.uiState]);

  const createStylesFromSelectedThemes = useCallback(async (selectedThemes: string[]) => {
    const shouldCreateStyles = ((settings.stylesTypography || settings.stylesColor || settings.stylesEffect) && selectedThemes.length > 0);
    if (!shouldCreateStyles) return;

    track('createStyles', {
      textStyles: settings.stylesTypography,
      colorStyles: settings.stylesColor,
      effectStyles: settings.stylesEffect,
    });

    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATE_STYLES,
      isInfinite: true,
    });

    const selectedSets = themes.reduce((acc, curr) => {
      if (selectedThemes.includes(curr.id)) {
        acc = {
          ...acc,
          ...curr.selectedTokenSets,
        };
      }
      return acc;
    }, {});

    const enabledTokenSets = Object.keys(selectedSets)
      .filter((key) => selectedSets[key] === TokenSetStatus.ENABLED)
      .map((tokenSet) => tokenSet);

    if (enabledTokenSets.length === 0) {
      notifyToUI('No styles created. Make sure themes are active.', { error: true });
      return;
    }

    const tokensToResolve = Object.keys(selectedSets).flatMap((key) => mergeTokenGroups(tokens, { [key]: TokenSetStatus.ENABLED }));

    const resolved = defaultTokenResolver.setTokens(tokensToResolve);
    const withoutSourceTokens = resolved.filter((token) => (
      !token.internal__Parent || enabledTokenSets.includes(token.internal__Parent) // filter out SOURCE tokens
    ));

    const tokensToCreate = withoutSourceTokens.reduce((acc: SingleToken[], curr) => {
      const shouldCreate = [
        settings.stylesTypography && curr.type === TokenTypes.TYPOGRAPHY,
        settings.stylesColor && curr.type === TokenTypes.COLOR,
        settings.stylesEffect && curr.type === TokenTypes.BOX_SHADOW,
      ].some((isEnabled) => isEnabled);
      if (shouldCreate) {
        if (!acc.find((token) => curr.name === token.name)) {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    const createStylesResult = await wrapTransaction({ name: 'createStyles' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_STYLES,
      tokens: tokensToCreate,
      settings,
    }));

    dispatch.tokenState.assignStyleIdsToCurrentTheme(createStylesResult.styleIds, tokensToCreate);
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATE_STYLES);
  }, [dispatch.tokenState, tokens, settings, themes, dispatch.uiState]);

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

      const syncStyleResult = await wrapTransaction({ name: 'syncStyles' }, async () => AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SYNC_STYLES,
        tokens,
        options: {
          renameStyle: userConfirmation.data.includes('renameStyles'),
          removeStyle: userConfirmation.data.includes('removeStyles'),
        },
        settings,
      }));

      dispatch.tokenState.removeStyleIdsFromThemes(syncStyleResult.styleIdsToRemove);
    }
  }, [confirm, tokens, dispatch.tokenState, settings]);

  const renameStylesFromTokens = useCallback(async (tokensToRename: TokensToRenamePayload[], parent: string) => {
    track('renameStyles', { tokensToRename, parent });

    const renameStylesResult = await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.RENAME_STYLES,
      tokensToRename,
      parent,
      settings,
    });
    dispatch.tokenState.renameStyleIdsToCurrentTheme(renameStylesResult.styleIds, tokensToRename);
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
  }, [store]);

  const filterMultiValueTokens = useCallback(() => {
    const tempTokens = Object.entries(tokens).reduce((tempTokens, [tokenSetKey, tokenList]) => {
      const filteredTokenList = tokenList.reduce((acc, tokenItem) => {
        const resolvedValue = getAliasValue(tokenItem, tokensContext.resolvedTokens) || '';
        // If extension data exists, it is likely that the token is a complex token containing color modifier data, etc
        // in which case we collapse the value as it cannot be used as a variable
        if ((tokenItem.$extensions || {})['studio.tokens'] && typeof resolvedValue === 'string') {
          // We don't want to change the actual value as this could cause unintended side effects
          tokenItem = { ...tokenItem };
          tokenItem.value = resolvedValue;
        }
        if (typeof tokenItem.value === 'string' && VALID_TOKEN_TYPES.includes(tokenItem.type)) {
          if (resolvedValue.toString().trim().includes(' ')) {
            return acc;
          }
        }
        acc.push(tokenItem);
        return acc;
      }, [] as AnyTokenList);
      tempTokens[tokenSetKey] = filteredTokenList;
      return tempTokens;
    }, {} as Record<string, AnyTokenList>);

    return tempTokens;
  }, [tokens]);

  const createVariables = useCallback(async () => {
    track('createVariables');
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATEVARIABLES,
      isInfinite: true,
    });
    const multiValueFilteredTokens = filterMultiValueTokens();
    const createVariableResult = await wrapTransaction({
      name: 'createVariables',
      statExtractor: async (result, transaction) => {
        const data = await result;
        if (data) {
          transaction.setMeasurement('variables', data.totalVariables, '');
        }
      },
    }, async () => await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LOCAL_VARIABLES,
      tokens: multiValueFilteredTokens,
      settings,
    }));
    dispatch.tokenState.assignVariableIdsToTheme(createVariableResult.variableIds);
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATEVARIABLES);
  }, [dispatch.tokenState, dispatch.uiState, tokens, settings]);

  const createVariablesFromSets = useCallback(async (selectedSets: ExportTokenSet[]) => {
    const shouldCreateVariables = ((settings.variablesBoolean || settings.variablesColor || settings.variablesNumber || settings.variablesString) && (selectedSets.length > 0));
    if (!shouldCreateVariables) return;

    track('createVariables');
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATEVARIABLES,
      isInfinite: true,
    });
    const selectedSetNames = selectedSets.map((set) => set.set);
    const selectedSetsTokens = Object.entries(tokens).reduce((tempTokens, [tokenSetKey, tokenList]) => {
      if (selectedSetNames.includes(tokenSetKey)) {
        tempTokens[tokenSetKey] = tokenList;
      }
      return tempTokens;
    }, {} as Record<string, AnyTokenList>);
    await wrapTransaction({
      name: 'createVariables',
      statExtractor: async (result, transaction) => {
        const data = await result;
        if (data) {
          transaction.setMeasurement('variables', data.totalVariables, '');
        }
      },
    }, async () => await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LOCAL_VARIABLES_WITHOUT_MODES,
      tokens: selectedSetsTokens,
      settings,
      selectedSets,
    }));
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATEVARIABLES);
    Promise.resolve();
  }, [dispatch.uiState, tokens, settings]);

  const createVariablesFromThemes = useCallback(async (selectedThemes: string[]) => {
    const shouldCreateVariables = ((settings.variablesBoolean || settings.variablesColor || settings.variablesNumber || settings.variablesString) && (selectedThemes.length > 0));
    if (!shouldCreateVariables) return;

    track('createVariablesFromThemes', { selectedThemes });
    dispatch.uiState.startJob({
      name: BackgroundJobs.UI_CREATEVARIABLES,
      isInfinite: true,
    });
    const createVariableResult = await wrapTransaction({
      name: 'createVariables',
      statExtractor: async (result, transaction) => {
        const data = await result;
        if (data) {
          transaction.setMeasurement('variables', data.totalVariables, '');
        }
      },
    }, async () => await AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CREATE_LOCAL_VARIABLES,
      tokens,
      settings,
      selectedThemes,
    }));
    dispatch.tokenState.assignVariableIdsToTheme(createVariableResult.variableIds);
    dispatch.uiState.completeJob(BackgroundJobs.UI_CREATEVARIABLES);
    Promise.resolve();
  }, [dispatch.tokenState, dispatch.uiState, tokens, settings]);

  const renameVariablesFromToken = useCallback(async ({ oldName, newName }: TokenToRename) => {
    track('renameVariables', { oldName, newName });

    const result = await wrapTransaction({ name: 'renameVariables' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.RENAME_VARIABLES,
      tokens: [{
        oldName,
        newName,
      }],
    }));

    dispatch.tokenState.renameVariableIdsToTheme(result.renameVariableToken);
  }, [dispatch.tokenState]);

  const syncVariables = useCallback(async () => {
    const userConfirmation = await confirm({
      text: 'Sync variables',
      description: 'This will try to rename any variables that were connected via Tokens and try to remove any variables that are not connected to any token.',
      choices: [
        { key: 'removeVariables', label: 'Remove variables without connection' },
        { key: 'renameVariables', label: 'Rename variables' },
      ],
    }) as ResolveCallbackPayload<any>;

    if (userConfirmation) {
      track('syncVariables', userConfirmation.data);

      await wrapTransaction({ name: 'syncVariables' }, async () => AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.SYNC_VARIABLES,
        tokens,
        options: {
          renameVariable: userConfirmation.data.includes('renameVariables'),
          removeVariable: userConfirmation.data.includes('removeVariables'),
        },
        settings,
      }));
    }
  }, [confirm, tokens, settings]);

  const updateVariablesFromToken = useCallback(async (payload: UpdateTokenVariablePayload) => {
    track('updateVariables', payload);

    await wrapTransaction({ name: 'updateVariables' }, async () => AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.UPDATE_VARIABLES,
      payload,
    }));
  }, []);

  return useMemo(() => ({
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromSelectedTokenSets,
    createStylesFromSelectedThemes,
    pullStyles,
    pullVariables,
    remapToken,
    remapTokensInGroup,
    remapTokensWithOtherReference,
    removeTokensByValue,
    handleRemap,
    renameStylesFromTokens,
    handleBulkRemap,
    removeStylesFromTokens,
    syncStyles,
    setNoneValuesOnNode,
    handleUpdate,
    handleJSONUpdate,
    createVariables,
    createVariablesFromSets,
    renameVariablesFromToken,
    createVariablesFromThemes,
    syncVariables,
    updateVariablesFromToken,
    filterMultiValueTokens,
  }), [
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    createStylesFromSelectedTokenSets,
    createStylesFromSelectedThemes,
    pullStyles,
    pullVariables,
    remapToken,
    remapTokensInGroup,
    remapTokensWithOtherReference,
    removeTokensByValue,
    handleRemap,
    renameStylesFromTokens,
    handleBulkRemap,
    removeStylesFromTokens,
    syncStyles,
    setNoneValuesOnNode,
    handleUpdate,
    handleJSONUpdate,
    createVariables,
    createVariablesFromSets,
    createVariablesFromThemes,
    renameVariablesFromToken,
    syncVariables,
    updateVariablesFromToken,
    filterMultiValueTokens,
  ]);
}
