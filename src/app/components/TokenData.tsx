/* eslint-disable class-methods-use-this */
import JSON5 from 'json5';
import objectPath from 'object-path';
import {mergeDeep} from '../../plugin/helpers';

interface Token {
    [key: string]: string | number | Token;
}

export interface TokenProps {
    values: RawTokenGroup;
    version: string;
}

interface RawTokenGroup {
    [key: string]: RawToken;
}

interface RawToken {
    [key: string]: string;
}

interface Tokens {
    [key: string]: TokenGroup;
}

interface TokenGroup {
    hasErrored?: boolean;
    values: Token;
}

export default class TokenData {
    mergedTokens: Token;

    tokens: Tokens;

    constructor(data: TokenProps) {
        this.setTokens(data);
        this.setMergedTokens();
    }

    private setTokens(tokens: TokenProps): void {
        const parsed = this.parseTokenValues(tokens);
        if (!parsed) return;
        this.tokens = parsed;
    }

    private checkTokenValidity(tokens: Token): boolean {
        try {
            JSON5.parse(tokens);
            return false;
        } catch (e) {
            return true;
        }
    }

    private parseTokenValues(tokens: TokenProps): Tokens | null {
        if (tokens.version !== '') {
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
        } else {
            return {
                options: {
                    values: JSON5.stringify(tokens.values, null, 2),
                },
            };
        }
    }

    setMergedTokens(): void {
        const mergedTokens = mergeDeep(
            {},
            ...Object.entries(this.tokens).reduce((acc, cur) => {
                acc.push(JSON5.parse(cur[1].values));
                return acc;
            }, [])
        );

        this.setAllAliases(mergedTokens);

        this.mergedTokens = mergedTokens;
    }

    updateTokenValues(parent: string, tokens: Token): void {
        this.tokens = {
            ...this.tokens,
            [parent]: {
                hasErrored: this.checkTokenValidity(tokens),
                values: tokens,
            },
        };
        this.setMergedTokens();
    }

    getTokens() {
        return this.tokens;
    }

    reduceToValues() {
        const reducedTokens = Object.entries(this.tokens).reduce((prev, group) => {
            prev.push({[group[0]]: group[1].values});
            return prev;
        }, []);

        const assigned = mergeDeep({}, ...reducedTokens);

        return assigned;
    }

    getMergedTokens(): Token {
        return this.mergedTokens;
    }

    private checkIfAlias(token: Token): boolean {
        return typeof token === 'string' && token.startsWith('$');
    }

    private findAllAliases({
        key = null,
        arr = Object.entries(this.tokens),
    }: {
        key: string;
        arr: [string, TokenGroup][];
    }) {
        return arr.reduce((prev, el) => {
            if (this.checkIfAlias(el[1])) {
                const obj = [`${key}.${el[0]}`, el[1]];
                prev.push(obj);
                return prev;
            }
            if (typeof el[1] === 'object') {
                const newKey = key ? [key, el[0]].join('.') : el[0];
                prev.push(...this.findAllAliases({key: newKey, arr: Object.entries(el[1])}));
            }
            return prev;
        }, []);
    }

    setAllAliases(mergedTokens: Token): void {
        const aliases = this.findAllAliases({arr: Object.entries(mergedTokens)});

        if (aliases.length > 0) {
            aliases.forEach((alias) => {
                this.setResolvedAlias(mergedTokens, alias[0], this.getAliasValue(alias[1], mergedTokens));
            });
        }
    }

    getAliasValue(token: Token, tokens = this.mergedTokens): string | null {
        if (this.checkIfAlias(token)) {
            return objectPath.get(tokens, token.substring(1));
        }
        return null;
    }

    setResolvedAlias(tokens, target, source): void {
        objectPath.set(tokens, target, source);
    }
}
