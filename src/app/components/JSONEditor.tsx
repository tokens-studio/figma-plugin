import * as React from 'react';
import Textarea from './Textarea';
import Heading from './Heading';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';
import Modal from './Modal';
import ThemeSelector from './ThemeSelector';

const JSONEditor = () => {
    const {tokenData, activeTokenSet, editProhibited} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [confirmModalVisible, showConfirmModal] = React.useState('');

    const handleUpdate = async () => {
        await setLoading(true);
        updateTokens();
    };

    const handleSetDefault = () => {
        setDefaultTokens();
        showConfirmModal('');
    };

    const handleSetEmpty = () => {
        setEmptyTokens();
        showConfirmModal('');
    };

    return (
        <div className="flex flex-col flex-grow">
            <ThemeSelector />
            <Modal isOpen={confirmModalVisible === 'reset'} close={() => showConfirmModal('')}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <div className="space-y-2">
                        <Heading>Are you sure?</Heading>
                        <p className="text-xs">
                            You can undo this action by <br />
                            performing Undo in Figma itself.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Button variant="secondary" size="large" onClick={() => showConfirmModal('')}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleSetDefault}>
                            Yes, set to default.
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={confirmModalVisible === 'delete'} close={() => showConfirmModal('')}>
                <div className="flex justify-center flex-col text-center space-y-4">
                    <div className="space-y-2">
                        <Heading>Are you sure?</Heading>
                        <p className="text-xs">
                            You can undo this action by <br />
                            performing Undo in Figma itself.
                        </p>
                    </div>
                    <div className="space-x-4">
                        <Button variant="secondary" size="large" onClick={() => showConfirmModal('')}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="large" onClick={handleSetEmpty}>
                            Yes, clear all tokens.
                        </Button>
                    </div>
                </div>
            </Modal>
            <div className="flex flex-col justify-between items-center flex-grow">
                <div className="flex flex-col p-4 pt-2 w-full items-center flex-grow">
                    <Textarea
                        isDisabled={editProhibited}
                        className="flex-grow"
                        placeholder="Enter JSON"
                        rows={23}
                        hasErrored={tokenData.tokens[activeTokenSet].hasErrored}
                        onChange={(val) => setStringTokens({parent: activeTokenSet, tokens: val})}
                        value={tokenData.tokens[activeTokenSet].values}
                    />
                </div>
            </div>

            <div className="flex justify-between w-full px-4 bg-white">
                <div className="space-x-2 flex mr-2">
                    <Button
                        disabled={editProhibited}
                        variant="secondary"
                        size="large"
                        onClick={() => showConfirmModal('reset')}
                    >
                        Fill with example data
                    </Button>
                    <Button
                        disabled={editProhibited}
                        variant="secondary"
                        size="large"
                        onClick={() => showConfirmModal('delete')}
                    >
                        Clear
                    </Button>
                </div>
                <Button disabled={editProhibited} variant="primary" size="large" onClick={handleUpdate}>
                    Save & update
                </Button>
            </div>
        </div>
    );
};
export default JSONEditor;
