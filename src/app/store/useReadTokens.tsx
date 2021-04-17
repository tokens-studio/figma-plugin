import {getMergedTokens} from '@/plugin/tokenHelpers';
import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import checkIfValueToken from '@/utils/checkIfValueToken';
import {useTokenState} from './TokenContext';

export default function useReadTokens() {
    const {tokens, usedTokenSet} = useTokenState();

    function getTokenValue(token: string) {
        const mergedTokens = getMergedTokens(tokens, usedTokenSet, true);
        if (checkIfAlias(token, mergedTokens)) {
            return getAliasValue(token, mergedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    return {getTokenValue};
}
