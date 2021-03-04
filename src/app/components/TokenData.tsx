/* eslint-disable class-methods-use-this */
import JSON5 from 'json5';
import objectPath from 'object-path';
import {mergeDeep} from '../../plugin/helpers';
import {SingleToken, TokenGroup, TokenObject, TokenProps, Tokens} from '../../types/tokens';
import {convertToRgb, checkAndEvaluateMath} from './utils';

export default class TokenData {
    mergedTokens: TokenGroup;

    tokens: Tokens;

    usedTokenSet: string[];

    updatedAt: string;

    constructor(data: TokenProps) {
        this.setTokens(data);
        this.setMergedTokens();
    }

    setTokens(tokens: TokenProps): void {
        const parsed = this.parseTokenValues(tokens);
        this.setUpdatedAt(tokens.updatedAt || new Date().toString());
        if (!parsed) return;

        this.tokens = parsed;
        this.setUsedTokenSet([Object.keys(parsed)[0]]);
    }

    private checkTokenValidity(tokens: string): boolean {
        try {
            JSON5.parse(tokens);
            return false;
        } catch (e) {
            return true;
        }
    }

    private parseTokenValues(tokens: TokenProps): Tokens | null {
        try {
            const reducedTokens = Object.entries(tokens.values).reduce((prev, group) => {
                prev.push({[group[0]]: {values: group[1]}});
                return prev;
            }, []);

            const assigned = Object.assign({}, ...reducedTokens);

            return assigned;
        } catch (e) {
            console.error('Error reading tokens', e);
            console.log("Here's the tokens");
            console.log(tokens);
            return null;
        }
    }

    convertDotPathToNestedObject(path, value) {
        const [last, ...paths] = path.toString().split('/').reverse();
        return paths.reduce((acc, el) => ({[el]: acc}), {[last]: value});
    }

    injectTokens(tokens, activeTokenSet): void {
        const receivedStyles = {};
        Object.entries(tokens).map(([parent, values]: [string, SingleToken[]]) => {
            values.map((token: TokenGroup) => {
                mergeDeep(receivedStyles, {[parent]: this.convertDotPathToNestedObject(token[0], token[1])});
            });
        });
        const newTokens = mergeDeep(JSON5.parse(this.tokens.options.values), receivedStyles);
        this.tokens[activeTokenSet].values = JSON.stringify(newTokens, null, 2);
        this.setMergedTokens();
    }

    addTokenSet(tokenSet: string, updatedAt): boolean {
        if (tokenSet in this.tokens) {
            console.log('key already exists');
            return false;
        }
        this.updateTokenValues(tokenSet, JSON.stringify({}), updatedAt);
        return true;
    }

    deleteTokenSet(tokenSet: string, updatedAt): void {
        if (tokenSet in this.tokens) {
            console.log('deleting token set');
            this.updateTokenValues(tokenSet, null, updatedAt);
        }
    }

    renameTokenSet({oldName, newName, updatedAt}): boolean {
        if (newName in this.tokens) {
            console.log('Key already exists');
            return false;
        }
        const newObj = this.tokens[oldName];
        console.log('new obj', newObj);
        this.updateTokenValues(newName, JSON.stringify(newObj, null, 2), updatedAt);
        this.updateTokenValues(oldName, null, updatedAt);
        return true;
    }

    setUsedTokenSet(usedTokenSet: string[]): void {
        this.usedTokenSet = usedTokenSet;
        this.setMergedTokens();
    }

    setMergedTokens(): void {
        if (Object.entries(this.tokens)) {
            this.mergedTokens = mergeDeep(
                {},
                ...Object.entries(this.tokens).reduce((acc, cur) => {
                    if (this.usedTokenSet.includes(cur[0])) acc.push(JSON5.parse(cur[1].values));
                    return acc;
                }, [])
            );

            this.setAllAliases();
        }
    }

    updateTokenValues(parent: string, tokens: string, updatedAt: string): void {
        if (tokens) {
            console.log('got tokens');
            const hasErrored: boolean = this.checkTokenValidity(tokens);
            const newTokens = {
                ...this.tokens,
                [parent]: {
                    hasErrored,
                    values: tokens,
                },
            };
            this.setUpdatedAt(updatedAt);
            this.tokens = newTokens;
            if (!hasErrored) {
                this.setMergedTokens();
            }
        } else {
            const oldTokens = this.tokens;
            delete oldTokens[parent];
        }
    }

    getTokens() {
        return this.tokens;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setUpdatedAt(value: string) {
        this.updatedAt = value;
    }

    reduceToValues() {
        const reducedTokens = Object.entries(this.tokens).reduce((prev, group) => {
            prev.push({[group[0]]: group[1].values});
            return prev;
        }, []);

        const assigned = mergeDeep({}, ...reducedTokens);

        return assigned;
    }

    getMergedTokens(): TokenGroup {
        return this.mergedTokens;
    }

    private checkIfValueToken(token: SingleToken): token is {value: string | number} {
        return typeof token === 'object' && (typeof token?.value === 'string' || typeof token?.value === 'number');
    }

    private checkIfValueTokenAlias(token: SingleToken): boolean {
        if (this.checkIfValueToken(token)) {
            return token.value.toString().includes('$') && token.value.toString().length > 1;
        }
        return false;
    }

    private checkIfAlias(token: SingleToken): boolean {
        let aliasToken = false;
        if (typeof token === 'string') {
            aliasToken = token.includes('$') && token.length > 1;
        } else {
            aliasToken = this.checkIfValueTokenAlias(token);
        }
        // Check if alias is found
        if (aliasToken) {
            const tokenToCheck = this.checkIfValueToken(token) ? token.value : token;
            return Boolean(this.getAliasValue(tokenToCheck, this.mergedTokens));
        }
        return false;
    }

    private findAllAliases({
        key = null,
        arr = Object.entries(this.tokens),
    }: {
        key?: string;
        arr?: [string, SingleToken | TokenObject][];
    }) {
        return arr.reduce((prev, el) => {
            if (typeof el[1] === 'object') {
                const newKey = key ? [key, el[0]].join('.') : el[0];
                prev.push(...this.findAllAliases({key: newKey, arr: Object.entries(el[1])}));
            } else if (this.checkIfAlias(el[1])) {
                const obj = [`${key}.${el[0]}`, el[1]];
                prev.push(obj);
                return prev;
            }
            return prev;
        }, []);
    }

    setAllAliases(aliasArray = Object.entries(this.mergedTokens)): void {
        const aliases = this.findAllAliases({arr: aliasArray});

        if (aliases.length > 0) {
            aliases.forEach((alias) => {
                this.setResolvedAlias(this.mergedTokens, alias[0], this.getAliasValue(alias[1], this.mergedTokens));
            });
            this.setAllAliases();
        }
    }

    getAliasValue(token: SingleToken, tokens = this.mergedTokens): string | null {
        let returnedValue = this.checkIfValueToken(token) ? (token.value as string) : (token as string);
        const tokenRegex = /(\$[^\s,]+)/g;
        const tokenReferences = returnedValue.toString().match(tokenRegex);
        if (tokenReferences.length > 0) {
            const resolvedReferences = tokenReferences.map((ref) => {
                const value = objectPath.get(tokens, ref.substring(1));
                if (value) return value;
                return null;
            });
            tokenReferences.forEach((reference, index) => {
                returnedValue = returnedValue.replace(
                    reference,
                    resolvedReferences[index]?.value ?? resolvedReferences[index]
                );
            });
        }
        if (returnedValue) {
            return convertToRgb(checkAndEvaluateMath(returnedValue));
        }
        return null;
    }

    getTokenValue(token: SingleToken): string | null {
        if (this.checkIfAlias(token)) {
            return this.getAliasValue(token);
        }
        return String(this.checkIfValueToken(token) ? token.value : token);
    }

    setResolvedAlias(tokens: TokenGroup, target: string, source: string): void {
        objectPath.set(tokens, target, source);
    }

    getResolvedAlias(tokens: TokenGroup, token: string): string {
        try {
            return objectPath.get(tokens, token);
        } catch (e) {
            console.log('error', e);
        }
        return null;
    }
}
