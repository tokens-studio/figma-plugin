import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SelectionGroup, SelectionValue } from '@/types/tokens';
import { RootState, Dispatch } from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import IconLayers from '@/icons/layers.svg';
import Box from './Box';
import Checkbox from './Checkbox';
import Heading from './Heading';
import Label from './Label';
import Blankslate from './Blankslate';
import IconBrokenLink from './icons/IconBrokenLink';
import Tooltip from './Tooltip';

function renderResolvedtoken(token) {
  // TODO: Introduce shared component for token tooltips
  if (!token) {
    return (
      <Tooltip label="Token not found" side="bottom">
        <Box
          css={{
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            border: '1px solid $borderMuted',
            backgroundColor: '$bgSubtle',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBrokenLink />
        </Box>
      </Tooltip>
    );
  }
  switch (token?.type) {
    case 'color': {
      return (
        <Box
          css={{
            background: token.value,
            width: '24px',
            height: '24px',
            borderRadius: '100%',
            border: '1px solid $borderMuted',
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
    // TODO: Show shadow preview
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
            fontFamily: '$mono',
            overflow: 'hidden',
          }}
        >
          {token.value}
        </Box>
      );
    }
  }
}

export default function InspectorMultiView() {
  const uiState = useSelector((state: RootState) => state.uiState);
  const { findToken, removeTokensByValue } = useTokens();

  const { inspectDeep } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch<Dispatch>();
  const [selectedTokens, setSelectedTokens] = React.useState([]);

  const toggleSelectedTokens = (token: SelectionValue) => {
    if (selectedTokens.includes(token)) {
      setSelectedTokens(selectedTokens.filter((t) => t !== token));
    } else {
      setSelectedTokens([...selectedTokens, token]);
    }
  };

  function removeTokens() {
    const valuesToRemove = uiState.selectionValues
      .filter((v) => selectedTokens.includes(v.value))
      .map((v) => ({ nodes: v.nodes, property: v.type }));
    removeTokensByValue(valuesToRemove);
  }

  function groupAndRenderSelectionValues(selectionValues: SelectionGroup[]) {
    // TODO: Make this performant
    console.log('selectionValues', selectionValues);
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
      console.log('to this', acc);

      return acc;
    }, {});

    return Object.entries(grouped).map(([groupKey, groupValue]) => (
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
                  checked={selectedTokens.includes(uniqueToken.value)}
                  id={uniqueToken.value}
                  onCheckedChange={() => toggleSelectedTokens(uniqueToken.value)}
                />
                {renderResolvedtoken(resolvedToken)}

                <Box css={{ fontSize: '$small' }}>{uniqueToken.value}</Box>
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
                <Box css={{ color: '$fgSubtle' }}>
                  <IconLayers />
                </Box>
                {uniqueToken.nodes.length}
              </Box>
            </Box>
          );
        })}
      </Box>
    ));
  }
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
                checked={selectedTokens.length === uiState.selectionValues.length}
                id="selectAll"
                onCheckedChange={() => {
                  if (selectedTokens.length > 0) {
                    setSelectedTokens([]);
                  } else {
                    setSelectedTokens(uiState.selectionValues.map((v) => v.value));
                  }
                }}
              />
              <Label htmlFor="selectAll" css={{ fontSize: '$small', fontWeight: '$bold' }}>
                Select all
              </Label>
            </Box>
            <Button onClick={removeTokens} disabled={selectedTokens.length === 0} variant="secondary">
              Remove selected
            </Button>
          </Box>
          {groupAndRenderSelectionValues(uiState.selectionValues)}
        </Box>
      ) : (
        <Blankslate title={uiState.selectedLayers ? 'No tokens found' : 'No layers selected'} text={uiState.selectedLayers ? 'None of the selected layers contain any tokens' : 'Select a layer to see applied tokens'} />
      )}
    </Box>
  );
}
