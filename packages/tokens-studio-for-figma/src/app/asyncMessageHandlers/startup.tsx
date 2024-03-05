import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { Provider } from 'react-redux';
import i18next from 'i18next';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ErrorFallback } from '../components/ErrorFallback';
import { store } from '../store';
import { AppContainer } from '../components/AppContainer';

export const startup: AsyncMessageChannelHandlers[AsyncMessageTypes.STARTUP] = async (params) => {
  const container = document.getElementById('app');

  // Side effect from first load
  i18next.changeLanguage(params.settings.language || 'en');

  const root = createRoot(container!);
  root.render(
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <Provider store={store}>
        <Tooltip.Provider>
          <AppContainer {...params} />
        </Tooltip.Provider>
      </Provider>
    </Sentry.ErrorBoundary>,
  );
};
