import { useEffect } from 'react';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';
import { userIdSelector } from '@/selectors/userIdSelector';
import { planSelector } from '@/selectors/planSelector';
import { clientEmailSelector } from '@/selectors/getClientEmail';
import { entitlementsSelector } from '@/selectors/getEntitlements';
import { licenseKeySelector } from '@/selectors/licenseKeySelector';

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
        });
    }
  }, [userId, ldClient, licenseKey, plan, clientEmail, entitlements]);

  return null;
};
