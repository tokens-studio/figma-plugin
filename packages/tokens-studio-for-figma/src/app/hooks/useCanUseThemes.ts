import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { storageTypeSelector } from '@/selectors';
import { useAuthStore } from '@/app/store/useAuthStore';
import { isTokensStudioOAuthType } from '@/utils/is';
import { canUseFreePlanThemes } from '@/utils/tokensStudio/organizationAccess';
import { useIsProUser } from './useIsProUser';

/**
 * Managing themes and exporting them to Figma. Pro includes it; a Free-plan org also gets it, but only in a file
 * synced with that org's Studio project — not in local or Git files, and not by picking the org in Settings.
 */
export function useCanUseThemes() {
  const isProUser = useIsProUser();
  const storageType = useSelector(storageTypeSelector);
  const { organizations } = useAuthStore();

  return useMemo(() => {
    if (isProUser) return true;
    if (!isTokensStudioOAuthType(storageType)) return false;
    return canUseFreePlanThemes(organizations.find((org) => org.id === storageType.orgId));
  }, [isProUser, storageType, organizations]);
}
