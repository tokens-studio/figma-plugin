import * as LDClient from 'launchdarkly-js-client-sdk';
import type { LDClient as LDClientType } from 'launchdarkly-js-client-sdk';

const ldClientSideId = process.env.LAUNCHDARKLY_SDK_CLIENT || '';

let ldClientSingleton: LDClientType;
let ldClientPromiseResolver: (client: LDClientType) => void;
export const ldClientPromise = new Promise<LDClientType>((resolve) => {
  ldClientPromiseResolver = resolve;
});

export const getLdClient = async (user: LDClient.LDUser) => {
  if (!ldClientSingleton) {
    const ldClient = LDClient.initialize(ldClientSideId, user);
    await ldClient.waitUntilReady();
    ldClientPromiseResolver(ldClient);
    return ldClient;
  }

  return ldClientSingleton;
};

export const identifyLdUser = async (
  userId: string,
  plan?: string,
  entitlements?: string[],
  email?: string,
) => {
  const ldClient = await getLdClient({
    key: userId,
  });

  const userAttributes: Record<string, string | boolean> = plan
    ? { plan } : {};
  entitlements?.forEach((entitlement) => {
    userAttributes[entitlement] = true;
  });

  await ldClient.identify({
    key: userId,
    ...(plan && entitlements ? {
      custom: userAttributes,
    } : {}),
    ...(email ? { email } : {}),
  });
};
