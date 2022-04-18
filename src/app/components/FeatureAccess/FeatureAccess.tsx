import React from 'react';
import { FeatureKey } from '@/utils/featureFlags';
import { useFeatureAccess } from '@/app/hooks/useFeatureAccess';

interface FeatureAccessProps {
  feature: FeatureKey;
  children: JSX.Element;
}

export default function FeatureAccess({ feature, children }: FeatureAccessProps): JSX.Element | null {
  const hasAccess = useFeatureAccess(feature);
  if (!hasAccess) {
    return null;
  }
  return children;
}
