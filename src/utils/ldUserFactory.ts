export function ldUserFactory(userId: string, plan?: string, entitlements?: string[], email?: string) {
  const userAttributes: Record<string, string | boolean> = {
    plan: plan || '',
  };
  entitlements?.forEach((entitlement) => {
    userAttributes[entitlement] = true;
  });

  return {
    key: userId,
    custom: userAttributes,
    email,
  };
}
