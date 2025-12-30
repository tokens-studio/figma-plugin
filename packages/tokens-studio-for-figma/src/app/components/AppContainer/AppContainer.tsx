import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import TermsUpdateModal from '../TermsUpdateModal';
import App from '../App';
import FigmaLoading from '../FigmaLoading';
import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';
import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { useStartupProcess } from './useStartupProcess';
import { ProcessStepStatus } from '@/hooks';
import { ApplicationInitSteps } from './ApplicationInitSteps';
import ConfirmDialog from '../ConfirmDialog';
import WindowResizer from '../WindowResizer';
import ImportedTokensDialog from '../ImportedTokensDialog';
import PushDialog from '../PushDialog';
import OnboardingFlow from '../OnboardingFlow';
import { Initiator } from '../Initiator';
import { globalStyles } from '../globalStyles';
import { AuthContextProvider } from '@/context/AuthContext';
import SecondScreenSync from '../SecondScreenSync';
import AuthModal from '../AuthModal';
import PullDialog from '../PullDialog';
import { useFigmaTheme } from '@/hooks/useFigmaTheme';
import Box from '../Box';
import { darkThemeMode, lightThemeMode } from '@/stitches.config';
import BitbucketMigrationDialog from '../BitbucketMigrationDialog';
import GenericVersionedHeaderMigrationDialog from '../GenericVersionedHeaderMigrationDialog';

type Props = StartupMessage & {
  // @README only for unit testing purposes
  startupProcess?: ReturnType<typeof useStartupProcess>;
};

const applicationInitStepLabels = {
  [ApplicationInitSteps.SAVE_PLUGIN_DATA]: 'Receiving local data',
  [ApplicationInitSteps.ADD_LICENSE]: 'Verifying license',
  [ApplicationInitSteps.SAVE_STORAGE_INFORMATION]: 'Checking storage type',
  [ApplicationInitSteps.PULL_TOKENS]: 'Fetching (remote) tokens',
};

export const AppContainer = (params: Props) => {
  const { authData } = params;
  const { isDarkTheme } = useFigmaTheme();
  const dispatch = useDispatch<Dispatch>();
  const startupProcess = useStartupProcess(params);
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

  useEffect(() => {
    if (isDarkTheme) {
      document.body.className = darkThemeMode;
    } else {
      document.body.className = lightThemeMode;
    }
  }, [isDarkTheme]);

  globalStyles();

  const appContent = (
    <Box css={{ backgroundColor: '$bgDefault', color: '$fgDefault' }}>
      <TermsUpdateModal />
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
      <SecondScreenSync />
      <AuthModal />
      <BitbucketMigrationDialog />
      <GenericVersionedHeaderMigrationDialog />
    </Box>
  );

  return <AuthContextProvider authData={authData}>{appContent}</AuthContextProvider>;
};
