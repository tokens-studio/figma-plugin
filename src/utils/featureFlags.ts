export type FeatureKey = 'gh_mfs_enabled' | 'INSPECT_TOKENS' | 'SELECT_ALL_TOKENS' | 'PRO_FEATURE_2' | 'PRO_FEATURE_1';

export type FeatureFlags = {
  gh_mfs_enabled?: boolean;
  INSPECT_TOKENS?: boolean;
  SELECT_ALL_TOKENS?: boolean;
  PRO_FEATURE_2: boolean;
  PRO_FEATURE_1: boolean;
} | null;

export async function getFeatureFlags(): Promise<string | null> {
  const featureFlagId = await figma.clientStorage.getAsync('ff_id');
  if (typeof featureFlagId === 'string' && featureFlagId.length > 0) {
    return featureFlagId;
  }
  return null;
}
