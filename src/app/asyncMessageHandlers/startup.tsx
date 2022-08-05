import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Provider } from 'react-redux';
import { AsyncMessageChannelHandlers } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ErrorFallback } from '../components/ErrorFallback';
import { store } from '../store';
import { AppContainer } from '../components/AppContainer';

export const startup: AsyncMessageChannelHandlers[AsyncMessageTypes.STARTUP] = async (params) => {
  const app = document.getElementById('app');

  if (app) {
    ReactDOM.unmountComponentAtNode(app);
    ReactDOM.render(
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <Provider store={store}>
          <AppContainer {...params} />
        </Provider>
      </Sentry.ErrorBoundary>,
      app,
    );
  }
};
