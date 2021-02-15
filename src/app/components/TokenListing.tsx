import * as React from 'react';
import objectPath from 'object-path';
import JSON5 from 'json5';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import EditTokenForm from './EditTokenForm';
import Heading from './Heading';
import Icon from './Icon';
import Modal from './Modal';
import renderKeyValue from './renderKeyValue';
import Tooltip from './Tooltip';

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
    const {collapsed, showEditForm, showOptions, tokenData, displayType} = useTokenState();
    const {
        setStringTokens,
        setCollapsed,
        createStyles,
        updateTokens,
        setLoading,
        setShowEditForm,
        setShowOptions,
        setDisplayType,
    } = useTokenDispatch();

    const [activeToken] = React.useState('options');

    const [showHelp, setShowHelp] = React.useState(false);
    const [isIntCollapsed, setIntCollapsed] = React.useState(false);

    const [editToken, setEditToken] = React.useState({
        value: '',
        name: '',
        path: '',
    });
    function setSingleTokenValue({parent, name, value, options, oldName}) {
        console.log('setting single token val', parent, name, value, options, oldName);
        const obj = JSON5.parse(tokenData.tokens[parent].values);
        const newValue = options
            ? {
                  value,
                  ...options,
              }
            : {
                  value,
              };
        objectPath.set(obj, name, newValue);
        if (oldName === name || !oldName) {
            setStringTokens({parent, tokens: JSON.stringify(obj, null, 2)});
        } else {
            objectPath.del(obj, oldName);
            setStringTokens({
                parent,
                tokens: JSON.stringify(obj, null, 2).split(`$${oldName}`).join(`$${name}`),
            });
        }
    }

    const closeForm = () => {
        setShowOptions('');
        setShowEditForm(false);
    };

    const showForm = ({value, name, path}) => {
        console.log('show form', value, name);
        setShowEditForm(true);
        setEditToken({value, name, path});
    };

    const showNewForm = (path, formSchema) => {
        let initialToken = '';
        if (formSchema) {
            initialToken = formSchema;
        }

        showForm({value: initialToken, name: '', path});
    };

    const submitTokenValue = async ({value, name, path, options}) => {
        console.log('setting token value', value, name, path, options, editToken);
        setEditToken({value, name, path});
        setSingleTokenValue({
            parent: activeToken,
            name: [path, name].join('.'),
            value,
            options,
            oldName: editToken.name ? [path, editToken.name].join('.') : null,
        });
        await setLoading(true);
        updateTokens();
    };

    React.useEffect(() => {
        setIntCollapsed(collapsed);
    }, [collapsed]);

    const handleSetIntCollapsed = (e) => {
        e.stopPropagation();
        if (e.altKey) {
            setCollapsed(!collapsed);
        } else {
            setIntCollapsed(!isIntCollapsed);
        }
    };

    return (
        <div className="border-b border-gray-200">
            <div className="flex justify-between space-x-8 items-center relative">
                <button
                    className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                        isIntCollapsed ? 'opacity-50' : null
                    }`}
                    type="button"
                    onClick={handleSetIntCollapsed}
                >
                    <Tooltip label="Alt + Click to collapse all">
                        <div className="p-2 -m-2">
                            {isIntCollapsed ? (
                                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 3L1 0v6l4-3z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="6" height="6" viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 5l3-4H0l3 4z" fill="currentColor" />
                                </svg>
                            )}
                        </div>
                    </Tooltip>
                    <Heading size="small">{label}</Heading>
                </button>
                <div className="absolute right-0 mr-2">
                    {help && (
                        <Tooltip label={showHelp ? 'Hide help' : 'Show help'}>
                            <button
                                className="button button-ghost"
                                type="button"
                                onClick={() => setShowHelp(!showHelp)}
                            >
                                <Icon name="help" />
                            </button>
                        </Tooltip>
                    )}
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
                    <Tooltip label="Edit token values" variant="right">
                        <button className="button button-ghost" type="button" onClick={() => setShowOptions(values[0])}>
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
                    <Modal full isOpen={showOptions === values[0]} close={closeForm}>
                        <div className="flex flex-col-reverse">
                            {showEditForm && (
                                <EditTokenForm
                                    explainer={explainer}
                                    submitTokenValue={submitTokenValue}
                                    initialName={editToken.name}
                                    path={editToken.path}
                                    property={property}
                                    isPristine={editToken.name === ''}
                                    initialValue={editToken.value}
                                />
                            )}

                            <div className="px-4 pb-4">
                                {renderKeyValue({
                                    tokenValues: Object.entries(values[1]),
                                    showNewForm,
                                    showForm,
                                    property: values[0],
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
                                                onClick={() => setDisplayType(displayType === 'GRID' ? 'LIST' : 'GRID')}
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
            {showHelp && <div className="px-4 pb-4 text-xxs text-gray-600">{help}</div>}
            {Object.entries(values[1]).length > 0 && (
                <div className={`px-4 pb-4 ${isIntCollapsed ? 'hidden' : null}`}>
                    {renderKeyValue({
                        tokenValues: Object.entries(values[1]),
                        showNewForm,
                        showForm,
                        property: values[0],
                        schema,
                        path: values[0],
                        type,
                    })}
                </div>
            )}
        </div>
    );
};

export default TokenListing;
