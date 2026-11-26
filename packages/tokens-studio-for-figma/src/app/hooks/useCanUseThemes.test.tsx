import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { createMockStore } from '../../../tests/config/setupTest';
import { useCanUseThemes } from './useCanUseThemes';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { Organization } from '@/types/oauth';

const makeOrg = (id: string, subscription: Partial<NonNullable<Organization['subscription']>>, seat = 'EDITOR'): Organization => ({
  id,
  name: `Org ${id}`,
  current_user_seat_type: seat,
  subscription: { id: `sub-${id}`, plan: { id: '', name: 'Essential' }, ...subscription },
  projects: { data: [{ id: `project-${id}`, name: `Project ${id}` }] },
});

const freeOrg = makeOrg('free', { access: ['studio_platform'], plan_type: 'free', plan_status: 'free' });
const freeViewerOrg = makeOrg('free-viewer', { access: ['studio_platform'], plan_type: 'free', plan_status: 'free' }, 'VIEWER');

const syncedWith = (orgId: string) => ({
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, internalId: `tokens-studio-${orgId}`, orgId, id: `project-${orgId}`, name: 'Org',
});

const renderCanUseThemes = (storageType: Record<string, unknown>) => {
  const mockStore = createMockStore({ uiState: { storageType } as any });
  return renderHook(() => useCanUseThemes(), {
    wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={mockStore}>{children}</Provider>,
  }).result.current;
};

describe('useCanUseThemes', () => {
  beforeEach(() => {
    useAuthStore.setState({ organizations: [freeOrg, freeViewerOrg], isPro: false });
  });

  it('allows themes in a file synced with a Free org the user edits', () => {
    expect(renderCanUseThemes(syncedWith('free'))).toBe(true);
  });

  it('does not allow themes for a Free org in a local file', () => {
    expect(renderCanUseThemes({ provider: StorageProviderType.LOCAL })).toBe(false);
  });

  it('does not allow themes to a viewer of the Free org', () => {
    expect(renderCanUseThemes(syncedWith('free-viewer'))).toBe(false);
  });

  it('allows themes everywhere with Pro', () => {
    useAuthStore.setState({ isPro: true });
    expect(renderCanUseThemes({ provider: StorageProviderType.LOCAL })).toBe(true);
  });
});
