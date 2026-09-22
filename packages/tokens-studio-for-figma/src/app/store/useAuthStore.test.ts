import { useAuthStore } from './useAuthStore';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { getPlanDisplayName } from '@/utils/tokensStudio/organizationAccess';

// Shape of GET /api/v1/organizations (studio-on-rails OrganizationsController#index).
const orgPayload = (id: string, seat: string, subscription: Record<string, unknown>) => ({
  type: 'organizations',
  id,
  attributes: {
    name: `Org ${id}`,
    slug: id,
    current_user_seat_type: seat,
    subscription,
  },
});

const organizationsResponse = {
  data: [
    orgPayload('paid', 'EDITOR', {
      current_plan: 'essential', plan_type: 'regular', plan_status: 'paid', subscription_status: 'active', access: ['figma_plugin', 'studio_platform'],
    }),
    orgPayload('free', 'EDITOR', {
      current_plan: 'free', plan_type: 'free', plan_status: 'free', subscription_status: 'free', access: ['studio_platform'],
    }),
    orgPayload('variables', 'EDITOR', {
      current_plan: 'variables', plan_type: 'variables', plan_status: 'paid', subscription_status: 'active', access: ['companion', 'studio_platform'],
    }),
    orgPayload('trial', 'EDITOR', {
      current_plan: 'essential', plan_type: 'regular', plan_status: 'trialing', subscription_status: 'trialing', access: ['figma_plugin', 'studio_platform'],
    }),
    orgPayload('partner', 'EDITOR', {
      current_plan: 'partners', plan_type: 'regular', plan_status: 'custom', subscription_status: 'active', access: ['figma_plugin', 'studio_platform'],
    }),
    // Lapsed paid org that reads as Free before the backend stores current_plan 'free'.
    orgPayload('lapsed', 'EDITOR', {
      current_plan: 'essential', plan_type: 'regular', plan_status: 'free', subscription_status: 'free', access: ['studio_platform'],
    }),
    orgPayload('noplan', 'EDITOR', {
      current_plan: null, plan_type: null, plan_status: null, subscription_status: null, access: [],
    }),
  ],
};

const jsonResponse = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe('useAuthStore Pro and plan labels', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockResolvedValue(undefined as any);
    global.fetch = jest.fn(async (url: RequestInfo | URL) => {
      const href = String(url);
      if (href.endsWith('/api/v1/auth/me')) return jsonResponse({ data: { id: 'user-1', attributes: { email: 'a@b.c' } } });
      if (href.endsWith('/api/v1/organizations')) return jsonResponse(organizationsResponse);
      return jsonResponse({ data: [] });
    }) as unknown as typeof fetch;
    useAuthStore.setState({ activeOrganizationId: null, organizations: [], isPro: false });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const loadOrganizations = () => useAuthStore.getState().fetchUserData({
    accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
  });

  it('gives a paid org editor Pro on load', async () => {
    await loadOrganizations();
    expect(useAuthStore.getState().activeOrganizationId).toBe('paid');
    expect(useAuthStore.getState().isPro).toBe(true);
  });

  const proCases: [string, boolean][] = [
    ['free', false],
    ['variables', false],
    ['lapsed', false],
    ['noplan', false],
    ['paid', true],
    ['trial', true],
    ['partner', true],
  ];

  it.each(proCases)('sets isPro for the %s org to %s when it is the stored org on load', async (orgId, expected) => {
    useAuthStore.setState({ activeOrganizationId: orgId });
    await loadOrganizations();
    expect(useAuthStore.getState().activeOrganizationId).toBe(orgId);
    expect(useAuthStore.getState().isPro).toBe(expected);
  });

  it.each(proCases)('sets isPro for the %s org to %s when it becomes active', async (orgId, expected) => {
    await loadOrganizations();
    useAuthStore.getState().setActiveOrganization(orgId);
    expect(useAuthStore.getState().isPro).toBe(expected);
  });

  it('saves the active org for other files unless persist is false', async () => {
    await loadOrganizations();
    const messageSpy = jest.mocked(AsyncMessageChannel.ReactInstance.message);
    messageSpy.mockClear();

    useAuthStore.getState().setActiveOrganization('free', { persist: false });
    expect(useAuthStore.getState().activeOrganizationId).toBe('free');
    expect(messageSpy).not.toHaveBeenCalled();

    useAuthStore.getState().setActiveOrganization('paid');
    expect(messageSpy).toHaveBeenCalledWith(expect.objectContaining({ activeOrganizationId: 'paid' }));
  });

  it('labels plans from plan_status', async () => {
    await loadOrganizations();
    const label = (id: string) => getPlanDisplayName(useAuthStore.getState().organizations.find((o) => o.id === id)?.subscription);
    expect(label('free')).toBe('Free');
    expect(label('paid')).toBe('Essential');
    expect(label('trial')).toBe('Essential Trial');
    expect(label('partner')).toBe('Partners');
    expect(label('variables')).toBe('Variables');
    expect(label('lapsed')).toBe('Free');
    expect(label('noplan')).toBe('No plan');
  });

  it('keeps plan_type from the payload', async () => {
    await loadOrganizations();
    const org = useAuthStore.getState().organizations.find((o) => o.id === 'variables');
    expect(org?.subscription?.plan_type).toBe('variables');
  });
});
