import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import Box from './Box';
import Checkbox from './Checkbox';
import Label from './Label';
import Blankslate from './Blankslate';
import InspectorTokenGroup from './InspectorTokenGroup';

export default function InspectorMultiView() {
  const inspectState = useSelector((state: RootState) => state.inspectState);
  const uiState = useSelector((state: RootState) => state.uiState);
  const { removeTokensByValue } = useTokens();

  const { inspectDeep } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<Dispatch>();

  React.useEffect(() => {
    dispatch.inspectState.setSelectedTokens([]);
  }, [uiState.selectionValues]);

  const groupedSelectionValues = React.useMemo(() => uiState.selectionValues.reduce((acc, curr) => {
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
  }, {}), [uiState.selectionValues]);

  const removeTokens = React.useCallback(() => {
    const valuesToRemove = uiState.selectionValues
      .filter((v) => inspectState.selectedTokens.includes(`${v.category}-${v.value}`))
      .map((v) => ({ nodes: v.nodes, property: v.type }));

    console.log('REMOVNG', valuesToRemove, uiState.selectionValues, inspectState.selectedTokens);
    removeTokensByValue(valuesToRemove);
  }, [inspectState.selectedTokens, removeTokensByValue, uiState.selectionValues]);

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '$4',
    }}
    >
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
          id="inspectDeep"
          onCheckedChange={() => dispatch.settings.setInspectDeep(!inspectDeep)}
        />
        <Label htmlFor="inspectDeep">
          <Box css={{ fontWeight: '$bold', fontSize: '$small', marginBottom: '$1' }}>Deep inspect</Box>
          <Box css={{ fontSize: '$small' }}>Scans the selected layer and all of its children</Box>
        </Label>
      </Box>
      {uiState.selectionValues.length > 0 ? (
        <Box css={{ display: 'flex', flexDirection: 'column', gap: '$1' }}>
          <Box css={{
            display: 'flex', alignItems: 'center', gap: '$3', justifyContent: 'space-between',
          }}
          >
            <Box css={{
              display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small',
            }}
            >
              <Checkbox
                checked={inspectState.selectedTokens.length === uiState.selectionValues.length}
                id="selectAll"
                onCheckedChange={() => {
                  dispatch.inspectState.setSelectedTokens(
                    inspectState.selectedTokens.length === uiState.selectionValues.length
                      ? []
                      : uiState.selectionValues.map((v) => `${v.category}-${v.value}`),
                  );
                }}
              />
              <Label htmlFor="selectAll" css={{ fontSize: '$small', fontWeight: '$bold' }}>
                Select all
              </Label>
            </Box>
            <Button onClick={removeTokens} disabled={inspectState.selectedTokens.length === 0} variant="secondary">
              Remove selected
            </Button>
          </Box>
          {Object.entries(groupedSelectionValues).map((group) => <InspectorTokenGroup key={`inspect-group-${group[0]}`} group={group} />)}
        </Box>
      ) : (
        <Blankslate title={uiState.selectedLayers ? 'No tokens found' : 'No layers selected'} text={uiState.selectedLayers ? 'None of the selected layers contain any tokens' : 'Select a layer to see applied tokens'} />
      )}
    </Box>
  );
}
