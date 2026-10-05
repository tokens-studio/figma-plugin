import { renderHook } from '@testing-library/react';
import { pushToTokensStudioOAuth, useTokensStudioOAuth } from './tokensStudioOAuth';
import { createThemeGroupRest, RestApiError } from '@/utils/tokensStudio/restApi';
import { AllTheProviders } from '../../../../../tests/config/setupTest';
import { useAuthStore } from '../../useAuthStore';
import { fetchProjectDataRest } from '@/utils/tokensStudio/fetchProjectDataRest';
import { notifyToUI } from '@/plugin/notifiers';
import type { Organization } from '@/types/oauth';

jest.mock('@/utils/tokensStudio/fetchProjectDataRest', () => ({
  fetchProjectDataRest: jest.fn(),
}));

jest.mock('@/plugin/notifiers', () => ({
  notifyToUI: jest.fn(),
}));

jest.mock('@/utils/tokensStudio/restApi', () => ({
  ...jest.requireActual('@/utils/tokensStudio/restApi'),
  createThemeGroupRest: jest.fn(),
}));

const makeOrg = (id: string, subscription: Partial<NonNullable<Organization['subscription']>>): Organization => ({
  id,
  name: `Org ${id}`,
  current_user_seat_type: 'EDITOR',
  subscription: { id: `sub-${id}`, plan: { id: '', name: 'Essential' }, ...subscription },
  projects: { data: [] },
});

const freeOrg = makeOrg('free', { access: ['studio_platform'], plan_type: 'free', plan_status: 'free' });
const variablesOrg = makeOrg('variables', { access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid' });
const noAccessOrg = makeOrg('none', { access: [], plan_status: 'expired' });

describe('useTokensStudioOAuth loadProjectTokens', () => {
  beforeEach(() => {
    jest.mocked(fetchProjectDataRest).mockReset().mockResolvedValue({
      tokens: {}, themes: [], tokenSetOrder: [], changeSetId: 'change-set',
    } as any);
    jest.mocked(notifyToUI).mockReset();
    useAuthStore.setState({
      oauthTokens: {
        accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
      },
      organizations: [freeOrg, variablesOrg, noAccessOrg],
      activeOrganization: freeOrg,
      activeOrganizationId: 'free',
    });
  });

  const loadProjectTokens = () => renderHook(() => useTokensStudioOAuth(), { wrapper: AllTheProviders }).result.current.loadProjectTokens;

  it('loads a project of an org that can sync', async () => {
    await loadProjectTokens()('project-1', 'main', 'free');
    expect(fetchProjectDataRest).toHaveBeenCalledWith('token', expect.any(String), 'project-1', 'main');
  });

  it.each([
    ['a Variables-plan org', 'variables'],
    ['an org without studio_platform access', 'none'],
  ])('refuses to load a project of %s', async (_label, orgId) => {
    await expect(loadProjectTokens()('project-1', 'main', orgId)).rejects.toThrow('planCantSync');
    expect(fetchProjectDataRest).not.toHaveBeenCalled();
    expect(notifyToUI).toHaveBeenCalledWith('planCantSync', { error: true });
  });

  it('checks the active org when no org is passed', async () => {
    useAuthStore.setState({ activeOrganization: variablesOrg, activeOrganizationId: 'variables' });
    await expect(loadProjectTokens()('project-1')).rejects.toThrow('planCantSync');
    expect(fetchProjectDataRest).not.toHaveBeenCalled();
  });
});

describe('pushToTokensStudioOAuth CREATE_THEME_GROUP', () => {
  const context = { id: 'project-1', branch: 'main', changeSetId: 'change-set-1' } as any;
  const limitRefusal = () => new RestApiError(422, 'Your plan includes 1 theme group. Upgrade to add more.', 'theme_group_limit_reached');

  beforeEach(() => {
    jest.mocked(createThemeGroupRest).mockReset();
    jest.mocked(notifyToUI).mockReset();
    useAuthStore.setState({
      oauthTokens: {
        accessToken: 'token', refreshToken: 'refresh', tokenType: 'Bearer', expiresAt: Date.now() + 60 * 60 * 1000,
      },
    });
  });

  it('reads a name clash as "already there" and returns null', async () => {
    jest.mocked(createThemeGroupRest).mockRejectedValue(
      new RestApiError(422, "A theme group with the name 'Colors' already exists in this branch"),
    );

    await expect(pushToTokensStudioOAuth({
      context, action: 'CREATE_THEME_GROUP', data: { name: 'Colors' }, rethrowErrors: true,
    })).resolves.toBeNull();
  });

  it('surfaces a plan limit refusal instead of swallowing it as a name clash', async () => {
    jest.mocked(createThemeGroupRest).mockRejectedValue(limitRefusal());

    await expect(pushToTokensStudioOAuth({
      context, action: 'CREATE_THEME_GROUP', data: { name: 'Colors' }, rethrowErrors: true,
    })).rejects.toThrow('Your plan includes 1 theme group');
  });

  it('notifies and returns null for a plan limit refusal when the caller does not want errors', async () => {
    jest.mocked(createThemeGroupRest).mockRejectedValue(limitRefusal());

    await expect(pushToTokensStudioOAuth({
      context, action: 'CREATE_THEME_GROUP', data: { name: 'Colors' },
    })).resolves.toBeNull();
    expect(notifyToUI).toHaveBeenCalledWith(
      expect.stringContaining('Your plan includes 1 theme group'),
      { error: true },
    );
  });
});
