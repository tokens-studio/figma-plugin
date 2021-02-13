/* eslint-disable class-methods-use-this */
import JSON5 from 'json5';
import objectPath from 'object-path';
import {mergeDeep} from '../../plugin/helpers';
import {convertToRgb, checkAndEvaluateMath} from './utils';

export interface TokenProps {
    values: {
        [key: string]: string;
    };
    updatedAt: string;
    version: string;
}

type SingleToken = string | number | TokenGroup;

interface TokenGroup {
    [key: string]: SingleToken;
}

export interface Tokens {
    [key: string]: TokenObject;
}

export interface TokenObject {
    hasErrored?: boolean;
    values: string;
}

export default class TokenData {
    mergedTokens: TokenGroup;

    tokens: Tokens;

    updatedAt: string;

    constructor(data: TokenProps) {
        this.setTokens(data);
        this.setMergedTokens();
    }

    setTokens(tokens: TokenProps): void {
        const parsed = this.parseTokenValues(tokens);
        this.setUpdatedAt(tokens.updatedAt);
        if (!parsed) return;
        this.tokens = parsed;
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

    injectTokens(tokens): void {
        const receivedStyles = {};
        Object.entries(tokens).map(([parent, values]: [string, SingleToken[]]) => {
            values.map((token: TokenGroup) => {
                mergeDeep(receivedStyles, {[parent]: this.convertDotPathToNestedObject(token[0], token[1])});
            });
        });
        const newTokens = mergeDeep(JSON5.parse(this.tokens.options.values), receivedStyles);
        this.tokens.options.values = JSON.stringify(newTokens, null, 2);
        this.setMergedTokens();
    }

    setMergedTokens(): void {
        this.mergedTokens = mergeDeep(
            {},
            ...Object.entries(this.tokens).reduce((acc, cur) => {
                acc.push(JSON5.parse(cur[1].values));
                return acc;
            }, [])
        );

        this.setAllAliases();
    }

    updateTokenValues(parent: string, tokens: string, updatedAt: string): void {
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

    private checkIfAlias(token: SingleToken): boolean {
        return typeof token === 'string' && token.includes('$') && token.length > 1;
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

    setAllAliases(): void {
        const aliases = this.findAllAliases({arr: Object.entries(this.mergedTokens)});

        if (aliases.length > 0) {
            aliases.forEach((alias) => {
                this.setResolvedAlias(this.mergedTokens, alias[0], this.getAliasValue(alias[1], this.mergedTokens));
            });
        }
    }

    getAliasValue(token: SingleToken, tokens = this.mergedTokens): string | null {
        if (this.checkIfAlias(token) && typeof token === 'string') {
            let returnedValue = token;
            const tokenRegex = /(\$[^\s,]+)/g;
            const tokenReferences = token.match(tokenRegex);
            if (tokenReferences.length > 0) {
                const resolvedReferences = tokenReferences.map((ref) => objectPath.get(tokens, ref.substring(1)));
                tokenReferences.forEach((reference, index) => {
                    returnedValue = returnedValue.replace(reference, resolvedReferences[index]);
                });
            }
            return convertToRgb(checkAndEvaluateMath(returnedValue));
        }
        return null;
    }

    setResolvedAlias(tokens: TokenGroup, target: string, source: string): void {
        objectPath.set(tokens, target, source);
    }
}
