/* eslint-disable no-bitwise */
import type { Transport, Envelope, TransportMakeRequestResponse } from '@sentry/types';
import * as Sentry from '@sentry/browser';
import * as pjs from '../../package.json';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

const DSN = process.env.SENTRY_DSN;

// Bitwise operators are used to force conversion of  the string to a number
const SAMPLING = ~~(process.env.SENTRY_SAMPLING!) || 0.1;
const PROFILE_RATE = ~~(process.env.SENTRY_PROFILE_SAMPLING!) || 0.1;

export const sentryController = {

  attach: (asyncChannel: AsyncMessageChannel) => {
    switch (process.env.ENVIRONMENT) {
      case 'alpha':
      case 'beta':
      case 'production':
        Sentry.init({
          dsn: DSN,
          release: `figma-tokens@${pjs.version}`,
          environment: process.env.ENVIRONMENT,
          tracesSampleRate: SAMPLING,

          profilesSampleRate: PROFILE_RATE,
          transport: (): Transport => ({
            send: async (request: Envelope) => {
              const res = await asyncChannel.message({
                type: AsyncMessageTypes.PROXY_SENTRY,
                request,
              });
              return Promise.resolve(res.result as TransportMakeRequestResponse);
            },
            flush: () => Promise.resolve(true),
          }),
        });
        break;
      default:
        break;
    }
  },
};
