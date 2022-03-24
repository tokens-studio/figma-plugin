import { useSelector } from 'react-redux';
import { postToFigma } from '@/plugin/notifiers';
import { MessageToPluginTypes } from '@/types/messages';
import checkIfAlias from '@/utils/checkIfAlias';
import {
  AnyTokenList,
  SingleToken,
} from '@/types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import { UpdateMode } from '@/types/state';
import { RootState } from '../store';
import useConfirm from '../hooks/useConfirm';
import { Properties } from '@/constants/Properties';
import { track } from '@/utils/analytics';
import { SelectionValue } from '@/types';

export default function useTokens() {
  const { tokens, usedTokenSet, activeTokenSet } = useSelector((state: RootState) => state.tokenState);
  const settings = useSelector((state: RootState) => state.settings);
  const { confirm } = useConfirm();

  // Gets value of token
  function getTokenValue(name: string, resolved) {
    return resolved.find((t) => t.name === name);
  }

  // Returns resolved value of a specific token
  function isAlias(token: SingleToken, resolvedTokens) {
    return checkIfAlias(token, resolvedTokens);
  }

  // Calls Figma with all tokens and nodes to set data on
  function setNodeData(data: SelectionValue, resolvedTokens: AnyTokenList) {
    postToFigma({
      type: MessageToPluginTypes.SET_NODE_DATA,
      values: data,
      tokens: resolvedTokens,
      settings,
    });
  }

  // Returns formatted tokens for style dictionary
  function getFormattedTokens({ includeAllTokens = false, includeParent = true, expandTypography = false }) {
    const tokenSets = includeAllTokens ? Object.keys(tokens) : [activeTokenSet];
    return formatTokens({
      tokens, tokenSets, includeAllTokens, includeParent, expandTypography,
    });
  }

  // Returns stringified tokens for the JSON editor
  function getStringTokens() {
    return stringifyTokens(tokens, activeTokenSet);
  }

  // Calls Figma asking for all local text- and color styles
  async function pullStyles() {
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

    if (userDecision && userDecision.data.length) {
      track('Import styles', {
        textStyles: userDecision.data.includes('textStyles'),
        colorStyles: userDecision.data.includes('colorStyles'),
        effectStyles: userDecision.data.includes('effectStyles'),
      });

      postToFigma({
        type: MessageToPluginTypes.PULL_STYLES,
        styleTypes: {
          textStyles: userDecision.data.includes('textStyles'),
          colorStyles: userDecision.data.includes('colorStyles'),
          effectStyles: userDecision.data.includes('effectStyles'),
        },
      });
    }
  }

  function removeTokensByValue(data: { property: Properties; nodes: string[] }[]) {
    track('removeTokensByValue', { count: data.length });

    postToFigma({
      type: MessageToPluginTypes.REMOVE_TOKENS_BY_VALUE,
      tokensToRemove: data,
    });
  }

  async function handleRemap(type: Properties, name: string) {
    const userDecision = await confirm({
      text: `Choose a new token for ${name}`,
      input: {
        type: 'text',
        placeholder: 'New token name',
      },
      confirmAction: 'Remap',
    });

    if (userDecision) {
      track('remapToken', { fromInspect: true });

      postToFigma({
        type: MessageToPluginTypes.REMAP_TOKENS,
        category: type,
        oldName: name,
        newName: userDecision.data,
        updateMode: UpdateMode.SELECTION,
      });
    }
  }

  // Calls Figma with an old name and new name and asks it to update all tokens that use the old name
  async function remapToken(oldName: string, newName: string, updateMode?: UpdateMode) {
    track('remapToken', { fromRename: true });

    postToFigma({
      type: MessageToPluginTypes.REMAP_TOKENS,
      oldName,
      newName,
      updateMode: updateMode || settings.updateMode,
    });
  }

  // Calls Figma with all tokens to create styles
  function createStylesFromTokens() {
    track('createStyles');

    const resolved = resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet));
    const withoutIgnored = resolved.filter((token) => !token.name.split('.').some((part) => part.startsWith('_')));

    postToFigma({
      type: MessageToPluginTypes.CREATE_STYLES,
      tokens: withoutIgnored,
      settings,
    });
  }

  return {
    isAlias,
    getTokenValue,
    getFormattedTokens,
    getStringTokens,
    setNodeData,
    createStylesFromTokens,
    pullStyles,
    remapToken,
    removeTokensByValue,
    handleRemap,
  };
}
