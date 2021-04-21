import {postToFigma} from '@/plugin/notifiers';
import {getMergedTokens, reduceToValues} from '@/plugin/tokenHelpers';
import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import checkIfValueToken from '@/utils/checkIfValueToken';
import * as React from 'react';
import {useSelector} from 'react-redux';
import {MessageToPluginTypes} from '@types/messages';
import {RootState} from '../store';

export default function useReadTokens() {
    const {tokens, usedTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {updatePageOnly} = useSelector((state: RootState) => state.settings);

    const memoizedTokens = React.useMemo(() => getMergedTokens(tokens, usedTokenSet, true), [tokens, usedTokenSet]);

    function getTokenValue(token: string) {
        const mergedTokens = memoizedTokens;
        if (checkIfAlias(token, mergedTokens)) {
            return getAliasValue(token, mergedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    function updateTokens() {
        postToFigma({
            type: MessageToPluginTypes.UPDATE,
            tokenValues: reduceToValues(tokens),
            tokens: getMergedTokens(tokens, usedTokenSet, true),
            updatePageOnly,
        });
    }

    return {getTokenValue, updateTokens};
}
