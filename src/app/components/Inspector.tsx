import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SelectionGroup, SelectionValue} from 'Types/tokens';
import useConfirm from '../hooks/useConfirm';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';
import Box from './Box';
import Button from './Button';
import Checkbox from './Checkbox';
import Heading from './Heading';
import Icon from './Icon';
import Label from './Label';
import Tooltip from './Tooltip';

const Inspector = () => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {inspectDeep} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();

    const {removeTokensByValue, removeAllTokensFromNodes} = useTokens();

    function removeSingleToken({key, selectionValues}) {
        const valuesToRemove = selectionValues
            .filter((v) => v.value === key)
            .map((v) => {
                return {nodes: v.nodes, property: v.type};
            });
        removeTokensByValue(valuesToRemove);
    }

    const {confirm} = useConfirm();

    function groupAndRenderSelectionValues(selectionValues: SelectionGroup[]) {
        const grouped = selectionValues.reduce((acc, curr) => {
            if (acc[curr.category]) {
                const sameValueIndex = acc[curr.category].findIndex((v) => v.value === curr.value);

                if (sameValueIndex > -1) {
                    acc[curr.category][sameValueIndex].nodes.push(...curr.nodes);
                } else {
                    acc[curr.category] = [...acc[curr.category], curr];
                }
            } else {
                acc[curr.category] = [curr];
            }
            return acc;
        }, {});

        return Object.entries(grouped).map(([groupKey, groupValue]) => {
            return (
                <Box
                    css={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
                    key={`${groupKey}`}
                >
                    <Heading>{groupKey}</Heading>
                    {groupValue.map((uniqueToken) => (
                        <Box
                            css={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
                            key={`${uniqueToken.value}`}
                        >
                            {uniqueToken.value} ({uniqueToken.nodes.length})
                            <Tooltip label="Remove token from layer" side="bottom">
                                <button
                                    className="button button-ghost"
                                    type="button"
                                    onClick={() =>
                                        removeSingleToken({
                                            key: uniqueToken.value,
                                            selectionValues,
                                        })
                                    }
                                >
                                    <Icon name="trash" />
                                </button>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            );
        });
    }

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
            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={inspectDeep}
                    defaultChecked={inspectDeep}
                    id="inspectDeep"
                    onCheckedChange={() => dispatch.settings.setInspectDeep(!inspectDeep)}
                />
                <Label htmlFor="inspectDeep">Deep inspect</Label>
            </div>
            <div className="space-y-1">
                {uiState.selectionValues.length > 0 ? (
                    <>
                        {groupAndRenderSelectionValues(uiState.selectionValues)}
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
