import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFlags } from 'launchdarkly-react-client-sdk';
import App from '../App';
import FigmaLoading from '../FigmaLoading';
import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';
import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { useStartupProcess } from './useStartupProcess';
import { ProcessStepStatus } from '@/hooks';
import { withLDProviderWrapper } from '../LaunchDarkly';
import { ApplicationInitSteps } from './ApplicationInitSteps';
import ConfirmDialog from '../ConfirmDialog';
import WindowResizer from '../WindowResizer';
import ImportedTokensDialog from '../ImportedTokensDialog';
import PushDialog from '../PushDialog';
import Changelog from '../Changelog';
import OnboardingFlow from '../OnboardingFlow';
import { Initiator } from '../Initiator';
import { globalStyles } from '../globalStyles';
import { AuthContextProvider } from '@/context/AuthContext';
import SecondScreenSync from '../SecondScreenSync';
import AuthModal from '../AuthModal';
import PullDialog from '../PullDialog';

type Props = StartupMessage & {
  // @README only for unit testing purposes
  startupProcess?: ReturnType<typeof useStartupProcess>;
};

const applicationInitStepLabels = {
  [ApplicationInitSteps.SAVE_PLUGIN_DATA]: 'Receiving local data',
  [ApplicationInitSteps.ADD_LICENSE]: 'Verifying license',
  [ApplicationInitSteps.GET_LD_FLAGS]: 'Initializing LaunchDarkly',
  [ApplicationInitSteps.SAVE_STORAGE_INFORMATION]: 'Checking storage type',
  [ApplicationInitSteps.PULL_TOKENS]: 'Fetching (remote) tokens',
};

export const AppContainer = withLDProviderWrapper((params: Props) => {
  const dispatch = useDispatch<Dispatch>();
  const startupProcess = useStartupProcess(params);
  const { secondScreen } = useFlags();

  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const handleCancelLoadingScreen = useCallback(() => {
    startupProcess.cancelToken.cancel();
    dispatch.uiState.setActiveTab(Tabs.START);
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });

    setShowLoadingScreen(false);
  }, [dispatch, startupProcess]);

  const handlePerformStartup = useCallback(async () => {
    if (
      !startupProcess.isComplete
      && startupProcess.currentStatus !== ProcessStepStatus.FAILED
      && startupProcess.currentStatus !== ProcessStepStatus.CANCELED
    ) {
      if (startupProcess.currentStep === null) {
        await startupProcess.start();
      } else if (startupProcess.currentStatus === ProcessStepStatus.DONE) {
        await startupProcess.next();
      }
    } else if (startupProcess.isComplete) {
      setShowLoadingScreen(false);
    }
  }, [startupProcess]);

  useEffect(() => {
    handlePerformStartup();
  }, [handlePerformStartup]);

  globalStyles();

  const appContent = (
    <>
      <FigmaLoading
        isLoading={showLoadingScreen}
        label={startupProcess.currentStep ? applicationInitStepLabels[startupProcess.currentStep] : undefined}
        onCancel={handleCancelLoadingScreen}
      >
        <App />
      </FigmaLoading>
      <Initiator />
      <ConfirmDialog />
      <ImportedTokensDialog />
      <PushDialog />
      {
        !showLoadingScreen && <PullDialog />
      }
      <WindowResizer />
      <OnboardingFlow />
      <Changelog />
      {secondScreen && (
        <>
          <SecondScreenSync />
          <AuthModal />
        </>
      )}
    </>
  );

  return secondScreen ? <AuthContextProvider authData={params.authData}>{appContent}</AuthContextProvider> : appContent;
});
