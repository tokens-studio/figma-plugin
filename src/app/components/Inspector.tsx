import * as React from 'react';
import {useSelector} from 'react-redux';
import useConfirm from '../hooks/useConfirm';
import {RootState} from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import Icon from './Icon';
import Tooltip from './Tooltip';

const Inspector = () => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {removeNodeData, removeAllTokensFromNodes} = useTokens();

    const {confirm} = useConfirm();

    async function askIfRemoveAll(): Promise<boolean> {
        const isConfirmed = await confirm({
            text: 'Remove all tokens?',
            description: 'This will remove all applied tokens including tokens stored on children',
        });
        return isConfirmed;
    }

    const removeAll = async () => {
        const userDecision = await askIfRemoveAll();
        if (userDecision) {
            removeAllTokensFromNodes();
        }
    };

    return (
        <div className="space-y-2 p-4">
            <div className="space-y-1">
                {uiState.selectionValues.length > 0 ? (
                    <>
                        {uiState.selectionValues.map((item) => {
                            return (
                                <div className="flex flex-row justify-between" key={`${item.type}-${item[item.type]}`}>
                                    <div>
                                        {item.type}: {item[item.type]} ({item.nodes.length})
                                    </div>
                                    <Tooltip label="Remove token from layer" side="bottom">
                                        <button
                                            className="button button-ghost"
                                            type="button"
                                            onClick={() => removeNodeData({key: item.type, nodes: item.nodes})}
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </Tooltip>
                                </div>
                            );
                        })}
                        <div className="border-top border-gray-300">
                            <Button variant="destructive" onClick={() => removeAll()}>
                                Remove all tokens
                            </Button>
                        </div>
                    </>
                ) : (
                    <div>No selection</div>
                )}
            </div>
        </div>
    );
};

export default Inspector;
