import {getMergedTokens} from '@/plugin/tokenHelpers';
import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import checkIfValueToken from '@/utils/checkIfValueToken';
import * as React from 'react';
import {useTokenState} from './TokenContext';

export default function useReadTokens() {
    const {tokens, usedTokenSet} = useTokenState();

    const memoizedTokens = React.useMemo(() => getMergedTokens(tokens, usedTokenSet, true), [tokens, usedTokenSet]);

    function getTokenValue(token: string) {
        const mergedTokens = memoizedTokens;
        if (checkIfAlias(token, mergedTokens)) {
            return getAliasValue(token, mergedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    return {getTokenValue};
}
