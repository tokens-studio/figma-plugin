export type FeatureFlags = {
  gh_mfs_enabled?: boolean;
} | null;

export async function getFeatureFlags(): Promise<string> {
  const featureFlagId = await figma.clientStorage.getAsync('ff_id');
  return featureFlagId;
}
