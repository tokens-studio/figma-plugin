import { Store } from 'redux';
import * as Sentry from '@sentry/react';
import type { LDClient } from 'launchdarkly-js-client-sdk';
import { RootState } from '@/app/store';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { planSelector } from '@/selectors/planSelector';
import type { StartupMessage } from '@/types/AsyncMessages';
import { setUserData } from '@/utils/analytics';
import { clientEmailSelector } from '@/selectors/getClientEmail';

export function getLdFlagsFactory(store: Store<RootState>, ldClient: LDClient | undefined, params: StartupMessage) {
  return async () => {
    const { user } = params;
    const state = store.getState();
    const plan = planSelector(state);
    const entitlements = entitlementsSelector(state);
    const licenseKey = licenseKeySelector(state);
    const clientEmail = clientEmailSelector(state);

    if (user?.userId && licenseKey) {
      setUserData({ plan: plan ? 'pro' : 'free' });
      const userAttributes: Record<string, string | boolean> = {
        plan: plan || '',
      };
      entitlements.forEach((entitlement) => {
        userAttributes[entitlement] = true;
      });

      try {
        await ldClient?.identify({
          key: user.userId,
          custom: userAttributes,
          email: clientEmail,
        });
      } catch (err) {
        console.error(err);
        Sentry.captureException(err);
        setUserData({ plan: 'free' });
      }
    } else {
      setUserData({ plan: 'free' });
    }
  };
}
