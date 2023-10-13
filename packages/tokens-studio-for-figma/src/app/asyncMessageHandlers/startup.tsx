import React from 'react';
import ReactDOM from 'react-dom';
import {ErrorBoundary} from '@sentry/react';
import { Provider } from 'react-redux';
import i18next from 'i18next';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ErrorFallback } from '../components/ErrorFallback';
import { store } from '../store';
import { AppContainer } from '../components/AppContainer';

export const startup: AsyncMessageChannelHandlers[AsyncMessageTypes.STARTUP] = async (params) => {
  const app = document.getElementById('app');

  // Side effect from first load
  i18next.changeLanguage(params.settings.language || 'en');

  if (app) {
    ReactDOM.unmountComponentAtNode(app);
    ReactDOM.render(
      <ErrorBoundary fallback={ErrorFallback}>
        <Provider store={store}>
          <AppContainer {...params} />
        </Provider>
      </ErrorBoundary>,
      app,
    );
  }
};
