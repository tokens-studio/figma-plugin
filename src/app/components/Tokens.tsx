/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useSelector} from 'react-redux';
import {computeMergedTokens, resolveTokenValues} from '@/plugin/tokenHelpers';
import TokenListing from './TokenListing';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import {mappedTokens} from './createTokenObj';
import {RootState} from '../store';
import TokenSetSelector from './TokenSetSelector';
import TokenFilter from './TokenFilter';
import EditTokenFormModal from './EditTokenFormModal';

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

const Tokens = ({isActive}) => {
    const {tokens, usedTokenSet, activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {showEditForm, tokenFilter} = useSelector((state: RootState) => state.uiState);

    const resolvedTokens = React.useMemo(() => {
        return resolveTokenValues(computeMergedTokens(tokens, [...usedTokenSet, activeTokenSet]));
    }, [tokens, usedTokenSet, activeTokenSet]);

    const memoizedTokens = React.useMemo(() => {
        if (tokens[activeTokenSet]) {
            return mappedTokens(tokens[activeTokenSet], tokenFilter);
        }
        return [];
    }, [tokens, activeTokenSet, tokenFilter]);

    if (!isActive) return null;

    return (
        <div>
            <TokenSetSelector />
            <TokenFilter />
            {memoizedTokens.map(([key, group]: [string, TokenListingType]) => {
                return (
                    <div key={key}>
                        <TokenListing
                            tokenKey={key}
                            label={group.label}
                            explainer={group.explainer}
                            schema={group.schema}
                            property={group.property}
                            tokenType={group.type}
                            values={group.values}
                            resolvedTokens={resolvedTokens}
                        />
                    </div>
                );
            })}
            {showEditForm && <EditTokenFormModal />}
            <ToggleEmptyButton />
            <TokensBottomBar />
        </div>
    );
};

export default Tokens;
