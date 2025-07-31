import * as LDClient from 'launchdarkly-js-client-sdk';
import Case from 'case';
import { Entitlements } from '@/app/store/models/userState';
import validateLicense from '@/utils/validateLicense';
import { UserData } from '@/types/userData';

export default async function fetchFeatureFlags(userData: UserData) {
  if (process.env.LAUNCHDARKLY_FLAGS) {
    return Object.fromEntries(process.env.LAUNCHDARKLY_FLAGS!.split(',').map((flag) => (
      [flag, true]
    )));
  }

  if (userData.licenseKey && userData.userId) {
    const {
      plan, email: clientEmail, entitlements,
    } = await validateLicense(userData.licenseKey, userData.userId, userData.userName);
    const userAttributes: Record<string, string | boolean> = {
      plan: plan || '',
      email: clientEmail || '',
      os: !entitlements?.includes(Entitlements.PRO),
    };
    entitlements?.forEach((entitlement) => {
      userAttributes[entitlement] = true;
    });
    const ldClientSideId = process.env.LAUNCHDARKLY_SDK_CLIENT || '';
    const client = LDClient.initialize(ldClientSideId, {
      key: userData.userId,
      custom: userAttributes,
    });
    await client.waitUntilReady();
    const rawFlags = client.allFlags();
    const normalizedFlags = Object.fromEntries(
      Object.entries(rawFlags).map(([key, value]) => [Case.camel(key), value]),
    );
    return normalizedFlags;
  }
  return null;
}
