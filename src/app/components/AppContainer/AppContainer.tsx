import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import App from '../App';
import FigmaLoading from '../FigmaLoading';
import { AsyncMessageTypes, StartupMessageResult } from '@/types/AsyncMessages';
import type { Dispatch } from '@/app/store';
import { Tabs } from '@/constants/Tabs';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';

type Props = StartupMessageResult;

export const AppContainer: React.FC<Props> = (params) => {
  const dispatch = useDispatch<Dispatch>();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const handleCancelLoadingScreen = useCallback(() => {
    setShowLoadingScreen(false);

    // @TODO cancel
    dispatch.uiState.setActiveTab(Tabs.START);
    AsyncMessageChannel.ReactInstance.message({
      type: AsyncMessageTypes.CANCEL_OPERATION,
    });
  }, [dispatch]);

  useEffect(() => {
    console.log(params);
  }, [params]);

  return (
    <FigmaLoading
      isLoading={showLoadingScreen}
      onCancel={handleCancelLoadingScreen}
    >
      <App />
    </FigmaLoading>
  );
};
