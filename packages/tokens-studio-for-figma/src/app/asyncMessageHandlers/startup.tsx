import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { Provider, useStore } from 'react-redux';
import i18next from 'i18next';
import * as Tooltip from '@radix-ui/react-tooltip';

import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes, StartupMessage } from '@/types/AsyncMessages';
import { ErrorFallback } from '../components/ErrorFallback';
import { RootState, store } from '../store';
import { AppContainer } from '../components/AppContainer';
import PreviewApp from './preview';
import FigmaLoading from '../components/FigmaLoading';

// eslint-disable-next-line
const PREVIEW_ENV = process.env.PREVIEW_ENV;

const StartupApp = () => {
  const [params, setParams] = useState<StartupMessage | null>(null);
  const rootStore = useStore<RootState>();
  const state = rootStore.getState();

  useEffect(() => {
    i18next.changeLanguage(state?.settings?.language || 'en');
  }, [state?.settings?.language]);

  useEffect(() => {
    AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, async (startupParams) => {
      setParams(startupParams);
    });

    return () => {
      AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, (() => {}) as any);
    };
  }, []);

  const appContainer = (
    params ? <AppContainer {...params} /> : (
      <FigmaLoading
        isLoading
      >
        <span />
      </FigmaLoading>
    )
  );

  return PREVIEW_ENV ? (
    <PreviewApp>
      {appContainer}
    </PreviewApp>
  ) : appContainer;
};

export default async () => {
  const container = document.getElementById('app');

  // Side effect from first load

  const root = createRoot(container!);
  root.render(
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Provider store={store}>
        <Tooltip.Provider>
          <StartupApp />
        </Tooltip.Provider>
      </Provider>
    </Sentry.ErrorBoundary>,
  );
};
