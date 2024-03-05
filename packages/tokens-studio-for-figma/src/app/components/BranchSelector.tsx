import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import { useUIDSeed } from 'react-uid';
import { useTranslation } from 'react-i18next';
import { Button, DropdownMenu } from '@tokens-studio/ui';
import {
  branchSelector,
  localApiStateBranchSelector,
  apiSelector,
  usedTokenSetSelector,
  localApiStateSelector,
  activeThemeSelector,
} from '@/selectors';
import useRemoteTokens from '../store/remoteTokens';
import useConfirm from '@/app/hooks/useConfirm';
import useStorage from '@/app/store/useStorage';
import CreateBranchModal from './modals/CreateBranchModal';
import { Dispatch } from '../store';
import { BranchSwitchMenuRadioElement } from './BranchSwitchMenuRadioElement';
import { isGitProvider } from '@/utils/is';
import { useFlags } from './LaunchDarkly';
import ProBadge from './ProBadge';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageTypeCredentials } from '@/types/StorageType';
import { track } from '@/utils/analytics';
import { useChangedState } from '@/hooks/useChangedState';

const BranchSwitchMenuItemElement: React.FC<
React.PropsWithChildren<
React.PropsWithChildren<{
  branch: string;
  createNewBranchFrom: (branch: string) => void;
}>
>
> = ({ branch, createNewBranchFrom }) => {
  const onSelect = React.useCallback(() => createNewBranchFrom(branch), [branch, createNewBranchFrom]);

  return (
    <DropdownMenu.Item
      data-testid={`branch-selector-create-branch-from-branch-${branch}`}
      onSelect={onSelect}
      css={{ position: 'relative' }}
    >
      {branch}
    </DropdownMenu.Item>
  );
};

export default function BranchSelector() {
  const seed = useUIDSeed();
  const { confirm } = useConfirm();
  const { pullTokens, pushTokens } = useRemoteTokens();
  const dispatch = useDispatch<Dispatch>();
  const { gitBranchSelector } = useFlags();
  const { setStorageType } = useStorage();

  const branchState = useSelector(branchSelector);
  const localApiState = useSelector(localApiStateSelector);
  const localApiStateBranch = useSelector(localApiStateBranchSelector);
  const apiData = useSelector(apiSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const { t } = useTranslation(['branch', 'licence']);
  const [currentBranch, setCurrentBranch] = useState(localApiStateBranch);
  const [startBranch, setStartBranch] = useState<string | null>(null);
  const [createBranchModalVisible, setCreateBranchModalVisible] = useState(false);
  const [isCurrentChanges, setIsCurrentChanges] = useState(false);
  const { hasChanges } = useChangedState();

  useEffect(() => {
    setCurrentBranch(localApiStateBranch);
  }, [localApiStateBranch, setCurrentBranch]);

  const askUserIfPushChanges = React.useCallback(async () => {
    const confirmResult = await confirm({
      text: t('unSavedChanges') as string,
      description: t('ifYouCreate') as string,
      confirmAction: t('discardChanges') as string,
      cancelAction: t('cancel') as string,
    });
    if (confirmResult) {
      return confirmResult.result;
    }
    return null;
  }, [confirm, t]);

  const createBranchByChange = React.useCallback(() => {
    track('Create new branch from current changes');
    setIsCurrentChanges(true);
    setStartBranch(currentBranch ?? null);
    setCreateBranchModalVisible(true);
  }, [currentBranch]);

  const createNewBranchFrom = React.useCallback(
    async (branch: string) => {
      track('Create new branch from specific branch');

      if (hasChanges && (await askUserIfPushChanges())) {
        await pushTokens();
      }

      setStartBranch(branch);
      setCreateBranchModalVisible(true);
    },
    [hasChanges, askUserIfPushChanges, pushTokens],
  );

  const changeAndPull = React.useCallback(
    async (branch: string) => {
      if (isGitProvider(apiData) && isGitProvider(localApiState)) {
        setCurrentBranch(branch);
        dispatch.uiState.setApiData({ ...apiData, branch });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch });
        await pullTokens({ context: { ...apiData, branch }, usedTokenSet, activeTheme });
        AsyncMessageChannel.ReactInstance.message({
          type: AsyncMessageTypes.CREDENTIALS,
          credential: { ...apiData, branch },
        });
        setStorageType({ provider: { ...apiData, branch } as StorageTypeCredentials, shouldSetInDocument: true });
      }
    },
    [apiData, localApiState, pullTokens, usedTokenSet, activeTheme, dispatch],
  );

  const onBranchSelected = React.useCallback(
    async (branch: string) => {
      track('Branch changed');
      if (hasChanges) {
        if (await askUserIfPushChanges()) {
          await changeAndPull(branch);
        }
      } else {
        await changeAndPull(branch);
      }
    },
    [hasChanges, askUserIfPushChanges, changeAndPull],
  );

  // @params
  /*
   ** branch: branch name which is just created.
   ** branches: a list of branch names before new branch is created.
   */
  const onCreateBranchModalSuccess = React.useCallback(
    (branch: string, branches: string[]) => {
      setCreateBranchModalVisible(false);
      setCurrentBranch(branch);
      if (isGitProvider(apiData) && isGitProvider(localApiState)) {
        dispatch.branchState.setBranches(branches.includes(branch) ? branches : [...branches, branch]);
        dispatch.uiState.setApiData({ ...apiData, branch });
        dispatch.uiState.setLocalApiState({ ...localApiState, branch });
      }
    },
    [dispatch, apiData, localApiState],
  );

  const handleCloseModal = React.useCallback(() => {
    setCreateBranchModalVisible(false);
  }, []);

  return currentBranch ? (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild data-testid="branch-selector-menu-trigger">
          <Button size="small" variant="invisible" icon={<GitBranchIcon />}>
            {currentBranch}
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content side="top" sideOffset={0}>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger
                data-testid="branch-selector-create-new-branch-trigger"
                disabled={!gitBranchSelector}
              >
                {t('createNewBranch')}
                <DropdownMenu.TrailingVisual>
                  <ChevronRightIcon />
                </DropdownMenu.TrailingVisual>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {hasChanges && (
                  <DropdownMenu.Item
                    data-testid="branch-selector-create-new-branch-from-current-change"
                    onSelect={createBranchByChange}
                  >
                    {t('currentChanges')}
                  </DropdownMenu.Item>
                )}
                {branchState.branches.length > 0
                  && branchState.branches.map((branch, index) => (
                    <BranchSwitchMenuItemElement
                      key={seed(index)}
                      branch={branch}
                      createNewBranchFrom={createNewBranchFrom}
                    />
                  ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator />
            {!gitBranchSelector && (
              <>
                <DropdownMenu.Item css={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t('upgradeToPro', { ns: 'licence' })}</span>
                  <ProBadge compact />
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
              </>
            )}
            <DropdownMenu.RadioGroup value={currentBranch}>
              {branchState.branches.length > 0
                && branchState.branches.map((branch, index) => (
                  <BranchSwitchMenuRadioElement
                    disabled={!gitBranchSelector}
                    key={`radio_${seed(index)}`}
                    branch={branch}
                    branchSelected={onBranchSelected}
                  />
                ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      {createBranchModalVisible && startBranch && (
        <CreateBranchModal
          isOpen={createBranchModalVisible}
          onClose={handleCloseModal}
          onSuccess={onCreateBranchModalSuccess}
          startBranch={startBranch}
          isCurrentChanges={isCurrentChanges}
        />
      )}
    </>
  ) : (
    <div />
  );
}
