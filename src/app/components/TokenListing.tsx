import * as React from 'react';
import objectPath from 'object-path';
import JSON5 from 'json5';
import set from 'set-value';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import EditTokenForm from './EditTokenForm';
import Heading from './Heading';
import Icon from './Icon';
import Modal from './Modal';
import renderKeyValue from './renderKeyValue';
import Tooltip from './Tooltip';
import NewGroupForm from './NewGroupForm';

const TokenListing = ({
    label,
    schema,
    explainer = '',
    help = '',
    property,
    tokenType = '',
    values,
}: {
    label: string;
    schema: {
        value: object | string;
        options: object | string;
    };
    explainer: string;
    help: string;
    property: string;
    tokenType: string;
    values: object;
}) => {
    const {
        collapsed,
        showEmptyGroups,
        showEditForm,
        showNewGroupForm,
        showOptions,
        tokenData,
        displayType,
        activeTokenSet,
        editProhibited,
    } = useTokenState();
    const {
        setStringTokens,
        setCollapsed,
        createStyles,
        updateTokens,
        setLoading,
        setShowEditForm,
        setShowNewGroupForm,
        setShowOptions,
        setDisplayType,
    } = useTokenDispatch();

    const createButton = ['color', 'typography'].includes(tokenType);
    const showDisplayToggle = tokenType === 'color';

    const [showHelp, setShowHelp] = React.useState(false);
    const [isIntCollapsed, setIntCollapsed] = React.useState(false);

    const [editToken, setEditToken] = React.useState({
        value: '',
        name: '',
        path: '',
    });

    function setSingleTokenValue({parent, name, value, options, oldName, newGroup = false}) {
        const obj = JSON5.parse(tokenData.tokens[parent].values);
        let newValue;
        if (newGroup) {
            newValue = {};
        } else {
            newValue = options
                ? {
                      value,
                      ...options,
                  }
                : {
                      value,
                  };
        }
        const newName = name.toString();
        set(obj, newName, newValue);

        if (oldName === newName || !oldName) {
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
        setShowEditForm(true);
        setEditToken({value, name, path});
    };

    const showNewForm = (path) => {
        showForm({value: '', name: '', path});
    };

    const submitTokenValue = async ({value, name, path, options}) => {
        setEditToken({value, name, path});
        setSingleTokenValue({
            parent: activeTokenSet,
            name: [path, name].join('.'),
            value,
            options,
            oldName: editToken.name ? [path, editToken.name].join('.') : null,
        });
        await setLoading(true);
        updateTokens();
    };

    React.useEffect(() => {
        if (values) {
            setIntCollapsed(collapsed);
        }
    }, [collapsed, values]);

    const handleSetIntCollapsed = (e) => {
        e.stopPropagation();
        if (e.altKey) {
            setCollapsed(!collapsed);
        } else {
            setIntCollapsed(!isIntCollapsed);
        }
    };

    if (!values && !showEmptyGroups) return null;

    return (
        <div className="border-b border-gray-200" data-cy={`tokenlisting-${tokenType}`}>
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
                        <button
                            disabled={editProhibited}
                            className="button button-ghost"
                            type="button"
                            onClick={() => setShowOptions(tokenType)}
                        >
                            <Icon name="edit" />
                        </button>
                    </Tooltip>
                    <Tooltip label="Add a new token" variant="right">
                        <button
                            disabled={editProhibited}
                            data-cy="button-add-new-token"
                            className="button button-ghost"
                            type="button"
                            onClick={() => {
                                setShowOptions(tokenType);
                                showNewForm(tokenType);
                            }}
                        >
                            <Icon name="add" />
                        </button>
                    </Tooltip>
                </div>
                {showOptions === tokenType && (
                    <Modal full isOpen={showOptions === tokenType} close={closeForm}>
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
                                    schema={schema?.value}
                                    optionsSchema={schema?.options}
                                />
                            )}
                            {showNewGroupForm && (
                                <NewGroupForm path={tokenType} setSingleTokenValue={setSingleTokenValue} />
                            )}

                            <div className="px-4 pb-4">
                                {values &&
                                    renderKeyValue({
                                        tokenValues: Object.entries(values),
                                        showNewForm,
                                        showForm,
                                        property: tokenType,
                                        schema,
                                        path: tokenType,
                                        type: tokenType,
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
                                            disabled={editProhibited}
                                            type="button"
                                            data-cy="button-modal-add"
                                            className="button button-ghost"
                                            onClick={() => showNewForm(tokenType)}
                                        >
                                            <Icon name="add" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip label="Add a new group" variant="right">
                                        <button
                                            disabled={editProhibited}
                                            className="button button-ghost"
                                            type="button"
                                            onClick={() => {
                                                setShowNewGroupForm(true);
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
            {showHelp && <div className="px-4 pb-4 text-gray-600 text-xxs">{help}</div>}
            {values && Object.entries(values).length > 0 && (
                <div className={`px-4 pb-4 ${isIntCollapsed ? 'hidden' : null}`}>
                    {renderKeyValue({
                        tokenValues: Object.entries(values),
                        showNewForm,
                        showForm,
                        property: tokenType,
                        schema,
                        path: tokenType,
                        type: tokenType,
                    })}
                </div>
            )}
        </div>
    );
};

export default TokenListing;
