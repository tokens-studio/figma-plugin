import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box, Stack, Label, Button, TextInput,
} from '@tokens-studio/ui';
import { Resizable } from 're-resizable';
import { track } from '@/utils/analytics';
import useConfirm from '../hooks/useConfirm';
import { Dispatch } from '../store';
import IconAdd from '@/icons/add.svg';
import Modal from './Modal';
import TokenSetTree from './TokenSetTree';
import {
  editProhibitedSelector, tokensSelector, uiStateSelector,
} from '@/selectors';
import OnboardingExplainer from './OnboardingExplainer';

export default function TokenSetSelector({ saveScrollPositionSet }: { saveScrollPositionSet: (tokenSet: string) => void }) {
  const { t } = useTranslation(['tokens']);

  const onboardingData = {
    title: t('sets.title'),
    text: t('sets.description'),
    url: 'https://docs.tokens.studio/themes/token-sets?ref=onboarding_explainer_sets',
  };

  const tokens = useSelector(tokensSelector);
  const editProhibited = useSelector(editProhibitedSelector);
  const uiState = useSelector(uiStateSelector);
  const dispatch = useDispatch<Dispatch>();
  const { confirm } = useConfirm();

  const [showNewTokenSetFields, setShowNewTokenSetFields] = React.useState(false);
  const [showRenameTokenSetFields, setShowRenameTokenSetFields] = React.useState(false);
  const [newTokenSetName, handleNewTokenSetNameChange] = React.useState('');
  const [oldTokenSetName, setOldTokenSetName] = React.useState('');
  const [isDuplicate, setIsDuplicate] = React.useState(false);
  const allTokenSets = React.useMemo(() => Object.keys(tokens), [tokens]);

  React.useEffect(() => {
    const scrollPositionSet = allTokenSets.reduce<Record<string, number>>((acc, crr) => {
      acc[crr] = 0;
      return acc;
    }, {});
    dispatch.uiState.setScrollPositionSet(scrollPositionSet);
  }, [allTokenSets, dispatch]);

  React.useEffect(() => {
    setShowNewTokenSetFields(false);
  }, [tokens]);

  const handleNewTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    track('Created token set', { name: newTokenSetName });
    dispatch.tokenState.addTokenSet(newTokenSetName.trim());
    dispatch.tokenState.setActiveTokenSet(newTokenSetName.trim());
    handleNewTokenSetNameChange('');
  }, [dispatch, newTokenSetName]);

  const handleDeleteTokenSet = React.useCallback(async (tokenSet: string) => {
    track('Deleted token set');

    const userConfirmation = await confirm({
      text: t('sets.delete', { tokenSet }) as string,
      description: t('sets.deleteConfirmation'),
    });
    if (userConfirmation) {
      dispatch.tokenState.deleteTokenSet(tokenSet);
    }
  }, [confirm, dispatch, t]);

  const handleRenameTokenSet = React.useCallback((tokenSet: string) => {
    track('Renamed token set');
    handleNewTokenSetNameChange(tokenSet);
    setOldTokenSetName(tokenSet);
    setIsDuplicate(false);
    setShowRenameTokenSetFields(true);
  }, []);

  const handleDuplicateTokenSet = React.useCallback((tokenSet: string) => {
    const newTokenSetName = `${tokenSet}_${t('sets.duplicateSetSuffix')}`;
    handleNewTokenSetNameChange(newTokenSetName);
    setOldTokenSetName(tokenSet);
    setIsDuplicate(true);
    setShowRenameTokenSetFields(true);
  }, []);

  const handleRenameTokenSetSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDuplicate) {
      track('Duplicate token set', { name: newTokenSetName });
      dispatch.tokenState.duplicateTokenSet(newTokenSetName, oldTokenSetName);
    } else if (tokens.hasOwnProperty(oldTokenSetName)) {
      dispatch.tokenState.renameTokenSet({ oldName: oldTokenSetName, newName: newTokenSetName.trim() });
    } else {
      dispatch.tokenState.renameTokenSetFolder({ oldName: oldTokenSetName, newName: newTokenSetName.trim() });
    }
    setOldTokenSetName('');
    handleNewTokenSetNameChange('');
    setShowRenameTokenSetFields(false);
  }, [dispatch, newTokenSetName, oldTokenSetName, isDuplicate, tokens]);

  const handleReorder = useCallback((values: string[]) => {
    dispatch.tokenState.setTokenSetOrder(values);
  }, [dispatch]);

  const closeOnboarding = useCallback(() => {
    dispatch.uiState.setOnboardingExplainerSets(false);
  }, [dispatch]);

  const handleDelete = useCallback((set: string) => {
    handleDeleteTokenSet(set);
  }, [handleDeleteTokenSet]);

  const handleCloseRenameModal = useCallback(() => {
    setShowRenameTokenSetFields(false);
    handleNewTokenSetNameChange('');
  }, []);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleNewTokenSetNameChange(event.target.value);
  }, []);

  const handleCloseNewTokenSetModal = useCallback(() => {
    setShowNewTokenSetFields(false);
  }, []);

  const handleOpenNewTokenSetModal = useCallback(() => {
    setShowNewTokenSetFields(true);
  }, []);

  const handleResize = useCallback((e, direction, ref, d) => {
    dispatch.uiState.setSidebarWidth(uiState.sidebarWidth + d.width);
  }, [uiState, dispatch.uiState]);

  return (
    <Resizable
      size={{ width: uiState.sidebarWidth, height: '100%' }}
      onResizeStop={handleResize}
      minWidth={100}
      maxWidth="50vw"
    >
      <Box
        css={{
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
          width: '100%',
          borderRight: '1px solid',
          borderColor: '$borderMuted',
          overflowY: 'auto',
        }}
        className="content"
      >
        <TokenSetTree
          tokenSets={allTokenSets}
          onRename={handleRenameTokenSet}
          onDelete={handleDelete}
          onDuplicate={handleDuplicateTokenSet}
          onReorder={handleReorder}
          saveScrollPositionSet={saveScrollPositionSet}
        />
        <Modal
          title={`${isDuplicate ? t('duplicate') : t('rename')} ${oldTokenSetName}`}
          isOpen={showRenameTokenSetFields}
          close={handleCloseRenameModal}
        >
          <form onSubmit={handleRenameTokenSetSubmit}>
            <Stack direction="column" gap={4}>
              <Stack direction="column" gap={2}>
                <Label htmlFor="tokensetname">Name</Label>
                <TextInput
                  autoFocus
                  value={newTokenSetName}
                  onChange={handleChangeName}
                  type="text"
                  name="tokensetname"
                  data-testid="rename-set-input"
                  required
                />
              </Stack>
              <Stack direction="row" gap={4} justify="end">
                <Button variant="secondary" onClick={handleCloseRenameModal}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={!newTokenSetName}>
                  {
                  isDuplicate ? t('save') : t('change')
                }
                </Button>
              </Stack>
            </Stack>
          </form>
        </Modal>
        <Modal
          title={t('sets.new') as string}
          data-testid="new-set-modal"
          isOpen={showNewTokenSetFields}
          close={handleCloseNewTokenSetModal}
        >
          <form onSubmit={handleNewTokenSetSubmit}>
            <Stack direction="column" gap={4}>
              <Stack direction="column" gap={2}>
                <Label htmlFor="tokensetname">Name</Label>
                <TextInput
                  value={newTokenSetName}
                  onChange={handleChangeName}
                  type="text"
                  name="tokensetname"
                  required
                  data-testid="token-set-input"
                  autoFocus
                  placeholder="Enter a name"
                />
              </Stack>
              <Stack direction="row" gap={4} justify="end">
                <Button variant="secondary" onClick={handleCloseNewTokenSetModal}>
                  {t('cancel')}
                </Button>
                <Button data-testid="create-token-set" type="submit" variant="primary">
                  {t('create')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Modal>
        <Stack direction="column" css={{ padding: '$3' }}>
          <Button
            icon={<IconAdd />}
            size="small"
            data-testid="button-new-token-set"
            type="button"
            disabled={editProhibited}
            onClick={handleOpenNewTokenSetModal}
            css={{ justifyContent: 'center' }}
          >
            {t('sets.new')}
          </Button>
        </Stack>
        {uiState.onboardingExplainerSets && (
        <OnboardingExplainer data={onboardingData} closeOnboarding={closeOnboarding} />
        )}
      </Box>
    </Resizable>
  );
}
