import { FileDirectoryIcon } from '@primer/octicons-react';
import {
  Tabs, Stack, Heading, Button, Link, Label, Accordion, IconButton,
} from '@tokens-studio/ui';
import React, { useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Input from '../Input';

import { TokenSetTreeContent } from '../TokenSetTree/TokenSetTreeContent';
import { StyledCard } from './StyledCard';

import { allTokenSetsSelector, usedTokenSetSelector } from '@/selectors';
import { docsLinks } from './docsLinks';
import { RootState } from '@/app/store';
import { tokenSetListToTree, TreeItem } from '@/utils/tokenset';
import { TokenSetThemeItem } from '../ManageThemesModal/TokenSetThemeItem';
import { FormValues } from '../ManageThemesModal/CreateOrEditThemeForm';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { ExportTokenSet } from '@/types/ExportTokenSet';

import { ExplainerModal } from '../ExplainerModal';
import OnboardingExplainer from '../OnboardingExplainer';
import { Dispatch } from '../../store';

export default function useExportSetsTab() {
  const { t } = useTranslation(['manageStylesAndVariables']);

  const store = useStore<RootState>();

  const dispatch = useDispatch<Dispatch>();
  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerExportSets(false);
  }, [dispatch]);
  const onboardingExplainerExportSets = useSelector((state: RootState) => state.uiState.onboardingExplainerExportSets);

  const allSets = useSelector(allTokenSetsSelector);
  const [selectedSets, setSelectedSets] = React.useState<ExportTokenSet[]>(allSets.map((set) => {
    const tokenSet = {
      set,
      status: TokenSetStatus.ENABLED,
    };
    return tokenSet;
  }));

  const selectedTokenSets = React.useMemo(() => (
    usedTokenSetSelector(store.getState())
  ), [store]);

  const availableTokenSets = useSelector(allTokenSetsSelector);

  const setsTree = React.useMemo(() => tokenSetListToTree(availableTokenSets), [availableTokenSets]);

  const [filteredItems, setFilteredItems] = React.useState(setsTree);

  // TODO: filter search with this input
  const handleFilterTree = React.useCallback(
    (event) => {
      const value = event?.target.value;
      const filtered = setsTree.filter((item) => item.path.toLowerCase().includes(value.toLowerCase()));
      setFilteredItems(filtered);
    },
    [setsTree],
  );

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

  const selectedEnabledSets = useMemo(() => selectedSets.filter((set) => set.status === TokenSetStatus.ENABLED), [selectedSets]);

  // FIXME: This no longer works now that it's not inside the secondary modal @Hiroshi
  // React.useEffect(() => {
  //   if (!showChangeSets) {
  //     const currentSelectedSets = getValues();
  //     const selectedTokenSets: ExportTokenSet[] = Object.keys(currentSelectedSets.tokenSets).reduce((acc: ExportTokenSet[], curr: string) => {
  //       if (currentSelectedSets.tokenSets[curr] !== TokenSetStatus.DISABLED) {
  //         const tokenSet = {
  //           set: curr,
  //           status: currentSelectedSets.tokenSets[curr],
  //         } as ExportTokenSet;
  //         acc.push(tokenSet);
  //       }
  //       return acc;
  //     }, [] as ExportTokenSet[]);
  //     setSelectedSets([...selectedTokenSets]);
  //   }
  // }, [showChangeSets]);

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
          {/* TODO: filter search with this input */}
          <Input placeholder="Filter sets" />
          <Stack direction="column" gap={3} justify="between" width="full">
            <TokenSetTreeContent items={filteredItems} renderItemContent={TokenSetThemeItemInput} keyPosition="end" />
          </Stack>
        </Stack>
      </StyledCard>

    </Tabs.Content>
  );
  return {
    ExportSetsTab,
    selectedSets,
  };
}
