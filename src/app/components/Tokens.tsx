/* eslint-disable jsx-a11y/label-has-associated-control */
import * as React from 'react';
import JSON5 from 'json5';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import TokenListing from './TokenListing';
import Button from './Button';
import TokenSetSelector from './TokenSetSelector';

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
    const properties = {
        sizing: {
            label: 'Sizing',
            property: 'Sizing',
            type: 'sizing',
        },
        spacing: {
            label: 'Spacing',
            property: 'Spacing',
            type: 'spacing',
        },
        color: {
            label: 'Colors',
            property: 'Color',
            type: 'color',
            schema: {
                value: 'color',
                options: {
                    description: '',
                },
            },
            help:
                "If a (local) style is found with the same name it will match to that, if not, will use hex value. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON.",
        },
        borderRadius: {
            label: 'Border Radius',
            property: 'Border Radius',
            type: 'borderRadius',
        },
        borderWidth: {
            label: 'Border Width',
            property: 'Border Width',
            type: 'borderWidth',
            explainer: 'Enter as a number, e.g. 4',
        },
        opacity: {
            label: 'Opacity',
            property: 'Opacity',
            type: 'opacity',
            explainer: 'Set as 50%',
        },
        typography: {
            label: 'Typography',
            property: 'Typography',
            type: 'typography',
            schema: {
                value: {
                    fontFamily: '',
                    fontWeight: '',
                    lineHeight: '',
                    fontSize: '',
                },
                options: {
                    description: '',
                },
            },
            help:
                "If a (local) style is found with the same name it will match to that, if not, will use raw font values. Use 'Create Style' to batch-create styles from your tokens (e.g. in your design library). In the future we'll load all 'remote' styles and reference them inside the JSON.",
        },
        fontFamilies: {
            help: 'Only works in combination with a Font Weight',
            label: 'Font Families',
            property: 'Font Family',
            type: 'fontFamilies',
        },
        fontWeights: {
            help: 'Only works in combination with a Font Family',
            label: 'Font Weights',
            property: 'Font Weight',
            type: 'fontWeights',
        },
        lineHeights: {
            label: 'Line Heights',
            explainer: 'e.g. 100% or 14',
            property: 'Line Height',
            type: 'lineHeights',
        },
        fontSizes: {
            label: 'Font Sizes',
            property: 'Font Size',
            type: 'fontSizes',
        },
        letterSpacing: {
            label: 'Letter Spacing',
            property: 'Letter Spacing',
            type: 'letterSpacing',
        },
        paragraphSpacing: {
            label: 'Paragraph Spacing',
            property: 'ParagraphSpacing',
            type: 'paragraphSpacing',
        },
    };
    Object.entries(tokens).forEach(([key, values]: [string, object]) => {
        properties[key] = {
            ...properties[key],
            label: properties[key]?.label ?? key,
            type: properties[key]?.type ?? key,
            property: properties[key]?.property ?? key,
            values,
        };
    });
    return Object.entries(properties);
};

const Tokens = () => {
    const {tokenData, updatePageOnly, activeTokenSet} = useTokenState();
    const {updateTokens, toggleUpdatePageOnly, toggleShowEmptyGroups} = useTokenDispatch();

    const handleUpdate = async () => {
        updateTokens(false);
    };

    const tokenValues = JSON5.parse(tokenData.tokens[activeTokenSet].values);

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
            <button onClick={toggleShowEmptyGroups} type="button">
                Show empty groups
            </button>
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
