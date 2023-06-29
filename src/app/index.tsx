/* eslint-disable no-bitwise */
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

const DSN = process.env.SENTRY_DSN;

// Bitwise operators are used to force conversion of  the string to a number
const SAMPLING = ~~(process.env.SENTRY_SAMPLING!) || 0.1;
const PROFILE_RATE = ~~(process.env.SENTRY_PROFILE_SAMPLING!) || 0.1;
const REPLAY_RATE = ~~(process.env.SENTRY_REPLAY_SAMPLING!) || 0.1;

switch (process.env.ENVIRONMENT) {
  case 'production':
  case 'beta':
    Sentry.addTracingExtensions();
    Sentry.init({
      dsn: DSN,
      release: `figma-tokens@${pjs.version}`,
      environment: process.env.ENVIRONMENT,
      tracesSampleRate: SAMPLING,
      // @ts-ignore This is correct, but the types are wrong.
      profilesSampleRate: PROFILE_RATE,

      replaysSessionSampleRate: REPLAY_RATE,
      // We always want to replay errors
      replaysOnErrorSampleRate: 1.0,
      integrations: [new Sentry.Replay({
        // Make sure we never leak any sensitive data
        maskAllText: true,
        blockAllMedia: true,
      })],
    });
    break;
  default:
    break;
}
AsyncMessageChannel.ReactInstance.connect();
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.GET_THEME_INFO, asyncHandlers.getThemeInfo);
AsyncMessageChannel.ReactInstance.handle(AsyncMessageTypes.STARTUP, asyncHandlers.startup);
