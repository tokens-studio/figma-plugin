/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {mergeDeep} from '@/plugin/helpers';
import {SingleTokenObject, TokenType} from '@types/tokens';
import {useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import tokenTypes from '../../config/tokenTypes';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

interface TokenListingType {
    label: string;
    property: string;
    type: string;
    values: object;
    help?: string;
    explainer?: string;
    schema?: {
        value: object | string;
        options: object | string;
    };
}

function convertDotPathToNestedObject(path, value) {
    const [last, ...paths] = path.toString().split('.').reverse();
    return paths.reduce((acc, el) => ({[el]: acc}), {[last]: value});
}

function createTokensObject(tokens: SingleTokenObject[]) {
    console.log('Creating tokens obj');
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

const mappedTokens = (tokens) => {
    console.log('Maptoks');

    const tokenObj = {};
    Object.entries(tokens).forEach(([key, group]: [string, {values: SingleTokenObject[]; type?: TokenType}]) => {
        tokenObj[key] = {
            values: group.values,
        };
    });

    mergeDeep(tokenObj, tokenTypes);

    return Object.entries(tokenObj);
};

const Tokens = () => {
    const {tokens, activeTokenSet} = useTokenState();

    const [tokenValues, setTokenValues] = React.useState([]);

    React.useEffect(() => {
        console.log('Something changed');
    }, [tokens, activeTokenSet]);
    React.useEffect(() => {
        console.log('Something setState changed');
    }, [tokenValues, setTokenValues]);

    React.useEffect(() => {
        console.log('use effect triggered');
        setTokenValues(mappedTokens(createTokensObject(tokens[activeTokenSet].values)));
    }, [tokens, activeTokenSet]);

    console.log('RERENDERED TOP TOKENS');

    return (
        <div>
            {tokenValues.map(([key, group]: [string, TokenListingType]) => {
                return (
                    <div key={key}>
                        <TokenListing
                            tokenKey={key}
                            label={group.label}
                            explainer={group.explainer}
                            schema={group.schema}
                            help={group.help}
                            property={group.property}
                            tokenType={group.type}
                            values={group.values}
                        />
                    </div>
                );
            })}
            <ToggleEmptyButton />
            <TokensBottomBar />
        </div>
    );
};

export default Tokens;
