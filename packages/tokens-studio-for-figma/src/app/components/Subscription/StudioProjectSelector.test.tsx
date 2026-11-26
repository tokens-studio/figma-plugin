import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { createMockStore, render } from '../../../../tests/config/setupTest';
import { StudioProjectSelector } from './StudioProjectSelector';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { Organization } from '@/types/oauth';

const mockLoadProjectTokens = jest.fn();
const mockSetStorageType = jest.fn();

jest.mock('@/app/store/providers/tokens-studio/tokensStudioOAuth', () => ({
  useTokensStudioOAuth: () => ({
    loadProjectTokens: mockLoadProjectTokens,
  }),
}));

jest.mock('@/app/store/useStorage', () => ({
  __esModule: true,
  default: () => ({ setStorageType: mockSetStorageType }),
}));

jest.mock('@/app/store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({ fetchBranches: jest.fn().mockResolvedValue(null) }),
}));

const makeOrg = (id: string, subscription: Partial<NonNullable<Organization['subscription']>>): Organization => ({
  id,
  name: `Org ${id}`,
  current_user_seat_type: 'EDITOR',
  subscription: { id: `sub-${id}`, plan: { id: '', name: 'Essential' }, ...subscription },
  projects: {
    data: [
      { id: `project-${id}-1`, name: `First ${id}` },
      { id: `project-${id}-2`, name: `Second ${id}` },
    ],
  },
});

const freeOrg = makeOrg('free', { access: ['studio_platform'], plan_type: 'free', plan_status: 'free' });
const paidOrg = makeOrg('paid', { access: ['figma_plugin', 'studio_platform'], plan_type: 'regular', plan_status: 'paid' });
const variablesOrg = makeOrg('variables', { access: ['companion', 'studio_platform'], plan_type: 'variables', plan_status: 'paid' });
const noAccessOrg = makeOrg('none', { plan_status: 'expired' });

const connectedTo = (org: Organization) => ({
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH,
  internalId: `tokens-studio-${org.id}`,
  name: org.name,
  orgId: org.id,
  id: org.projects.data[0].id,
});

const renderSelector = (ui: React.ReactElement, storageType: Record<string, unknown> = { provider: StorageProviderType.LOCAL }) => {
  const mockStore = createMockStore({ uiState: { storageType, localApiState: storageType } as any });
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

const pickProject = async (result: ReturnType<typeof render>, trigger: HTMLElement, projectName: string) => {
  await act(async () => {
    trigger.focus();
    await userEvent.keyboard('[Enter]');
  });
  await act(async () => {
    await userEvent.click(await result.findByText(projectName));
  });
};

describe('StudioProjectSelector', () => {
  beforeEach(() => {
    mockLoadProjectTokens.mockReset();
    mockSetStorageType.mockReset();
    useAuthStore.setState({
      organizations: [freeOrg, paidOrg, variablesOrg, noAccessOrg],
      activeOrganizationId: 'free',
      setActiveProject: jest.fn(),
    });
  });

  it('lets a Free org pick a project', async () => {
    const onChange = jest.fn();
    const result = renderSelector(<StudioProjectSelector orgId="free" onChange={onChange} />);

    const trigger = result.getByRole('button', { name: /First free/ });
    expect(trigger).toBeEnabled();
    await pickProject(result, trigger, 'Second free');

    expect(onChange).toHaveBeenCalledWith('project-free-2');
  });

  it.each([
    ['a Variables-plan org', 'variables'],
    ['an org without studio_platform access', 'none'],
  ])('does not let %s switch project, by pointer or keyboard', async (_label, orgId) => {
    const onChange = jest.fn();
    const result = renderSelector(<StudioProjectSelector orgId={orgId} onChange={onChange} />);

    const trigger = result.getByRole('button', { name: new RegExp(`First ${orgId}`) });
    expect(trigger).toBeDisabled();
    act(() => {
      trigger.focus();
    });
    expect(trigger).not.toHaveFocus();

    await act(async () => {
      await userEvent.click(trigger);
    });

    expect(result.queryByText(`Second ${orgId}`)).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not load a pick from another org\'s row into the file\'s current connection', async () => {
    // File syncs with the paid org; the Free org is the active org (e.g. picked in another file).
    const onChange = jest.fn();
    const result = renderSelector(<StudioProjectSelector orgId="free" onChange={onChange} />, connectedTo(paidOrg));

    await pickProject(result, result.getByRole('button', { name: /First free/ }), 'Second free');

    expect(onChange).toHaveBeenCalledWith('project-free-2');
    expect(mockLoadProjectTokens).not.toHaveBeenCalled();
    expect(mockSetStorageType).not.toHaveBeenCalled();
  });

  it('switches the file\'s project in the connected org\'s row, even when another org is active', async () => {
    const result = renderSelector(<StudioProjectSelector orgId="paid" />, connectedTo(paidOrg));

    await pickProject(result, result.getByRole('button', { name: /First paid/ }), 'Second paid');

    expect(mockLoadProjectTokens).toHaveBeenCalledWith('project-paid-2', 'main', 'paid');
    expect(mockSetStorageType).toHaveBeenCalledWith({
      provider: expect.objectContaining({ orgId: 'paid', id: 'project-paid-2', branch: 'main' }),
      shouldSetInDocument: true,
    });
  });
});
