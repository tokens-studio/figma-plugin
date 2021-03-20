import React from 'react';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {useTokenDispatch, useTokenState} from '../store/TokenContext';
import Button from './Button';
import Heading from './Heading';
import Icon from './Icon';
import Input from './Input';
import Modal from './Modal';
import TokenSetItem from './TokenSetItem';
import Tooltip from './Tooltip';

export default function TokenSetSelector() {
    const {tokenData, editProhibited} = useTokenState();
    const {addTokenSet, renameTokenSet, deleteTokenSet, setTokenSetOrder} = useTokenDispatch();
    const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
    const [showDeleteTokenSetModal, setShowDeleteTokenSetModal] = React.useState(false);
    const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
    const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
    const [tokenSetMarkedForChange, setTokenSetMarkedForChange] = React.useState('');
    const [totalTokenSetArray, setTotalTokenSetArray] = React.useState(Object.keys(tokenData.tokens));

    React.useEffect(() => {
        setTotalTokenSetArray(Object.keys(tokenData.tokens));
    }, [tokenData.tokens]);

    const stringOrder = JSON.stringify(totalTokenSetArray);

    React.useEffect(() => {
        setTotalTokenSetArray(totalTokenSetArray);
    }, [stringOrder, totalTokenSetArray]);

    const orderPositions = (array, from, to) => {
        const newArray = [...array];
        newArray.splice(to, 0, newArray.splice(from, 1)[0]);
        setTotalTokenSetArray(newArray);
    };

    const reorderSets = (from, to) => {
        orderPositions(totalTokenSetArray, from, to);
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
        <div className="flex flex-row gap-2 px-4 pt-2 pb-0 overflow-x-auto">
            <DndProvider backend={HTML5Backend}>
                {totalTokenSetArray.map((tokenSet, index) => (
                    <TokenSetItem
                        onDrop={() => setTokenSetOrder(totalTokenSetArray)}
                        onMove={reorderSets}
                        tokenSet={tokenSet}
                        index={index}
                        key={tokenSet}
                        onRename={handleRenameTokenSet}
                        onDelete={handleDeleteTokenSet}
                    />
                ))}
            </DndProvider>
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

            {showNewTokenSetFields ? (
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
                        disabled={editProhibited}
                        onClick={() => setShowNewTokenSetFields(true)}
                    >
                        <Icon name="add" />
                    </button>
                </Tooltip>
            )}
        </div>
    );
}
