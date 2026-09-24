import type { Organization } from '@/types/oauth';
import {
  canSyncWithStudio, getPlanDisplayName, isActivePlanStatus, isProOrganization, isVariablesPlan,
} from './organizationAccess';

const makeOrg = (
  subscription: Partial<NonNullable<Organization['subscription']>> | undefined,
  seat = 'EDITOR',
): Organization => ({
  id: 'org-1',
  name: 'Org',
  current_user_seat_type: seat,
  subscription: subscription ? {
    id: 'sub-1',
    plan: { id: '', name: 'Essential' },
    ...subscription,
  } : undefined,
  projects: { data: [] },
});

const freeOrg = makeOrg({
  access: ['studio_platform'], plan_type: 'free', plan_status: 'free', plan: { id: '', name: 'Free' },
});
const variablesOrg = makeOrg({
  access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid', plan: { id: '', name: 'Variables' },
});
const paidOrg = makeOrg({
  access: ['figma_plugin', 'studio_platform'], plan_type: 'regular', plan_status: 'paid',
});

describe('isActivePlanStatus', () => {
  it.each(['paid', 'trialing', 'custom'])('treats %s as active', (status) => {
    expect(isActivePlanStatus(status)).toBe(true);
  });

  it.each(['free', 'expired', 'trial_expired', '', null, undefined])('treats %p as not active', (status) => {
    expect(isActivePlanStatus(status)).toBe(false);
  });
});

describe('canSyncWithStudio', () => {
  it('allows a Free org', () => {
    expect(canSyncWithStudio(freeOrg)).toBe(true);
  });

  it('allows a paid org', () => {
    expect(canSyncWithStudio(paidOrg)).toBe(true);
  });

  it('blocks a Variables-plan org even though it has studio_platform', () => {
    expect(isVariablesPlan(variablesOrg)).toBe(true);
    expect(canSyncWithStudio(variablesOrg)).toBe(false);
  });

  it('keeps allowing an org with figma_plugin access but no studio_platform', () => {
    expect(canSyncWithStudio(makeOrg({ access: ['figma_plugin'], plan_status: 'paid' }))).toBe(true);
  });

  it('blocks an org without studio_platform or figma_plugin access', () => {
    expect(canSyncWithStudio(makeOrg({ access: [], plan_status: 'expired' }))).toBe(false);
    expect(canSyncWithStudio(makeOrg({ access: ['companion'], plan_status: 'paid' }))).toBe(false);
  });

  it('blocks when access or the org is missing', () => {
    expect(canSyncWithStudio(makeOrg({ plan_status: 'paid' }))).toBe(false);
    expect(canSyncWithStudio(makeOrg(undefined))).toBe(false);
    expect(canSyncWithStudio(null)).toBe(false);
    expect(canSyncWithStudio(undefined)).toBe(false);
  });
});

describe('isProOrganization', () => {
  it('is false for a Free org', () => {
    expect(isProOrganization(freeOrg)).toBe(false);
  });

  it('is false for a Variables-plan org', () => {
    expect(isProOrganization(variablesOrg)).toBe(false);
  });

  it('is true for a paid org editor', () => {
    expect(isProOrganization(paidOrg)).toBe(true);
  });

  it('is false for a paid org viewer', () => {
    expect(isProOrganization(makeOrg(paidOrg.subscription, 'VIEWER'))).toBe(false);
  });

  it.each(['trialing', 'custom'])('is true for figma_plugin access with plan_status %s', (status) => {
    expect(isProOrganization(makeOrg({ access: ['figma_plugin', 'studio_platform'], plan_status: status }))).toBe(true);
  });

  it.each(['free', 'expired', null, undefined])('is false for figma_plugin access with plan_status %p', (status) => {
    expect(isProOrganization(makeOrg({ access: ['figma_plugin', 'studio_platform'], plan_status: status }))).toBe(false);
  });

  it('no longer lets a partner plan name bypass the status check', () => {
    expect(isProOrganization(makeOrg({
      access: ['figma_plugin', 'studio_platform'], plan_status: 'expired', plan: { id: '', name: 'Partners' },
    }))).toBe(false);
  });

  it('is false without an org', () => {
    expect(isProOrganization(null)).toBe(false);
  });
});

describe('getPlanDisplayName', () => {
  it('shows Free for plan_status free, whatever the stored plan is', () => {
    expect(getPlanDisplayName({ ...paidOrg.subscription!, plan_status: 'free' })).toBe('Free');
  });

  it('shows Expired for plan_status expired', () => {
    expect(getPlanDisplayName({ ...paidOrg.subscription!, plan_status: 'expired' })).toBe('Expired');
  });

  it('shows the plan name otherwise', () => {
    expect(getPlanDisplayName(paidOrg.subscription)).toBe('Essential');
    expect(getPlanDisplayName({ ...paidOrg.subscription!, plan_status: 'trialing', plan: { id: '', name: 'Essential Trial' } })).toBe('Essential Trial');
  });

  it('ignores subscription_status', () => {
    expect(getPlanDisplayName({ ...paidOrg.subscription!, subscription_status: 'canceled' })).toBe('Essential');
  });

  it('is empty without a subscription or plan name', () => {
    expect(getPlanDisplayName(undefined)).toBe('');
    expect(getPlanDisplayName({ ...paidOrg.subscription!, plan: { id: '', name: '' } })).toBe('');
  });
});
