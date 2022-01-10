import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {SelectionGroup, SelectionValue} from 'Types/tokens';
import IconLayers from '@/icons/layers.svg';
import {Dispatch, RootState} from '../store';
import useTokens from '../store/useTokens';
import Box from './Box';
import Button from './Button';
import Checkbox from './Checkbox';
import Heading from './Heading';
import Label from './Label';

function renderResolvedtoken(token) {
    if (!token) return null;
    switch (token?.type) {
        case 'color': {
            return (
                <Box
                    css={{
                        background: token.value,
                        width: '24px',
                        height: '24px',
                        borderRadius: '100%',
                    }}
                />
            );
        }
        case 'typography': {
            return (
                <Box
                    css={{
                        background: '$bgSubtle',
                        fontSize: '$small',
                        padding: '$2 $3',
                        borderRadius: '$default',
                        width: '40px',
                    }}
                >
                    aA
                </Box>
            );
        }
        case 'boxShadow': {
            return (
                <Box
                    css={{
                        background: '$bgSubtle',
                        fontSize: '$small',
                        padding: '$2 $3',
                        borderRadius: '$default',
                        width: '40px',
                    }}
                >
                    shd
                </Box>
            );
        }
        default: {
            return (
                <Box
                    css={{
                        background: '$bgSubtle',
                        fontSize: '$small',
                        padding: '$2 $3',
                        borderRadius: '$default',
                        width: '40px',
                    }}
                >
                    {token.value}
                </Box>
            );
        }
    }
}

const Inspector = () => {
    const uiState = useSelector((state: RootState) => state.uiState);
    const {inspectDeep} = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch<Dispatch>();
    const [selectedTokens, setSelectedTokens] = React.useState([]);

    const toggleSelectedTokens = (token: SelectionValue) => {
        if (selectedTokens.includes(token)) {
            setSelectedTokens(selectedTokens.filter((t) => t !== token));
        } else {
            setSelectedTokens([...selectedTokens, token]);
        }
    };

    const {removeTokensByValue, findToken} = useTokens();

    function removeTokens() {
        const valuesToRemove = uiState.selectionValues
            .filter((v) => selectedTokens.includes(v.value))
            .map((v) => {
                return {nodes: v.nodes, property: v.type};
            });
        removeTokensByValue(valuesToRemove);
    }

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
                    css={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        marginBottom: '$3',
                    }}
                    key={`${groupKey}`}
                >
                    <Heading size="small">{groupKey}</Heading>
                    {groupValue.map((uniqueToken) => {
                        const resolvedToken = findToken(uniqueToken.value);
                        return (
                            <Box
                                css={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    paddingTop: '$2',
                                    paddingBottom: '$2',
                                }}
                                key={`${uniqueToken.value}`}
                            >
                                <Box
                                    css={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: '$4',
                                    }}
                                >
                                    <Checkbox
                                        defaultChecked={selectedTokens.includes(uniqueToken.value)}
                                        checked={selectedTokens.includes(uniqueToken.value)}
                                        id={uniqueToken.value}
                                        onCheckedChange={() => toggleSelectedTokens(uniqueToken.value)}
                                    />
                                    {renderResolvedtoken(resolvedToken)}

                                    <Box css={{fontSize: '$small'}}>{uniqueToken.value}</Box>
                                </Box>
                                <Box
                                    css={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '$3',
                                        fontWeight: '$bold',
                                        fontSize: '$small',
                                    }}
                                >
                                    <Box css={{color: '$fgSubtle'}}>
                                        <IconLayers />
                                    </Box>
                                    {uniqueToken.nodes.length}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            );
        });
    }

    return (
        <Box css={{gap: '$2', padding: '$4'}}>
            <Box
                css={{
                    display: 'flex',
                    border: '1px solid $border',
                    borderRadius: '$card',
                    marginBottom: '$4',
                    padding: '$4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                }}
            >
                <Checkbox
                    checked={inspectDeep}
                    defaultChecked={inspectDeep}
                    id="inspectDeep"
                    onCheckedChange={() => dispatch.settings.setInspectDeep(!inspectDeep)}
                />
                <Label htmlFor="inspectDeep">
                    <Box css={{fontWeight: '$bold', fontSize: '$small', marginBottom: '$1'}}>Deep inspect</Box>
                    <Box css={{fontSize: '$small'}}>Scans the selected layer and all of its children</Box>
                </Label>
            </Box>
            <Box css={{display: 'flex', flexDirection: 'column', gap: '$1'}}>
                {uiState.selectionValues.length > 0 ? (
                    <>
                        <Box css={{display: 'flex', alignItems: 'center', gap: '$3', justifyContent: 'space-between'}}>
                            <Box css={{display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small'}}>
                                <Checkbox
                                    checked={selectedTokens.length === uiState.selectionValues.length}
                                    defaultChecked={false}
                                    id="selectAll"
                                    onCheckedChange={() => {
                                        if (selectedTokens.length > 0) {
                                            setSelectedTokens([]);
                                        } else {
                                            setSelectedTokens(uiState.selectionValues.map((v) => v.value));
                                        }
                                    }}
                                />
                                <Label htmlFor="selectAll" css={{fontSize: '$small', fontWeight: '$bold'}}>
                                    Select all
                                </Label>
                            </Box>
                            <Button onClick={removeTokens} disabled={selectedTokens.length === 0} variant="secondary">
                                Remove selected
                            </Button>
                        </Box>
                        {groupAndRenderSelectionValues(uiState.selectionValues)}
                    </>
                ) : (
                    <div>No selection</div>
                )}
            </Box>
        </Box>
    );
};

export default Inspector;
