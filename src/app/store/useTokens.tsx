import {postToFigma} from '@/plugin/notifiers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from 'Types/messages';
import checkIfAlias from '@/utils/checkIfAlias';
import {SingleTokenObject} from 'Types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import {mergeTokenGroups, resolveTokenValues} from '@/plugin/tokenHelpers';
import {SelectionValue} from './models/tokenState';
import {RootState} from '../store';
import useConfirm from '../hooks/useConfirm';

export default function useTokens() {
    const {tokens, usedTokenSet, activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const settings = useSelector((state: RootState) => state.settings);
    const {confirm} = useConfirm();

    // Finds token that matches name
    function findToken(name: string) {
        const resolved = resolveTokenValues(mergeTokenGroups(tokens, [...usedTokenSet, activeTokenSet]));

        return resolved.find((n) => n.name === name);
    }

    // Gets value of token
    function getTokenValue(token: SingleTokenObject, resolved) {
        return resolved.find((t) => t.name === token.name).value;
    }

    // Returns resolved value of a specific token
    function isAlias(token: SingleTokenObject, resolvedTokens) {
        return checkIfAlias(token, resolvedTokens);
    }

    // Calls Figma with all tokens and nodes to set data on
    function setNodeData(data: SelectionValue, resolvedTokens) {
        postToFigma({
            type: MessageToPluginTypes.SET_NODE_DATA,
            values: data,
            tokens: resolvedTokens,
            settings,
        });
    }

    // Returns formatted tokens for style dictionary
    function getFormattedTokens() {
        return formatTokens(tokens, activeTokenSet);
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
                {key: 'colorStyles', label: 'Color', enabled: true},
                {key: 'textStyles', label: 'Text', enabled: true},
                {key: 'effectStyles', label: 'Shadows', enabled: true},
            ],
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

    // Calls Figma with a specific node to remove node data
    function removeNodeData(data?: string) {
        postToFigma({
            type: MessageToPluginTypes.REMOVE_NODE_DATA,
            key: data,
        });
    }

    // Calls Figma with all tokens to create styles
    function createStylesFromTokens() {
        const resolved = resolveTokenValues(mergeTokenGroups(tokens, usedTokenSet));
        const withoutIgnored = resolved.filter((token) => {
            return !token.name.split('.').some((part) => part.startsWith('_'));
        });

        postToFigma({
            type: MessageToPluginTypes.CREATE_STYLES,
            tokens: withoutIgnored,
            settings,
        });
    }

    return {
        isAlias,
        getTokenValue,
        findToken,
        getFormattedTokens,
        getStringTokens,
        setNodeData,
        removeNodeData,
        createStylesFromTokens,
        pullStyles,
    };
}
