import {tokens as testTokens} from '../mocks/tokenHelpers'
import parseTokenValues from '../../src/utils/parseTokenValues';
import { mergeTokenGroups, resolveTokenValues } from '../../src/plugin/tokenHelpers'

import {default as nest_2} from '../mocks/nest_2.json'
import {default as nest_5} from '../mocks/nest_5.json'
import {default as nest_10} from '../mocks/nest_10.json'
import {default as nest_20} from '../mocks/nest_20.json'
import {default as nest_50} from '../mocks/nest_50.json'
import {default as nest_100} from '../mocks/nest_100.json'
import {default as nest_500} from '../mocks/nest_500.json'

import {default as tokens} from '../mocks/tokens.json'

export const parseDefaultTokens = () => {
    const parsedTokens = parseTokenValues(testTokens);
}    

export const parseNestedTokens = () => {
    const parsed_2 = parseTokenValues(nest_2)
    const parsed_5 = parseTokenValues(nest_5)
    const parsed_10 = parseTokenValues(nest_10)
    const parsed_20 = parseTokenValues(nest_20)
    const parsed_50 = parseTokenValues(nest_50)
    const parsed_100 = parseTokenValues(nest_100)
    const parsed_500 = parseTokenValues(nest_500)
}


export const parseMergeResolveTokens = () => {
    const parsedTokens = parseTokenValues(tokens)
    const merged = mergeTokenGroups(parsedTokens, ['Foundations', 'Light', 'Dark'])
    const resolved = resolveTokenValues(merged)
}