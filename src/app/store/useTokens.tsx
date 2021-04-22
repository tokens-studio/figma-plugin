import {postToFigma} from '@/plugin/notifiers';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from '@types/messages';
import React from 'react';
import checkIfAlias from '@/utils/checkIfAlias';
import {getAliasValue} from '@/utils/aliases';
import checkIfValueToken from '@/utils/checkIfValueToken';
import {computeMergedTokens} from '@/plugin/tokenHelpers';
import {SelectionValue} from './models/tokenState';
import {RootState} from '../store';

export default function useTokens() {
    const {tokens, usedTokenSet} = useSelector((state: RootState) => state.tokenState);

    // Return tokens that are included in currently active token set and optionally resolve all aliases
    const resolvedTokens = React.useMemo(() => computeMergedTokens(tokens, usedTokenSet, true), [tokens, usedTokenSet]);

    function getTokenValue(token: string) {
        console.log('getting token value', token, resolvedTokens);
        if (checkIfAlias(token, resolvedTokens)) {
            return getAliasValue(token, resolvedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    // Calls Figma with all tokens and nodes to set data on
    function setNodeData(data: SelectionValue) {
        postToFigma({
            type: MessageToPluginTypes.SET_NODE_DATA,
            values: data,
            tokens: resolvedTokens,
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
        setNodeData,
        removeNodeData,
        getTokenValue,
        createStylesFromTokens,
    };
}
