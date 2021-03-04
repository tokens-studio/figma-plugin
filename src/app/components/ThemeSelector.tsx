import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import Tooltip from './Tooltip';

export default function ThemeSelector() {
    const {tokenData, editProhibited, activeTokenSet, usedTokenSet} = useTokenState();
    const {setActiveTokenSet, toggleUsedTokenSet, addTokenSet, renameTokenSet, deleteTokenSet} = useTokenDispatch();
    const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
    const [showDeleteTokenSetModal, setShowDeleteTokenSetModal] = React.useState(false);
    const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
    const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
    const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');

    const totalTokenSets = Object.keys(tokenData.tokens);

    const isUsedTokenSet = (set) => {
        return usedTokenSet.includes(set);
    };

    const handleNewTokenSetSubmit = (e) => {
        e.preventDefault();
        addTokenSet(newTokenSetName.trim());
    };

    const handleDeleteTokenSet = (tokenSet) => {
        setTokenSetMarkedForChange(tokenSet);
        setShowDeleteTokenSetModal(true);
    };

    const handleRenameTokenSet = (tokenSet) => {
        setTokenSetMarkedForChange(tokenSet);
        setShowRenameTokenSetFields(true);
    };

    const handleConfirmDeleteTokenSet = () => {
        deleteTokenSet(tokenSetMarkedForChange);
        setTokenSetMarkedForChange('');
        setShowDeleteTokenSetModal(false);
    };

    const handleRenameTokenSetSubmit = (e) => {
        e.preventDefault();
        renameTokenSet(tokenSetMarkedForChange, newTokenSetName.trim());
        setTokenSetMarkedForChange('');
        setShowRenameTokenSetFields(false);
    };

    React.useEffect(() => {
        setShowNewTokenSetFields(false);
        handleNewTokenSetNameChange('');
    }, [tokenData.tokens]);

    return (
        <div className="flex flex-row gap-2 px-4 pt-2 pb-0">
            {totalTokenSets.map((tokenSet) => (
                <div key={tokenSet}>
                    <ContextMenuTrigger id={`${tokenSet}-trigger`}>
                        <button
                            key={tokenSet}
                            className={`font-bold items-center gap-2 focus:outline-none text-xs flex p-2 rounded border ${
                                activeTokenSet === tokenSet && 'border-blue-500 bg-blue-100'
                            }`}
                            type="button"
                            onClick={() => setActiveTokenSet(tokenSet)}
                        >
                            <input
                                type="checkbox"
                                className="py-2 pl-2"
                                id={`toggle-${tokenSet}`}
                                checked={isUsedTokenSet(tokenSet)}
                                onChange={() => toggleUsedTokenSet(tokenSet)}
                            />
                            {tokenSet}
                        </button>
                    </ContextMenuTrigger>
                    <ContextMenu id={`${tokenSet}-trigger`} className="text-xs">
                        <MenuItem disabled={editProhibited} onClick={() => handleRenameTokenSet(tokenSet)}>
                            Rename
                        </MenuItem>
                        <MenuItem disabled={editProhibited} onClick={() => handleDeleteTokenSet(tokenSet)}>
                            Delete
                        </MenuItem>
                    </ContextMenu>
                </div>
            ))}

            <Modal isOpen={showDeleteTokenSetModal} close={() => setShowDeleteTokenSetModal(false)}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <Heading>Are you sure?</Heading>
                    <div className="space-x-4">
                        <Button variant="secondary" size="large" onClick={() => setShowDeleteTokenSetModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleConfirmDeleteTokenSet}>
                            Yes, delete it.
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={showRenameTokenSetFields} close={() => setShowRenameTokenSetFields(false)}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <Heading>Rename {tokenSetMarkedForChange}</Heading>
                    <form onSubmit={handleRenameTokenSetSubmit} className="space-y-4">
                        <Input
                            full
                            value={newTokenSetName}
                            onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                            type="text"
                            name="tokensetname"
                            required
                        />
                        <div className="space-x-4">
                            <Button variant="secondary" size="large" onClick={() => setShowRenameTokenSetFields(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="large">
                                Change
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {!editProhibited && showNewTokenSetFields ? (
                <form onSubmit={handleNewTokenSetSubmit}>
                    <Input
                        full
                        value={newTokenSetName}
                        onChange={(e) => handleNewTokenSetNameChange(e.target.value)}
                        type="text"
                        name="tokensetname"
                        required
                    />
                </form>
            ) : (
                <Tooltip label="Add new token set">
                    <button
                        className="button button-ghost"
                        type="button"
                        onClick={() => setShowNewTokenSetFields(true)}
                    >
                        <Icon name="add" />
                    </button>
                </Tooltip>
            )}
        </div>
    );
}
