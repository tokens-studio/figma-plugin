import { useSelector } from 'react-redux';
import { featureFlagsSelector } from '@/selectors';
import { FeatureKey } from '@/utils/featureFlags';

export function useFeatureAccess(feature: FeatureKey) {
  let hasAccess = false;

  const featureAccess = useSelector(featureFlagsSelector);
  if (featureAccess) {
    hasAccess = !!featureAccess[feature];
  }

  return hasAccess;
}
