/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import JSON5 from 'json5';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import Button from './Button';

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
    return Object.entries(Object.assign(tokens, properties));
};

const Tokens = () => {
    const {tokenData, updatePageOnly} = useTokenState();
    const [activeToken] = React.useState('options');
    const {updateTokens, setLoading, toggleUpdatePageOnly} = useTokenDispatch();

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };

    const tokenValues = JSON5.parse(tokenData.tokens[activeToken].values);

    if (tokenData.tokens[activeToken].hasErrored) return <div>JSON malformed, check in Editor</div>;

    return (
        <div>
            <TokenListing
                label="Border Radius"
                property="Border Radius"
                tokenType="borderRadius"
                values={tokenValues.borderRadius}
            />
            <TokenListing
                label="Border Width"
                explainer="Enter as a number, e.g. 4"
                property="Border Width"
                tokenType="borderWidth"
                values={tokenValues.borderWidth}
            />
            <TokenListing
                label="Opacity"
                property="Opacity"
                explainer="Set as 50%"
                tokenType="opacity"
                values={tokenValues.opacity}
            />
            <TokenListing
                showDisplayToggle
                createButton
                help="If a (local) style is found with the same name it will match to that, if not, will use hex value. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON."
                label="Colors"
                property="Color"
                tokenType="color"
                schema={{
                    value: 'color',
                    options: {
                        description: '',
                    },
                }}
                values={tokenValues.colors || tokenValues.color}
            />
            <TokenListing label="Sizing" property="Sizing" tokenType="sizing" values={tokenValues.sizing} />
            <TokenListing property="Spacing" label="Spacing" tokenType="spacing" values={tokenValues.spacing} />
            <TokenListing
                createButton
                help="If a (local) style is found with the same name it will match to that, if not, will use raw font values. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON."
                label="Typography"
                property="Typography"
                tokenType="typography"
                schema={{
                    value: {
                        fontFamily: '',
                        fontWeight: '',
                        lineHeight: '',
                        fontSize: '',
                    },
                    options: {
                        description: '',
                    },
                }}
                values={tokenValues.typography}
            />
            <TokenListing
                help="Only works in combination with a Font Weight"
                label="Font Families"
                property="Font Family"
                tokenType="fontFamilies"
                values={tokenValues.fontFamilies}
            />
            <TokenListing
                help="Only works in combination with a Font Family"
                label="Font Weights"
                property="Font Weight"
                tokenType="fontWeights"
                values={tokenValues.fontWeights}
            />
            <TokenListing
                label="Line Heights"
                explainer="e.g. 100% or 14"
                property="Line Height"
                tokenType="lineHeights"
                values={tokenValues.lineHeights}
            />
            <TokenListing
                label="Font Sizes"
                property="Font Size"
                tokenType="fontSizes"
                values={tokenValues.fontSizes}
            />
            <TokenListing
                label="Letter Spacing"
                property="Letter Spacing"
                tokenType="letterSpacing"
                values={tokenValues.letterSpacing}
            />
            <TokenListing
                label="Paragraph Spacing"
                property="ParagraphSpacing"
                tokenType="paragraphSpacing"
                values={tokenValues.paragraphSpacing}
            />
            {/* <TokenListing
                property={tokenValues[0]}
                label={tokenValues[0]}
                values={tokenValues}
                tokenType={tokenValues[0]}
            /> */}
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
