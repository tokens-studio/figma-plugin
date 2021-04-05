/* eslint-disable class-methods-use-this */
import objectPath from 'object-path';
import set from 'set-value';
import convertToTokenArray from '@/utils/convertTokens';
import checkIfValueToken from '@/utils/checkIfValueToken';
import {getAliasValue} from '@/utils/aliases';
import checkIfAlias from '@/utils/checkIfAlias';
import {mergeDeep} from '../../plugin/helpers';
import {notifyToUI} from '../../plugin/notifiers';
import {SingleToken, TokenGroup, TokenObject, TokenProps, SingleTokenObject, Tokens} from '../../../types/tokens';

function createTokensObject(tokens: SingleTokenObject[]) {
    return tokens.reduce((acc, cur) => {
        if (cur.type && cur.type !== '' && cur.type !== 'undefined') {
            acc[cur.type] = acc[cur.type] || {values: []};
            acc[cur.type].values.push(cur);
        } else {
            const groupName = cur.name.split('.').slice(1, 2).toString();
            acc[groupName] = acc[groupName] || {values: []};
            acc[groupName].values.push(cur);
        }
        return acc;
    }, {});
}

export default class TokenData {
    mergedTokens: SingleTokenObject[];

    tokens: Tokens;

    usedTokenSet: string[];

    updatedAt: string;

    constructor(data: TokenProps) {
        this.setTokens(data);
        this.setMergedTokens();
    }

    setTokens(tokens: TokenProps): void {
        console.log('Got tokens', tokens);
        const parsed = this.parseTokenValues(tokens);
        if (!parsed) return;
        this.tokens = parsed;

        console.log('Initialized tokens', this.tokens);
        this.usedTokenSet = [Object.keys(parsed)[0]];
    }

    private checkTokenValidity(tokens: string): boolean {
        try {
            JSON.parse(tokens);
            return false;
        } catch (e) {
            return true;
        }
    }

    private parseTokenValues(tokens: TokenProps): Tokens | null {
        try {
            this.setUpdatedAt(tokens.updatedAt || new Date().toString());
            // Arcade has one token array
            if (Array.isArray(tokens.values)) {
                return {
                    mainTokens: {
                        type: 'array',
                        values: createTokensObject(tokens.values),
                    },
                };
            }
            const reducedTokens = Object.entries(tokens.values).reduce((prev, group) => {
                const parsedGroup = JSON.parse(group[1]);
                if (typeof parsedGroup === 'object') {
                    const groupValues = [];
                    const convertedToArray = convertToTokenArray({tokens: parsedGroup});
                    convertedToArray.forEach(([key, value]) => {
                        groupValues.push({name: key, ...value});
                    });
                    const convertedGroup = createTokensObject(groupValues);
                    console.log('Converted Group', convertedGroup);
                    prev.push({[group[0]]: {values: convertedGroup}});
                    return prev;
                }
            }, []);

            console.log('reduced tokens is', reducedTokens);

            return Object.assign({}, ...reducedTokens);
        } catch (e) {
            notifyToUI('Error reading tokens, check console (F12)');
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
        const oldValues = JSON.parse(this.tokens[activeTokenSet].values);

        // Iterate over received styles to set a value if no value existed before.
        Object.entries(tokens).map(([parent, values]: [string, SingleToken[]]) => {
            values.map((token: TokenGroup) => {
                const key = `${parent}/${token[0]}`.split('/').join('.');
                const oldValue = objectPath.get(oldValues, key);
                set(receivedStyles, key, oldValue || token[1]);
            });
        });

        // Merge again with old tokens object to preserve tokens that don't exist as styles
        const newTokens = mergeDeep(oldValues, receivedStyles);
        this.tokens[activeTokenSet].values = JSON.stringify(newTokens, null, 2);
        this.setMergedTokens();
    }

    addTokenSet(tokenSet: string, updatedAt): boolean {
        if (tokenSet in this.tokens) {
            notifyToUI('Token set already exists');
            return false;
        }
        this.tokens = {
            ...this.tokens,
            [tokenSet]: {
                values: JSON.stringify({}),
            },
        };
        this.setUpdatedAt(updatedAt);
        return true;
    }

    deleteTokenSet(tokenSet: string, updatedAt): void {
        if (tokenSet in this.tokens) {
            const oldTokens = this.tokens;
            delete oldTokens[tokenSet];
            this.tokens = {
                ...oldTokens,
            };
            this.setUpdatedAt(updatedAt);
        }
    }

    renameTokenSet({oldName, newName, updatedAt}): boolean {
        if (newName in this.tokens) {
            notifyToUI('Token set already exists');
            return false;
        }
        this.tokens = {
            ...this.tokens,
            [newName]: this.tokens[oldName],
        };
        delete this.tokens[oldName];
        this.setUpdatedAt(updatedAt);

        return true;
    }

    reorderTokenSets(tokenSets: string[]): void {
        console.log('reordering');
        const newTokens = {};
        tokenSets.map((set) => {
            Object.assign(newTokens, {[set]: this.tokens[set]});
        });
        this.tokens = newTokens;
        this.setMergedTokens();
    }

    setUsedTokenSet(usedTokenSet: string[]): void {
        this.usedTokenSet = usedTokenSet;
        this.setMergedTokens();
    }

    setMergedTokens(): void {
        const mergedTokens = [];
        console.log('Tokens are', this.tokens);
        Object.entries(this.tokens).forEach((tokenGroup) => {
            console.log('Cur is', tokenGroup, this.usedTokenSet);
            if (this.usedTokenSet.includes(tokenGroup[0])) {
                if (Array.isArray(tokenGroup[1].values)) {
                    console.log('Is array, pushing all', tokenGroup[1].values);
                    mergedTokens.push(...tokenGroup[1].values);
                }
                console.log('Parsed is', tokenGroup[1].values);
                const convertedToArray = convertToTokenArray({tokens: tokenGroup[1].values});
                convertedToArray.forEach(([key, value]) => {
                    mergedTokens.push({name: key, ...value});
                });
            }
        });
        console.log('Merged Tokens are', mergedTokens);

        this.mergedTokens = mergedTokens;

        this.setAllAliases();
    }

    updateTokenValues(parent: string, tokens: string, updatedAt: string): void {
        console.log('Updat token val');
        if (tokens) {
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

    getMergedTokens(): SingleTokenObject[] {
        console.log('Merged are', this.mergedTokens);
        return this.mergedTokens;
    }

    getFormattedTokens() {
        const tokens = convertToTokenArray({tokens: this.getMergedTokens(), expandTypography: true});
        const tokenObj = {};
        tokens.forEach(([key, value]) => {
            set(tokenObj, key.split('/').join('.').toString(), value);
        });

        return JSON.stringify(tokenObj, null, 2);
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
            } else if (checkIfAlias(el[1], this.mergedTokens)) {
                const obj = [`${key}.${el[0]}`, el[1]];
                prev.push(obj);
                return prev;
            }
            return prev;
        }, []);
    }

    setAllAliases(previousCount = undefined, aliasArray = Object.entries(this.mergedTokens)): void {
        const aliases = this.findAllAliases({arr: aliasArray});

        if (aliases.length > 0) {
            aliases.forEach((alias) => {
                this.setResolvedAlias(this.mergedTokens, alias[0], getAliasValue(alias[1], this.mergedTokens));
            });
            if (previousCount > aliases.length || !previousCount) {
                this.setAllAliases(aliases.length);
            } else {
                console.log("Unable to resolve some aliases, these wont' resolve:", aliases);
            }
        }
    }

    getTokenValue(token: SingleToken): string | null {
        if (checkIfAlias(token, this.mergedTokens)) {
            return getAliasValue(token, this.mergedTokens);
        }
        return String(checkIfValueToken(token) ? token.value : token);
    }

    setResolvedAlias(tokens: TokenGroup, target: string, source: string): void {
        set(tokens, target, source);
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
