import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './assets/fonts/jetbrainsmono.css';
import './styles/preflight.css';
import './styles/figma.css';
import * as Sentry from '@sentry/react';
import * as asyncHandlers from './asyncMessageHandlers';
import { initializeAnalytics } from '../utils/analytics';
import * as pjs from '../../package.json';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

initializeAnalytics();

if (process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'beta') {
  Sentry.init({
    dsn: 'https://26bac1a4b1ba4d91bc9420d10d95bb3e@o386310.ingest.sentry.io/5220409',
    release: `figma-tokens@${pjs.plugin_version}`,
    environment: process.env.ENVIRONMENT,
  });
}

AsyncMessageChannel.ReactInstance.connect();
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, asyncHandlers.getThemeInfo);
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, asyncHandlers.startup);
