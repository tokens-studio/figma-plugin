/* eslint-disable no-bitwise */
import * as Sentry from '@sentry/react';
import pjs from '../../package.json';

const DSN = process.env.SENTRY_DSN;

// Bitwise operators are used to force conversion of  the string to a number
const SAMPLING = ~~(process.env.SENTRY_SAMPLING!) || 0.1;
const PROFILE_RATE = ~~(process.env.SENTRY_PROFILE_SAMPLING!) || 0.1;
const REPLAY_RATE = ~~(process.env.SENTRY_REPLAY_SAMPLING!) || 0;

export const replay = new Sentry.Replay({
  // Make sure we never leak any sensitive data
  maskAllText: true,
  blockAllMedia: true,
});

export const setupReplay = () => {
  setTimeout(() => {
    try {
      const client = Sentry.getCurrentHub().getClient();

      if (client) {
        if (!client?.getIntegration(Sentry.Replay)) {
          // @ts-ignore This should never be undefined after the check above
          client.addIntegration(new Replay());
        }
      }
    } catch (error) {
      console.error('Error setting up Sentry Replay:', error);
    }
  }, 2000); // Delay by 2000 milliseconds (2 seconds) to make sure we load in UI properly, see https://github.com/tokens-studio/figma-plugin/issues/3073
};

export const initializeSentry = () => {
  switch (process.env.ENVIRONMENT) {
    case 'alpha':
    case 'beta':
    case 'production':
      Sentry.init({
        dsn: DSN,
        release: `figma-tokens@${pjs.version}`,
        environment: process.env.ENVIRONMENT,
        tracesSampleRate: SAMPLING,
        // @ts-ignore Note: This gives an error. No clue why 🤷
        profilesSampleRate: PROFILE_RATE,
        replaysSessionSampleRate: REPLAY_RATE,
        // We always want to replay errors
        replaysOnErrorSampleRate: 1.0,
        integrations: [],
      });
      Sentry.addTracingExtensions();
      break;
    default:
      break;
  }
};
