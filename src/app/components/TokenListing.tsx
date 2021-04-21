import * as React from 'react';
import {useSelector} from 'react-redux';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import EditTokenForm from './EditTokenForm';
import Heading from './Heading';
import Icon from './Icon';
import Modal from './Modal';
import renderKeyValue from './renderKeyValue';
import Tooltip from './Tooltip';
import NewGroupForm from './NewGroupForm';
import {RootState} from '../store';

const TokenListing = ({
    tokenKey,
    label,
    schema,
    explainer = '',
    help = '',
    property,
    tokenType = 'implicit',
    values,
}: {
    tokenKey: string;
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
    const {editProhibited} = useSelector((state: RootState) => state.tokenState);

    const {collapsed, showEmptyGroups, showEditForm, showNewGroupForm, showOptions, displayType} = useTokenState();
    const {setCollapsed, createStyles, setShowEditForm, setShowOptions, setDisplayType} = useTokenDispatch();

    const createButton = ['color', 'typography'].includes(tokenType);
    const showDisplayToggle = tokenType === 'color';

    const [showHelp, setShowHelp] = React.useState(false);
    const [isIntCollapsed, setIntCollapsed] = React.useState(false);

    const [editToken, setEditToken] = React.useState({
        value: '',
        name: '',
        path: '',
        isPristine: false,
    });

    const closeForm = () => {
        setShowOptions(false);
        setShowEditForm(false);
    };

    const showForm = ({value, name, path, isPristine = false}) => {
        setShowEditForm(true);
        setEditToken({value, name, path, isPristine});
    };

    const showNewForm = ({path, name = ''}) => {
        showForm({value: '', name, path, isPristine: true});
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
        <div className="border-b border-gray-200" data-cy={`tokenlisting-${tokenKey}`}>
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
                            onClick={() => setShowOptions(tokenKey)}
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
                                setShowOptions(tokenKey);
                                showNewForm({path: tokenKey});
                            }}
                        >
                            <Icon name="add" />
                        </button>
                    </Tooltip>
                </div>
                {showOptions === tokenKey && (
                    <Modal large full isOpen={showOptions === tokenKey} close={closeForm}>
                        <div className="flex flex-col-reverse">
                            {showEditForm && (
                                <EditTokenForm
                                    explainer={explainer}
                                    initialName={editToken.name}
                                    path={editToken.path}
                                    property={property}
                                    isPristine={editToken.isPristine}
                                    initialValue={editToken.value}
                                    schema={schema?.value}
                                    optionsSchema={schema?.options}
                                    type={tokenType}
                                />
                            )}
                            {showNewGroupForm && <NewGroupForm path={tokenKey} />}

                            <div className="px-4 pb-4">
                                {values &&
                                    renderKeyValue({
                                        tokenValues: values,
                                        showNewForm,
                                        showForm,
                                        property: tokenKey,
                                        schema,
                                        path: tokenKey,
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
                                            onClick={() => showNewForm({path: tokenKey})}
                                        >
                                            <Icon name="add" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
            {showHelp && <div className="px-4 pb-4 text-gray-600 text-xxs">{help}</div>}
            {values && (
                <div className={`px-4 pb-4 ${isIntCollapsed ? 'hidden' : null}`}>
                    {renderKeyValue({
                        tokenValues: values,
                        showNewForm,
                        showForm,
                        property: tokenKey,
                        schema,
                        path: tokenKey,
                        type: tokenType,
                    })}
                </div>
            )}
        </div>
    );
};

export default TokenListing;
