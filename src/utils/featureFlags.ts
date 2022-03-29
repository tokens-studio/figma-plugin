export type FeatureFlags = {
  gh_mfs_enabled?: boolean;
} | null;

export async function getFeatureFlags(): Promise<string | null> {
  const featureFlagId = await figma.clientStorage.getAsync('ff_id');
  if (typeof featureFlagId === 'string' && featureFlagId.length > 0) {
    return featureFlagId;
  }
  return null;
}
