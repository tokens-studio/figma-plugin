import type { Organization } from '@/types/oauth';

type OrganizationSubscription = NonNullable<Organization['subscription']>;

// plan_status values (from Studio's Organization#plan_status) that count as an active plan.
// Anything else ('free', 'expired', null, missing) is not active.
const ACTIVE_PLAN_STATUSES = ['paid', 'trialing', 'custom'];

export function isActivePlanStatus(planStatus?: string | null): boolean {
  return !!planStatus && ACTIVE_PLAN_STATUSES.includes(planStatus);
}

// Variables plans are for Companion; they can't sync in Tokens Studio for Figma.
export function isVariablesPlan(org?: Organization | null): boolean {
  return org?.subscription?.plan_type === 'variables';
}

// Whether a file can start or switch Studio sync with this org. Free orgs can (`studio_platform`); Pro is a
// separate check. `figma_plugin` also allows it so that orgs which could sync before keep doing so.
export function canSyncWithStudio(org?: Organization | null): boolean {
  const access = org?.subscription?.access;
  if (!access?.includes('studio_platform') && !access?.includes('figma_plugin')) return false;
  return !isVariablesPlan(org);
}

export function isProOrganization(org?: Organization | null): boolean {
  if (!org) return false;
  return !!org.subscription?.access?.includes('figma_plugin')
    && org.current_user_seat_type === 'EDITOR'
    && isActivePlanStatus(org.subscription?.plan_status);
}

export function getPlanDisplayName(subscription?: OrganizationSubscription | null): string {
  if (!subscription) return '';
  if (subscription.plan_status === 'free') return 'Free';
  if (subscription.plan_status === 'expired') return 'Expired';
  return subscription.plan?.name || '';
}
