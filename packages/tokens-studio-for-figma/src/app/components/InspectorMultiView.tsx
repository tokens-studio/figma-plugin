import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Checkbox, Label, Stack, Button, EmptyState,
} from '@tokens-studio/ui';
import { Dispatch } from '../store';
import useTokens from '../store/useTokens';
import InspectorTokenGroup from './InspectorTokenGroup';
import { SingleToken } from '@/types/tokens';
import { inspectStateSelector, uiStateSelector } from '@/selectors';
import { isEqual } from '@/utils/isEqual';
import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';
import { SelectionGroup } from '@/types';
import { NodeInfo } from '@/types/NodeInfo';
import { StyleIdBackupKeys } from '@/constants/StyleIdBackupKeys';
import OnboardingExplainer from './OnboardingExplainer';
import BulkRemapModal from './modals/BulkRemapModal';

export default function InspectorMultiView({ resolvedTokens, tokenToSearch }: { resolvedTokens: SingleToken[], tokenToSearch: string }) {
  const { t } = useTranslation(['inspect']);

  const onboardingData = {
    title: t('inspect'),
    text: t('inspectOnboard'),
    url: 'https://docs.tokens.studio/inspect/multi-inspect?ref=onboarding_explainer_inspect',
  };

  const inspectState = useSelector(inspectStateSelector, isEqual);
  const uiState = useSelector(uiStateSelector, isEqual);
  const { removeTokensByValue, setNoneValuesOnNode } = useTokens();
  const [bulkRemapModalVisible, setShowBulkRemapModalVisible] = React.useState(false);
  const dispatch = useDispatch<Dispatch>();

  React.useEffect(() => {
    dispatch.inspectState.setSelectedTokens([]);
  }, [uiState.selectionValues]);

  const filteredSelectionValues = React.useMemo(() => {
    let result = uiState.selectionValues;
    if (!inspectState.isShowBrokenReferences) {
      result = result.filter((token) => resolvedTokens.find((resolvedToken) => resolvedToken.name === token.value) || token.resolvedValue);
    }
    if (!inspectState.isShowResolvedReferences) {
      result = result.filter((token) => (!resolvedTokens.find((resolvedToken) => resolvedToken.name === token.value) && !token.resolvedValue));
    }
    return tokenToSearch ? result.filter((token) => token.value.includes(tokenToSearch)) : result;
  }, [uiState.selectionValues, inspectState.isShowBrokenReferences, inspectState.isShowResolvedReferences, resolvedTokens, tokenToSearch]);

  const groupedSelectionValues = React.useMemo(() => (
    filteredSelectionValues.reduce<Partial<
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
  ), [filteredSelectionValues]);

  const removeTokens = React.useCallback(() => {
    const valuesToRemove = uiState.selectionValues
      .filter((v) => inspectState.selectedTokens.includes(`${v.category}-${v.value}`))
      .map((v) => ({ nodes: v.nodes, property: v.type })) as ({
      property: Properties;
      nodes: NodeInfo[];
    }[]);

    removeTokensByValue(valuesToRemove);
  }, [inspectState.selectedTokens, removeTokensByValue, uiState.selectionValues]);

  const handleSelectAll = React.useCallback(() => {
    dispatch.inspectState.setSelectedTokens(
      inspectState.selectedTokens.length === filteredSelectionValues.length
        ? []
        : filteredSelectionValues.map((v) => `${v.category}-${v.value}`),
    );
  }, [dispatch.inspectState, inspectState.selectedTokens.length, filteredSelectionValues]);

  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerInspect(false);
  }, [dispatch]);

  const setNoneValues = React.useCallback(() => {
    setNoneValuesOnNode(resolvedTokens);
  }, [setNoneValuesOnNode, resolvedTokens]);

  const handleShowBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(true);
  }, []);

  const handleHideBulkRemap = React.useCallback(() => {
    setShowBulkRemapModalVisible(false);
  }, []);

  return (
    <>
      {uiState.selectionValues.length > 0 && (
        <Box css={{
          display: 'inline-flex', paddingInline: '$4', rowGap: '$3', justifyContent: 'space-between',
        }}
        >
          <Box css={{
            display: 'flex', alignItems: 'center', gap: '$3', fontSize: '$small', flexBasis: '80px', flexShrink: 0,
          }}
          >
            <Checkbox
              checked={inspectState.selectedTokens.length === uiState.selectionValues.length}
              id="selectAll"
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="selectAll" css={{ fontSize: '$small', fontWeight: '$sansBold', whiteSpace: 'nowrap' }}>
              {t('selectAll')}
            </Label>
          </Box>
          <Box css={{
            display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '$3',
          }}
          >
            <Button size="small" onClick={handleShowBulkRemap} variant="secondary">
              {t('bulkRemap')}
            </Button>
            <Button size="small" onClick={setNoneValues} disabled={inspectState.selectedTokens.length === 0} variant="secondary">
              {t('setToNone')}
            </Button>
            <Button size="small" onClick={removeTokens} disabled={inspectState.selectedTokens.length === 0} variant="danger">
              {t('removeSelected')}
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
          </Box>
        ) : (
          <Stack direction="column" gap={4} css={{ padding: '$5', margin: 'auto' }}>
            <EmptyState title={uiState.selectedLayers > 0 ? t('noTokensFound') : t('noLayersSelected')} description={uiState.selectedLayers > 0 ? t('noLayersWithTokens') : t('selectLayer')} />
            {/* FIXME: Use selectors - this rerenders */}
            {uiState.onboardingExplainerInspect && (
              <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
            )}
          </Stack>
        )}
      </Box>
      {bulkRemapModalVisible && (
        <BulkRemapModal
          isOpen={bulkRemapModalVisible}
          onClose={handleHideBulkRemap}
        />
      )}
    </>
  );
}
