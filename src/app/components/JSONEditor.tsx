import * as React from 'react';
import Textarea from './Textarea';
import Heading from './Heading';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';
import Modal from './Modal';

const JSONEditor = () => {
    const {tokenData} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [activeToken] = React.useState('options');
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
                <div className="flex flex-col p-4 w-full items-center flex-grow">
                    <Textarea
                        className="flex-grow"
                        placeholder="Enter JSON"
                        rows={23}
                        hasErrored={tokenData.tokens[activeToken].hasErrored}
                        onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                        value={tokenData.tokens[activeToken].values}
                    />
                </div>
            </div>

            <div className="flex justify-between w-full px-4 bg-white">
                <div className="space-x-2 flex mr-2">
                    <Button variant="secondary" size="large" onClick={() => showConfirmModal('reset')}>
                        Reset to Default
                    </Button>
                    <Button variant="secondary" size="large" onClick={() => showConfirmModal('delete')}>
                        Clear
                    </Button>
                </div>
                <Button variant="primary" size="large" onClick={handleUpdate}>
                    Save & update
                </Button>
            </div>
        </div>
    );
};
export default JSONEditor;
