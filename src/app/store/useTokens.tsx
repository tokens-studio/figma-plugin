import {postToFigma} from '@/plugin/notifiers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from 'Types/messages';
import React from 'react';
import checkIfAlias from '@/utils/checkIfAlias';
import {getAliasValue} from '@/utils/aliases';
import {computeMergedTokens} from '@/plugin/tokenHelpers';
import {SingleToken} from '@types/tokens';
import {SingleTokenObject} from 'Types/tokens';
import stringifyTokens from '@/utils/stringifyTokens';
import formatTokens from '@/utils/formatTokens';
import {SelectionValue} from './models/tokenState';
import {RootState} from '../store';

export default function useTokens() {
    const {tokens, usedTokenSet, activeTokenSet} = useSelector((state: RootState) => state.tokenState);

    // Return tokens that are included in currently active token set and optionally resolve all aliases
    const resolvedTokens = React.useMemo(() => computeMergedTokens(tokens, usedTokenSet, true), [tokens, usedTokenSet]);

    // Finds token that matches name
    function findToken(token: string) {
        return resolvedTokens.find((n) => n.name === token);
    }

    // Returns resolved value of a specific token
    function getTokenValue(token: SingleTokenObject) {
        if (checkIfAlias(token, resolvedTokens)) {
            return getAliasValue(token, resolvedTokens);
        }
        return String(token.value);
    }

    function getTokenDisplay(token: SingleTokenObject, shouldResolve = false) {
        const valueToCheck = shouldResolve ? findToken(token.name).value : token.value;

        if (token.type === 'typography') {
            return `${valueToCheck.fontFamily} / ${valueToCheck.fontWeight}`;
        }
        if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
            return JSON.stringify(valueToCheck, null, 2);
        }

        return valueToCheck;
    }

    // Returns resolved value of a specific token
    function isAlias(token: SingleToken) {
        return checkIfAlias(token, resolvedTokens);
    }

    // Calls Figma with all tokens and nodes to set data on
    function setNodeData(data: SelectionValue) {
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
        postToFigma({
            type: MessageToPluginTypes.CREATE_STYLES,
            tokens: resolvedTokens,
        });
    }

    return {
        isAlias,
        findToken,
        getTokenDisplay,
        getFormattedTokens,
        getStringTokens,
        setNodeData,
        removeNodeData,
        getTokenValue,
        createStylesFromTokens,
        pullStyles,
    };
}
