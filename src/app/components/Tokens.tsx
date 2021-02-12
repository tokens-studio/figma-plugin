/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import JSON5 from 'json5';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import Button from './Button';
import {StorageProviderType} from '../store/types';

const mappedTokens = (tokens) => {
    const properties = {
        sizing: {},
        spacing: {},
        colors: {},
        borderRadius: {},
        borderWidth: {},
        opacity: {},
        fontFamilies: {},
        fontWeights: {},
        fontSizes: {},
        lineHeights: {},
        letterSpacing: {},
        paragraphSpacing: {},
        typography: {},
    };
    return Object.entries(Object.assign(properties, tokens));
};

const Tokens = () => {
    const {tokenData, updatePageOnly, storageType} = useTokenState();
    const [activeToken] = React.useState('options');
    const {updateTokens, setLoading, toggleUpdatePageOnly} = useTokenDispatch();

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };

    if (tokenData.tokens[activeToken].hasErrored) return <div>JSON malformed, check in Editor</div>;

    return (
        <div>
            {storageType.provider !== StorageProviderType.LOCAL && (
                <div className="text-xxs text-gray-600 p-2">Last updated {tokenData.getUpdatedAt()}</div>
            )}
            {mappedTokens(JSON5.parse(tokenData.tokens[activeToken].values)).map((tokenValues) => {
                switch (tokenValues[0]) {
                    case 'borderRadius':
                        return (
                            <TokenListing
                                key={tokenValues[0]}
                                label="Border Radius"
                                property="Border Radius"
                                type="borderRadius"
                                values={tokenValues}
                            />
                        );
                    case 'borderWidth':
                        return (
                            <TokenListing
                                key={tokenValues[0]}
                                label="Border Width"
                                explainer="Enter as a number, e.g. 4"
                                property="Border Width"
                                type="borderWidth"
                                values={tokenValues}
                            />
                        );
                    case 'opacity':
                        return (
                            <TokenListing
                                key={tokenValues[0]}
                                label="Opacity"
                                property="Opacity"
                                explainer="Set as 50%"
                                type="opacity"
                                values={tokenValues}
                            />
                        );
                    case 'colors':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    showDisplayToggle
                                    createButton
                                    help="If a (local) style is found with the same name it will match to that, if not, will use hex value. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON."
                                    label="Fill"
                                    property="Fill"
                                    type="fill"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'sizing':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing label="Sizing" property="Sizing" type="sizing" values={tokenValues} />
                            </div>
                        );
                    case 'spacing':
                        return (
                            <React.Fragment key={tokenValues[0]}>
                                <TokenListing property="Spacing" label="Spacing" type="spacing" values={tokenValues} />
                            </React.Fragment>
                        );
                    case 'typography':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    createButton
                                    help="If a (local) style is found with the same name it will match to that, if not, will use raw font values. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON."
                                    label="Typography"
                                    property="Typography"
                                    type="typography"
                                    schema={{fontFamily: '', fontWeight: '', lineHeight: '', fontSize: ''}}
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'fontFamilies':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    help="Only works in combination with a Font Weight"
                                    label="Font Families"
                                    property="Font Family"
                                    type="fontFamilies"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'fontWeights':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    help="Only works in combination with a Font Family"
                                    label="Font Weights"
                                    property="Font Weight"
                                    type="fontWeights"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'lineHeights':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    label="Line Heights"
                                    explainer="e.g. 100% or 14"
                                    property="Line Height"
                                    type="lineHeights"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'fontSizes':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    label="Font Sizes"
                                    property="Font Size"
                                    type="fontSizes"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'letterSpacing':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    label="Letter Spacing"
                                    property="Letter Spacing"
                                    type="letterSpacing"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    case 'paragraphSpacing':
                        return (
                            <div key={tokenValues[0]}>
                                <TokenListing
                                    label="Paragraph Spacing"
                                    property="ParagraphSpacing"
                                    type="paragraphSpacing"
                                    values={tokenValues}
                                />
                            </div>
                        );
                    default:
                        return (
                            <TokenListing
                                key={tokenValues[0]}
                                property={tokenValues[0]}
                                label={tokenValues[0]}
                                values={tokenValues}
                                type={tokenValues[0]}
                            />
                        );
                }
            })}
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
                    Update
                </Button>
            </div>
        </div>
    );
};

export default Tokens;
