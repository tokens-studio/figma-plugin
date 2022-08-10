import { Store } from 'redux';
import * as Sentry from '@sentry/react';
import { RootState } from '@/app/store';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';
import { planSelector } from '@/selectors/planSelector';
import type { StartupMessage } from '@/types/AsyncMessages';
import { setUserData } from '@/utils/analytics';
import { clientEmailSelector } from '@/selectors/getClientEmail';
import { identifyLdUser } from '@/LDClient';

export function getLdFlagsFactory(
  store: Store<RootState>,
  params: StartupMessage,
) {
  return async () => {
    const { user } = params;
    const state = store.getState();
    const plan = planSelector(state);
    const entitlements = entitlementsSelector(state);
    const licenseKey = licenseKeySelector(state);
    const clientEmail = clientEmailSelector(state);

    if (user?.userId && licenseKey) {
      setUserData({ plan: plan ? 'pro' : 'free' });

      try {
        await identifyLdUser(
          user.userId,
          plan,
          entitlements,
          clientEmail,
        );
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
