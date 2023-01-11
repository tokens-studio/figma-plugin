import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch } from '../store';
import useTokens from '../store/useTokens';
import Button from './Button';
import Box from './Box';
import Checkbox from './Checkbox';
import Label from './Label';
import Blankslate from './Blankslate';
import InspectorTokenGroup from './InspectorTokenGroup';
import { SingleToken } from '@/types/tokens';
import { inspectStateSelector, uiStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';
import { SelectionGroup } from '@/types';
import { NodeInfo } from '@/types/NodeInfo';
import BulkRemapModal from './modals/BulkRemapModal';
import { StyleIdBackupKeys } from '@/constants/StyleIdBackupKeys';
import OnboardingExplainer from './OnboardingExplainer';
import Stack from './Stack';

export default function InspectorMultiView({ resolvedTokens }: { resolvedTokens: SingleToken[] }) {
  const onboardingData = {
    title: 'Inspect',
    text: 'This is where applied tokens of your selection show up, you can use Deep Inspect to scan the selected layers and all of its children.',
    url: 'https://docs.figmatokens.com/inspect/multi-inspect?ref=onboarding_explainer_inspect',
  };

  const inspectState = useSelector(inspectStateSelector, isEqual);
  const uiState = useSelector(uiStateSelector, isEqual);
  const { removeTokensByValue } = useTokens();
  const [bulkRemapModalVisible, setShowBulkRemapModalVisible] = React.useState(false);
  const dispatch = useDispatch<Dispatch>();

  React.useEffect(() => {
    dispatch.inspectState.setSelectedTokens([]);
  }, [uiState.selectionValues]);

  const groupedSelectionValues = React.useMemo(() => (
    uiState.selectionValues.reduce<Partial<
    Record<TokenTypes, SelectionGroup[]>
    & Record<Properties, SelectionGroup[]>
    >>((acc, curr) => {
      if (StyleIdBackupKeys.includes(curr.type)) return acc;
      if (acc[curr.category]) {
        const sameValueIndex = acc[curr.category]!.findIndex((v) => v.value === curr.value);

        if (sameValueIndex > -1) {
          acc[curr.category]![sameValueIndex].nodes.push(...curr.nodes);
        } else {
          acc[curr.category] = [...acc[curr.category]!, curr];
        }
      } else {
        acc[curr.category] = [curr];
      }

      return acc;
    }, {})
  ), [uiState.selectionValues]);

  const removeTokens = React.useCallback(() => {
    const valuesToRemove = uiState.selectionValues
      .filter((v) => inspectState.selectedTokens.includes(`${v.category}-${v.value}`))
      .map((v) => ({ nodes: v.nodes, property: v.type })) as ({
      property: Properties;
      nodes: NodeInfo[];
    }[]);

    removeTokensByValue(valuesToRemove);
  }, [inspectState.selectedTokens, removeTokensByValue, uiState.selectionValues]);

  const handleShowBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(true);
  }, []);

  const handleHideBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(false);
  }, []);

  const handleSelectAll = React.useCallback(() => {
    dispatch.inspectState.setSelectedTokens(
      inspectState.selectedTokens.length === uiState.selectionValues.length
        ? []
        : uiState.selectionValues.map((v) => `${v.category}-${v.value}`),
    );
  }, [dispatch.inspectState, inspectState.selectedTokens.length, uiState.selectionValues]);

  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerInspect(false);
  }, [dispatch]);

  return (
    <>
      {uiState.selectionValues.length > 0 && (
      <Box css={{
        display: 'flex', alignItems: 'center', gap: '$3', justifyContent: 'space-between', paddingInline: '$4',
      }}
      >
        <Box css={{
          display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small',
        }}
        >
          <Checkbox
            checked={inspectState.selectedTokens.length === uiState.selectionValues.length}
            id="selectAll"
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="selectAll" css={{ fontSize: '$small', fontWeight: '$bold' }}>
            Select all
          </Label>
        </Box>
        <Box css={{ display: 'flex', flexDirection: 'row', gap: '$1' }}>
          <Button onClick={handleShowBulkRemap} variant="secondary">
            Bulk remap
          </Button>
          <Button onClick={removeTokens} disabled={inspectState.selectedTokens.length === 0} variant="secondary">
            Remove selected
          </Button>
        </Box>
      </Box>
      )}
      <Box
        css={{
          display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '$4',
        }}
        className="content scroll-container"
      >
        {uiState.selectionValues.length > 0 ? (
          <Box css={{ display: 'flex', flexDirection: 'column', gap: '$1' }}>
            {Object.entries(groupedSelectionValues).map((group) => <InspectorTokenGroup key={`inspect-group-${group[0]}`} group={group as [Properties, SelectionGroup[]]} resolvedTokens={resolvedTokens} />)}
            {bulkRemapModalVisible && (
            <BulkRemapModal
              isOpen={bulkRemapModalVisible}
              onClose={handleHideBulkRemap}
            />
            )}
          </Box>
        ) : (
          <Stack direction="column" gap={4} css={{ padding: '$5', margin: 'auto' }}>
            <Blankslate title={uiState.selectedLayers > 0 ? 'No tokens found' : 'No layers selected'} text={uiState.selectedLayers > 0 ? 'None of the selected layers contain any tokens' : 'Select a layer to see applied tokens'} />
            {uiState.onboardingExplainerInspect && (
              <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
            )}
          </Stack>
        )}
      </Box>
    </>
  );
}
