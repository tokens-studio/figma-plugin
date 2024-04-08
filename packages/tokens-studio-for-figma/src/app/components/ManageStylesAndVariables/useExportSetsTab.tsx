import { FileDirectoryIcon } from '@primer/octicons-react';
import {
  Tabs, Stack, Heading, Button, Link,
} from '@tokens-studio/ui';
import React, { useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import Input from '../Input';
import Modal from '../Modal';
import { TokenSetTreeContent } from '../TokenSetTree/TokenSetTreeContent';
import { StyledCard } from './StyledCard';

import { ExplainerModal } from '../ExplainerModal';
import OnboardingExplainer from '../OnboardingExplainer';
import { Dispatch } from '../../store';

import { allTokenSetsSelector, usedTokenSetSelector } from '@/selectors';
import { docsLinks } from './docsLinks';
import { RootState } from '@/app/store';
import { tokenSetListToTree, TreeItem } from '@/utils/tokenset';
import { TokenSetThemeItem } from '../ManageThemesModal/TokenSetThemeItem';
import { FormValues } from '../ManageThemesModal/CreateOrEditThemeForm';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ExportTokenSet } from '@/types/ExportTokenSet';

export default function useExportSetsTab() {
  const dispatch = useDispatch<Dispatch>();
  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerExportSets(false);
  }, [dispatch]);
  const onboardingExplainerExportSets = useSelector((state: RootState) => state.uiState.onboardingExplainerExportSets);

  const { t } = useTranslation(['manageStylesAndVariables']);

  const store = useStore<RootState>();

  const [showChangeSets, setShowChangeSets] = React.useState(false);

  const allSets = useSelector(allTokenSetsSelector);
  const [selectedSets, setSelectedSets] = React.useState<ExportTokenSet[]>(allSets.map((set) => {
    const tokenSet = {
      set,
      status: TokenSetStatus.ENABLED,
    }
    return tokenSet;
  }));

  const selectedTokenSets = React.useMemo(() => (
    usedTokenSetSelector(store.getState())
  ), [store]);

  const availableTokenSets = useSelector(allTokenSetsSelector);

  const setsTree = React.useMemo(() => tokenSetListToTree(availableTokenSets), [availableTokenSets]);

  const [filteredItems, setFilteredItems] = React.useState(setsTree);
  const [filterQuery, setFilterQuery] = React.useState(''); // eslint-disable-line

  const handleFilterTree = React.useCallback(
    (event) => {
      const value = event?.target.value;
      const filtered = setsTree.filter((item) => item.path.toLowerCase().includes(value.toLowerCase()));
      setFilteredItems(filtered);
    },
    [setsTree],
  );

  const handleCancelChangeSets = React.useCallback(() => {
    // DO NOT SAVE THE SET CHANGES
    setShowChangeSets(false);
  }, []);

  const handleShowChangeSets = React.useCallback(() => {
    setShowChangeSets(true);
  }, []);

  const { control, getValues } = useForm<FormValues>({
    defaultValues: {
      tokenSets: { ...selectedTokenSets },
    },
  });

  const TokenSetThemeItemInput = React.useCallback((props: React.PropsWithChildren<{ item: TreeItem }>) => (
    <Controller
      name="tokenSets"
      control={control}
      // this is the only way to do this
      // eslint-disable-next-line
      render={({ field }) => (
        <TokenSetThemeItem
          {...props}
          value={field.value}
          onChange={field.onChange}
        />
      )}
    />
  ), [control]);

  const selectedEnabledSets = useMemo(() => {
    return selectedSets.filter((set) => set.status === TokenSetStatus.ENABLED);
  }, [selectedSets]);

  React.useEffect(() => {
    if (!showChangeSets) {
      const currentSelectedSets = getValues();
      const selectedTokenSets: ExportTokenSet[] = Object.keys(currentSelectedSets.tokenSets).reduce((acc: ExportTokenSet[], curr: string) => {
        if (currentSelectedSets.tokenSets[curr] !== TokenSetStatus.DISABLED) {
          const tokenSet = {
            set: curr,
            status: currentSelectedSets.tokenSets[curr]
          } as ExportTokenSet;
          acc.push(tokenSet);
        }
        return acc;
      }, [] as ExportTokenSet[]);
      setSelectedSets([...selectedTokenSets]);
    }
  }, [showChangeSets]);

  const ExportSetsTab = () => (
    <Tabs.Content value="useSets">
      <StyledCard>
        <Stack direction="column" align="start" gap={6}>
          <Stack direction="column" align="start" gap={4}>
            {!onboardingExplainerExportSets && (
              <Stack direction="row" align="center" gap={2}>
                <Heading>{t('exportSetsTab.confirmSets')}</Heading>
                <ExplainerModal title={t('exportSetsTab.confirmSets')}>
                  {t('exportSetsTab.intro')}
                  <Link target="_blank" href={docsLinks.stylesAndVariables}>{`${t('generic.learnMore')} – ${t('docs.stylesAndVariables')}`}</Link>
                </ExplainerModal>
              </Stack>
            )}
            {onboardingExplainerExportSets && (
            <OnboardingExplainer
              data={{
                text: t('exportSetsTab.intro'),
                title: t('exportSetsTab.confirmSets'),
                url: docsLinks.stylesAndVariables,
              }}
              closeOnboarding={closeOnboarding}
            />
            )}
          </Stack>
          <Stack direction="row" align="start" gap={2}>
            <FileDirectoryIcon size="small" />
            <span>
              {selectedEnabledSets.length}
              {' of '}
              {allSets.length}
              {' '}
              {t('exportSetsTab.setsSelectedForExport')}
            </span>
          </Stack>
          <Button variant="secondary" size="small" onClick={handleShowChangeSets}>{t('actions.changeSets')}</Button>
        </Stack>
      </StyledCard>
      <Modal size="fullscreen" full compact isOpen={showChangeSets} close={handleCancelChangeSets} backArrow title="Styles and Variables / Export Sets">
        <Heading>{t('exportSetsTab.changeSetsHeading')}</Heading>
        <Link target="_blank" href={docsLinks.sets}>{`${t('generic.learnMore')} – ${t('docs.referenceOnlyMode')}`}</Link>
        <Stack
          direction="column"
          css={{
            marginBlockStart: '$4',
          }}
        >
          <Input placeholder="Search sets" onInput={handleFilterTree} value={filterQuery} />
          <TokenSetTreeContent items={filteredItems} renderItemContent={TokenSetThemeItemInput} keyPosition="end" />
        </Stack>
      </Modal>
    </Tabs.Content>
  );
  return {
    ExportSetsTab,
    selectedSets,
  };
}
