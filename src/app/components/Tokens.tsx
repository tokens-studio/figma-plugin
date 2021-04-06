/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {mergeDeep} from '@/plugin/helpers';
import {SingleTokenObject, TokenType} from '@types/tokens';
import {track} from '@/utils/analytics';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import Button from './Button';
import TokenSetSelector from './TokenSetSelector';
import tokenTypes from '../../config/tokenTypes';

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

const mappedTokens = (tokens) => {
    console.log('Trying to render tokens', tokens);
    const tokenObj = {};
    Object.entries(tokens).forEach(([key, group]: [string, {values: SingleTokenObject[]; type?: TokenType}]) => {
        tokenObj[key] = {
            values: group.values,
        };
    });

    mergeDeep(tokenObj, tokenTypes);

    console.log('rendering tokens', tokenObj);
    return Object.entries(tokenObj);
};

const Tokens = () => {
    const {tokenData, updatePageOnly, activeTokenSet, showEmptyGroups} = useTokenState();
    const {updateTokens, toggleUpdatePageOnly, toggleShowEmptyGroups} = useTokenDispatch();

    const handleUpdate = async () => {
        track('Update Tokens');
        updateTokens(false);
    };

    const tokenValues = tokenData.tokens[activeTokenSet].values;

    if (tokenData.tokens[activeTokenSet].hasErrored) return <div>JSON malformed, check in Editor</div>;

    return (
        <div>
            <TokenSetSelector />
            {mappedTokens(tokenValues).map(([key, group]: [string, TokenListingType]) => {
                return (
                    <div key={key}>
                        <TokenListing
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
            <div className="flex items-center justify-center mt-4">
                <Button variant="secondary" size="small" onClick={toggleShowEmptyGroups}>
                    {showEmptyGroups ? 'Hide' : 'Show'} empty groups
                </Button>
            </div>
            <div className="fixed bottom-0 left-0 w-full bg-white flex justify-between items-center p-2 border-t border-gray-200">
                <div className="switch flex items-center">
                    <input
                        className="switch__toggle"
                        type="checkbox"
                        id="updatemode"
                        checked={updatePageOnly}
                        onChange={() => toggleUpdatePageOnly(!updatePageOnly)}
                    />
                    <label className="switch__label text-xs" htmlFor="updatemode">
                        Update this page only
                    </label>
                </div>
                <Button variant="primary" size="large" onClick={handleUpdate}>
                    Update {updatePageOnly ? 'page' : 'document'}
                </Button>
            </div>
        </div>
    );
};

export default Tokens;
