import {postToFigma} from '@/plugin/notifiers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from '@types/messages';
import React from 'react';
import checkIfAlias from '@/utils/checkIfAlias';
import {getAliasValue} from '@/utils/aliases';
import {computeMergedTokens} from '@/plugin/tokenHelpers';
import set from 'set-value';
import {SingleToken} from '@types/tokens';
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
    function getTokenValue(token: SingleToken) {
        if (checkIfAlias(token, resolvedTokens)) {
            return getAliasValue(token, resolvedTokens);
        }
        return String(token.value);
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

    // Calls Figma with all tokens and nodes to set data on
    function getFormattedTokens() {
        const tokenObj = {};
        tokens[activeTokenSet].values.forEach((token) => {
            set(tokenObj, token.name, token);
        });

        return JSON.stringify(tokenObj, null, 2);
    }

    // Calls Figma with all tokens and nodes to set data on
    function getStringTokens() {
        console.log('Tokens are', tokens);
        const tokenObj = {};
        tokens[activeTokenSet].values.forEach((token) => {
            const {name, ...tokenWithoutName} = token;
            set(tokenObj, token.name, tokenWithoutName);
        });

        return JSON.stringify(tokenObj, null, 2);
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
        getFormattedTokens,
        getStringTokens,
        setNodeData,
        removeNodeData,
        getTokenValue,
        createStylesFromTokens,
        pullStyles,
    };
}
