import 'regenerator-runtime/runtime';
import './assets/fonts/jetbrainsmono.css';
import './styles/preflight.css';
import '@/i18n';
import * as asyncHandlers from './asyncMessageHandlers';
import { initializeAnalytics } from '../utils/analytics';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { initializeSentry } from './sentry';

initializeAnalytics();
initializeSentry();

AsyncMessageChannel.ReactInstance.connect();
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, asyncHandlers.getThemeInfo);
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, asyncHandlers.startup);
