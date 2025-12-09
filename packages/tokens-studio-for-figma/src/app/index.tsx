/* eslint-disable global-require */
import 'regenerator-runtime/runtime';
import './styles/preflight.css';
import '@/i18n';
import * as asyncHandlers from './asyncMessageHandlers';
import { startup } from './asyncMessageHandlers/startup';
import { initializeAnalytics } from '../utils/analytics';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { initializeSentry } from './sentry';

initializeAnalytics();
initializeSentry();

AsyncMessageChannel.ReactInstance.connect();
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, asyncHandlers.getThemeInfo);

startup().then(() => {
  // Load fonts after startup to prevent blocking in watch mode
  require('./assets/fonts/fonts.css');
  require('./assets/fonts/jetbrainsmono.css');
});
