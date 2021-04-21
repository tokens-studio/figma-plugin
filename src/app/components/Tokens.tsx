/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import {useSelector} from 'react-redux';
import {useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import {mappedTokens} from './createTokenObj';
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

const Tokens = () => {
    const {tokens, activeTokenSet} = useTokenState();
    const settings = useSelector((state: RootState) => state.settings);

    const [tokenValues, setTokenValues] = React.useState([]);

    React.useEffect(() => {
        setTokenValues(mappedTokens(tokens[activeTokenSet].values, settings.depth));
    }, [tokens, activeTokenSet, settings.depth]);

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
