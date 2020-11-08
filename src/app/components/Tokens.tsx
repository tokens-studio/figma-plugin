import * as React from 'react';
import JSON5 from 'json5';
import objectPath from 'object-path';
import Modal from './Modal';
import Heading from './Heading';
import Icon from './Icon';
import EditTokenForm from './EditTokenForm';
import TokenButton from './TokenButton';
import Tooltip from './Tooltip';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import {isTypographyToken} from './utils';

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
        typography: {},
    };
    return Object.entries(Object.assign(properties, tokens));
};

const Tokens = ({disabled}) => {
    const {showEditForm, showOptions, tokenData, displayType} = useTokenState();
    const {
        setStringTokens,
        createStyles,
        updateTokens,
        setLoading,
        setShowEditForm,
        setShowOptions,
        setDisplayType,
    } = useTokenDispatch();
    const [activeToken] = React.useState('options');
    const [editToken, setEditToken] = React.useState({
        token: '',
        name: '',
        path: '',
    });
    function setSingleTokenValue({parent, name, token, options}) {
        const obj = JSON5.parse(tokenData.tokens[parent].values);
        const newValue = options
            ? {
                  value: token,
                  ...options,
              }
            : token;
        objectPath.set(obj, name, newValue);
        setStringTokens({parent, tokens: JSON5.stringify(obj, null, 2)});
    }

    const submitTokenValue = async ({token, name, path, options}) => {
        setEditToken({token, name, path});
        setSingleTokenValue({parent: activeToken, name: [path, name].join('.'), token, options});
        await setLoading(true);
        updateTokens();
    };

    const showForm = ({token, name, path}) => {
        setShowEditForm(true);
        setEditToken({token, name, path});
    };

    const closeForm = () => {
        setShowOptions('');
        setShowEditForm(false);
    };

    const showNewForm = (path, schema) => {
        let initialToken = '';
        if (schema) {
            initialToken = schema;
        }

        showForm({token: initialToken, name: '', path});
    };

    const renderKeyValue = ({tokenValues, schema, path = '', type = '', editMode = false}) => (
        <div className="flex justify-start flex-row flex-wrap">
            {tokenValues.map(([key, value]) => {
                const stringPath = [path, key].filter((n) => n).join('.');
                return (
                    <React.Fragment key={stringPath}>
                        {typeof value === 'object' && !isTypographyToken(value) ? (
                            <div className="property-wrapper w-full">
                                <div className="flex items-center justify-between">
                                    <Heading size="small">{key}</Heading>
                                    {editMode && (
                                        <Tooltip label="Add a new token in group" variant="right">
                                            <button
                                                className="button button-ghost"
                                                type="button"
                                                onClick={() => {
                                                    showNewForm([path, key].join('.'), schema);
                                                }}
                                            >
                                                <Icon name="add" />
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>

                                {renderKeyValue({
                                    tokenValues: Object.entries(value),
                                    schema,
                                    path: stringPath,
                                    type,
                                    editMode,
                                })}
                            </div>
                        ) : (
                            <TokenButton
                                type={type}
                                editMode={editMode}
                                name={key}
                                path={path}
                                token={value}
                                disabled={disabled}
                                showForm={showForm}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    const TokenListing = ({
        label,
        schema,
        explainer = '',
        help = '',
        createButton = false,
        showDisplayToggle = false,
        property,
        type = '',
        values,
    }: {
        label: string;
        schema?: object;
        explainer?: string;
        help?: string;
        createButton?: boolean;
        showDisplayToggle?: boolean;
        property: string;
        type?: string;
        values?: string | object;
    }) => {
        const [showHelp, setShowHelp] = React.useState(false);
        return (
            <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between space-x-4 items-center mb-2">
                    <Heading size="small">
                        {label}
                        {help && (
                            <Tooltip label={showHelp ? 'Hide help' : 'Show help'}>
                                <button className="ml-1" type="button" onClick={() => setShowHelp(!showHelp)}>
                                    <Icon name="help" />
                                </button>
                            </Tooltip>
                        )}
                    </Heading>
                    <div>
                        {showDisplayToggle && (
                            <Tooltip label={displayType === 'GRID' ? 'Show as List' : 'Show as Grid'}>
                                <button
                                    onClick={() => setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID')}
                                    type="button"
                                    className="button button-ghost"
                                >
                                    <Icon name={displayType === 'GRID' ? 'list' : 'grid'} />
                                </button>
                            </Tooltip>
                        )}
                        {createButton && (
                            <Tooltip label="Create Styles">
                                <button onClick={createStyles} type="button" className="button button-ghost">
                                    <Icon name="style" />
                                </button>
                            </Tooltip>
                        )}
                        <Tooltip label="Edit token values">
                            <button
                                className="button button-ghost"
                                type="button"
                                onClick={() => setShowOptions(values[0])}
                            >
                                <Icon name="edit" />
                            </button>
                        </Tooltip>
                        <Tooltip label="Add a new token" variant="right">
                            <button
                                className="button button-ghost"
                                type="button"
                                onClick={() => {
                                    setShowOptions(values[0]);
                                    showNewForm(values[0], schema);
                                }}
                            >
                                <Icon name="add" />
                            </button>
                        </Tooltip>
                    </div>
                    {showOptions === values[0] && (
                        <Modal title={`Modal for ${values[0]}`} isOpen={showOptions} close={closeForm}>
                            <div className="flex flex-col-reverse">
                                {showEditForm && (
                                    <EditTokenForm
                                        explainer={explainer}
                                        submitTokenValue={submitTokenValue}
                                        initialName={editToken.name}
                                        path={editToken.path}
                                        property={property}
                                        isPristine={editToken.name === ''}
                                        initialToken={editToken.token}
                                    />
                                )}

                                <div className="px-4 pb-4">
                                    {renderKeyValue({
                                        tokenValues: Object.entries(values[1]),
                                        schema,
                                        path: values[0],
                                        type,
                                        editMode: true,
                                    })}
                                </div>
                                <div className="flex items-center justify-between p-4">
                                    <Heading size="small">{property}</Heading>
                                    <div>
                                        {showDisplayToggle && (
                                            <Tooltip label={displayType === 'GRID' ? 'Show as List' : 'Show as Grid'}>
                                                <button
                                                    onClick={() =>
                                                        setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID')
                                                    }
                                                    type="button"
                                                    className="button button-ghost"
                                                >
                                                    <Icon name={displayType === 'GRID' ? 'list' : 'grid'} />
                                                </button>
                                            </Tooltip>
                                        )}
                                        <Tooltip label="Add a new token">
                                            <button
                                                type="button"
                                                className="button button-ghost"
                                                onClick={() => showNewForm(values[0], schema)}
                                            >
                                                <Icon name="add" />
                                            </button>
                                        </Tooltip>
                                        <Tooltip label="Add a new group" variant="right">
                                            <button
                                                className="button button-ghost"
                                                type="button"
                                                onClick={() => {
                                                    showNewForm(values[0], {});
                                                }}
                                            >
                                                <Icon name="folder" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
                {showHelp && <div className="mb-4 text-xxs text-gray-600">{help}</div>}
                {renderKeyValue({tokenValues: Object.entries(values[1]), schema, path: values[0], type})}
            </div>
        );
    };

    if (tokenData.tokens[activeToken].hasErrored) return <div>JSON malformed, check in Editor</div>;

    return (
        <div>
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
                            <React.Fragment key={tokenValues[0]}>
                                <TokenListing label="Width" property="Sizing" type="width" values={tokenValues} />
                                <TokenListing label="Height" property="Sizing" type="height" values={tokenValues} />
                            </React.Fragment>
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
        </div>
    );
};

export default Tokens;
