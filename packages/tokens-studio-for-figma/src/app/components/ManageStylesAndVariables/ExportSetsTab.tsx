import { FileDirectoryIcon } from '@primer/octicons-react';
import {
  Tabs, Stack, Heading, Button,
} from '@tokens-studio/ui';
import React, { useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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

export default function ExportSetsTab({
  selectedSets,
  setSelectedSets,
}: {
  selectedSets: ExportTokenSet[];
  setSelectedSets: (sets: ExportTokenSet[]) => void;
}) {
  const dispatch = useDispatch<Dispatch>();
  const closeOnboarding = React.useCallback(() => {
    dispatch.uiState.setOnboardingExplainerExportSets(false);
  }, [dispatch]);
  const onboardingExplainerExportSets = useSelector((state: RootState) => state.uiState.onboardingExplainerExportSets);

  const { t } = useTranslation(['manageStylesAndVariables']);

  const store = useStore<RootState>();

  const selectedTokenSets = React.useMemo(() => usedTokenSetSelector(store.getState()), [store]);

  const { control, getValues, reset } = useForm<FormValues>({
    defaultValues: {
      tokenSets: { ...selectedTokenSets },
    },
  });

  const [showChangeSets, setShowChangeSets] = React.useState(false);
  const [previousSetSelection, setPreviousSetSelection] = React.useState({});

  const allSets = useSelector(allTokenSetsSelector);

  const availableTokenSets = useSelector(allTokenSetsSelector);

  const setsTree = React.useMemo(() => tokenSetListToTree(availableTokenSets), [availableTokenSets]);

  const handleCancelChangeSets = React.useCallback(() => {
    reset(previousSetSelection);
    setShowChangeSets(false);
  }, [previousSetSelection, reset]);

  const handleSaveChangeSets = React.useCallback(() => {
    setShowChangeSets(false);
  }, []);

  const handleShowChangeSets = React.useCallback(() => {
    setShowChangeSets(true);
    setPreviousSetSelection(getValues());
  }, [getValues]);

  const TokenSetThemeItemInput = React.useCallback(
    (props: React.PropsWithChildren<{ item: TreeItem }>) => (
      <Controller
        name="tokenSets"
        control={control}
        // this is the only way to do this
        // eslint-disable-next-line
        render={({ field }) => <TokenSetThemeItem {...props} value={field.value} onChange={field.onChange} />}
      />
    ),
    [control],
  );

  const selectedEnabledSets = useMemo(
    () => selectedSets.filter((set) => set.status === TokenSetStatus.ENABLED),
    [selectedSets],
  );

  React.useEffect(() => {
    if (!showChangeSets) {
      const currentSelectedSets = getValues();
      const internalSelectedTokenSets: ExportTokenSet[] = Object.keys(currentSelectedSets.tokenSets).reduce(
        (acc: ExportTokenSet[], curr: string) => {
          if (currentSelectedSets.tokenSets[curr] !== TokenSetStatus.DISABLED) {
            const tokenSet = {
              set: curr,
              status: currentSelectedSets.tokenSets[curr],
            } as ExportTokenSet;
            acc.push(tokenSet);
          }
          return acc;
        },
        [] as ExportTokenSet[],
      );
      setSelectedSets([...internalSelectedTokenSets]);
    }
  }, [showChangeSets, getValues, setSelectedSets]);

  return (
    <Tabs.Content value="useSets">
      <StyledCard>
        <Stack direction="column" align="start" gap={6}>
          <Stack direction="column" align="start" gap={4}>
            {onboardingExplainerExportSets ? (
              <OnboardingExplainer
                data={{
                  text: t('exportSetsTab.intro'),
                  title: t('exportSetsTab.confirmSets'),
                  url: docsLinks.stylesAndVariables,
                }}
                closeOnboarding={closeOnboarding}
              />
            ) : (
              <Stack direction="row" align="center" gap={2}>
                <Heading>{t('exportSetsTab.confirmSets')}</Heading>
                <ExplainerModal title={t('exportSetsTab.confirmSets')}>
                  {t('exportSetsTab.intro')}
                  {/* Commenting out until we have those docs ready <Link target="_blank" href={docsLinks.stylesAndVariables}>{`${t('generic.learnMore')} – ${t('docs.stylesAndVariables')}`}</Link> */}
                </ExplainerModal>
              </Stack>
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
          <Button variant="secondary" size="small" onClick={handleShowChangeSets}>
            {t('actions.changeSets')}
          </Button>
        </Stack>
      </StyledCard>
      <Modal
        size="fullscreen"
        compact
        isOpen={showChangeSets}
        close={handleCancelChangeSets}
        backArrow
        title="Styles and Variables / Export Sets"
        footer={
          <Stack direction="row" gap={4} justify="between">
            <Button variant="secondary" onClick={handleCancelChangeSets}>
              {t('actions.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSaveChangeSets}>
              {t('actions.confirm')}
            </Button>
          </Stack>
        }
      >
        <Heading>{t('exportSetsTab.changeSetsHeading')}</Heading>
        {/* Commenting until we have docs <Link target="_blank" href={docsLinks.sets}>{`${t('generic.learnMore')} – ${t('docs.referenceOnlyMode')}`}</Link> */}
        <Stack
          direction="column"
          gap={1}
          css={{
            marginBlockStart: '$4',
          }}
        >
          <TokenSetTreeContent items={setsTree} renderItemContent={TokenSetThemeItemInput} keyPosition="end" />
        </Stack>
      </Modal>
    </Tabs.Content>
  );
}
