import * as React from 'react';
import JSONToken from './JSONToken';
import Textarea from './Textarea';
import Heading from './Heading';
import {useTokenState, useTokenDispatch} from '../store/TokenContext';
import Button from './Button';
import Modal from './Modal';
import IconChevronRight from './icons/IconChevronRight';
import IconChevronDown from './icons/IconChevronDown';

const supportedProperties = [
    'sizing',
    'spacing',
    'colors',
    'borderRadius',
    'borderWidth',
    'opacity',
    'fontFamilies',
    'fontWeights',
    'fontSizes',
    'lineHeights',
    'typography',
];

const JSONEditor = () => {
    const {tokenData} = useTokenState();
    const {setStringTokens, setEmptyTokens, setDefaultTokens, updateTokens, setLoading} = useTokenDispatch();
    const [activeToken] = React.useState('options');
    const [openToken, setOpenToken] = React.useState('all');
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
        <div>
            <div className="border-b border-gray-200">
                <Modal isOpen={confirmModalVisible === 'reset'} close={() => showConfirmModal('')}>
                    <div className="flex justify-center flex-col text-center space-y-4">
                        <div className="space-y-2">
                            <Heading>Are you sure?</Heading>
                            <p className="text-sm">You can undo this action by performing Undo in Figma itself.</p>
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
                            <p className="text-sm">You can undo this action by performing Undo in Figma itself.</p>
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
                <div className="flex flex-col justify-between items-center">
                    <button
                        className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                            openToken === 'all' ? 'opacity-50' : null
                        }`}
                        type="button"
                        onClick={() => (openToken === 'all' ? setOpenToken('') : setOpenToken('all'))}
                    >
                        <div className="p-2 -m-2">
                            {openToken !== 'all' ? <IconChevronRight /> : <IconChevronDown />}
                        </div>
                        <Heading size="small">All</Heading>
                    </button>
                    {openToken === 'all' && (
                        <div className="flex flex-col p-4 w-full items-center">
                            <Textarea
                                placeholder="Enter JSON"
                                rows={20}
                                hasErrored={tokenData.tokens[activeToken].hasErrored}
                                onChange={(val) => setStringTokens({parent: activeToken, tokens: val})}
                                value={tokenData.tokens[activeToken].values}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-8">
                {supportedProperties.map((token) => {
                    const handleClick = () => {
                        if (openToken === token) {
                            setOpenToken('');
                        } else {
                            setOpenToken(token);
                        }
                    };

                    return (
                        <div className="border-b border-gray-200" key={token}>
                            <div className="flex flex-col justify-between items-center">
                                <button
                                    className={`flex items-center w-full h-full p-4 space-x-2 hover:bg-gray-100 focus:outline-none ${
                                        openToken === token ? 'opacity-50' : null
                                    }`}
                                    type="button"
                                    onClick={handleClick}
                                >
                                    <div className="p-2 -m-2">
                                        {openToken !== token ? <IconChevronRight /> : <IconChevronDown />}
                                    </div>
                                    <Heading size="small">{token}</Heading>
                                </button>
                                {openToken === token && <JSONToken token={token} />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between w-full fixed bottom-0 p-4 bg-white">
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
