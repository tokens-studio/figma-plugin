import {postToFigma} from '@/plugin/notifiers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from 'Types/messages';
import checkIfAlias from '@/utils/checkIfAlias';
import {getAliasValue} from '@/utils/aliases';
import {SingleToken, SingleTokenObject} from 'Types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import {computeMergedTokens, resolveTokenValues} from '@/plugin/tokenHelpers';
import {SelectionValue} from './models/tokenState';
import {RootState} from '../store';

export default function useTokens() {
    const {tokens, usedTokenSet, activeTokenSet} = useSelector((state: RootState) => state.tokenState);

    // Finds token that matches name
    function findToken(token: string, resolved) {
        return resolved.find((n) => n.name === token);
    }
    // Finds token that matches name
    function getTokenValue(token: SingleTokenObject, resolved) {
        return getAliasValue(token, resolved);
    }

    function getTokenDisplay(token: SingleTokenObject, resolvedTokens, shouldResolve = false) {
        const valueToCheck = shouldResolve ? findToken(token.name, resolvedTokens).value : token.value;

        if (token.type === 'typography') {
            return `${valueToCheck.fontFamily} / ${valueToCheck.fontWeight}`;
        }
        if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
            return JSON.stringify(valueToCheck, null, 2);
        }

        return valueToCheck;
    }

    // Returns resolved value of a specific token
    function isAlias(token: SingleToken, resolvedTokens) {
        return checkIfAlias(token, resolvedTokens);
    }

    // Calls Figma with all tokens and nodes to set data on
    function setNodeData(data: SelectionValue, resolvedTokens) {
        console.group('Posting to figma', data, resolvedTokens);
        postToFigma({
            type: MessageToPluginTypes.SET_NODE_DATA,
            values: data,
            tokens: resolvedTokens,
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
    function pullStyles() {
        postToFigma({
            type: MessageToPluginTypes.PULL_STYLES,
            styleTypes: {
                textStyles: true,
                colorStyles: true,
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
        const resolved = resolveTokenValues(computeMergedTokens(tokens, usedTokenSet));
        postToFigma({
            type: MessageToPluginTypes.CREATE_STYLES,
            tokens: resolved,
        });
    }

    return {
        isAlias,
        getTokenValue,
        findToken,
        getTokenDisplay,
        getFormattedTokens,
        getStringTokens,
        setNodeData,
        removeNodeData,
        createStylesFromTokens,
        pullStyles,
    };
}
