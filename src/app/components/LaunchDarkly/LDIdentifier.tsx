import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { useEffect } from 'react';
import Case from 'case';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';
import { userIdSelector } from '@/selectors/userIdSelector';
import { planSelector } from '@/selectors/planSelector';
import { clientEmailSelector } from '@/selectors/getClientEmail';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';

let ldIdentificationResolver: (flags: LDProps['flags']) => void = () => {};
export const ldIdentificationPromise = new Promise<LDProps['flags']>((resolve) => {
  ldIdentificationResolver = resolve;
});

export const LDIdentifier = () => {
  const userId = useSelector(userIdSelector);
  const plan = useSelector(planSelector);
  const ldClient = useLDClient();
  const licenseKey = useSelector(licenseKeySelector);
  const clientEmail = useSelector(clientEmailSelector);
  const entitlements = useSelector(entitlementsSelector);

  useEffect(() => {
    if (userId && licenseKey && ldClient) {
      const userAttributes: Record<string, string | boolean> = {
        plan: plan || '',
      };
      entitlements.forEach((entitlement) => {
        userAttributes[entitlement] = true;
      });

      ldClient
        .identify({
          key: userId!,
          custom: userAttributes,
          email: clientEmail,
        })
        .then((rawFlags) => {
          const normalizedFlags = Object.fromEntries(
            Object.entries(rawFlags).map(([key, value]) => [Case.camel(key), value]),
          );
          ldIdentificationResolver(normalizedFlags);
        });
    } else {
      ldIdentificationResolver({});
    }
  }, [userId, ldClient, licenseKey, plan, clientEmail, entitlements]);

  return null;
};
