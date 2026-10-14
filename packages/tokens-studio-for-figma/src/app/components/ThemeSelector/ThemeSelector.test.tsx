import React from 'react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { act, createMockStore, render } from '../../../../tests/config/setupTest';
import { ThemeSelector } from './ThemeSelector';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';
import { useAuthStore } from '@/app/store/useAuthStore';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('ThemeSelector', () => {
  it('should show none if no active theme is selected', () => {
    const mockStore = createMockStore({});
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('theme:None');
  });

  it('should show the active theme name', () => {
    const mockStore = createMockStore({
      tokenState: {
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
        themes: [{
          id: 'light', name: 'Light', selectedTokenSets: {}, $figmaStyleReferences: {},
        }],
      },
    });
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('theme:Light');
  });

  it('should show the unknown if the active theme is somehow not available anymore', () => {
    const mockStore = createMockStore({
      tokenState: {
        activeTheme: {
          [INTERNAL_THEMES_NO_GROUP]: 'light',
        },
      },
    });
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('theme:Unknown');
  });

  it('be possible to select a theme', async () => {
    const mockStore = createMockStore({
      tokenState: {
        themes: [{
          id: 'light', name: 'Light', selectedTokenSets: {}, $figmaStyleReferences: {},
        }],
      },
    });
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    await act(async () => {
      const trigger = await component.findByTestId('themeselector-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });

    await act(async () => {
      const lightTheme = await component.findByTestId('themeselector--themeoptions--light');
      lightTheme.focus();
      await userEvent.keyboard('[Enter]');
    });

    expect(mockStore.getState().tokenState.activeTheme).toEqual({ [INTERNAL_THEMES_NO_GROUP]: 'light' });
  });

  describe('Manage themes on the Free plan', () => {
    const freeOrg = {
      id: 'free',
      name: 'Free org',
      current_user_seat_type: 'EDITOR',
      subscription: {
        id: 'sub-free', plan: { id: '', name: 'Free' }, access: ['studio_platform'], plan_type: 'free', plan_status: 'free',
      },
      projects: { data: [{ id: 'project-free', name: 'Project' }] },
    };

    const openManageThemesItem = async (storageType: Record<string, unknown>) => {
      useAuthStore.setState({ organizations: [freeOrg], isPro: false });
      const mockStore = createMockStore({ uiState: { storageType } as any });
      const component = render(
        <Provider store={mockStore}>
          <ThemeSelector />
        </Provider>,
      );
      await act(async () => {
        const trigger = await component.findByTestId('themeselector-dropdown');
        trigger.focus();
        await userEvent.keyboard('[Enter]');
      });
      return component.findByTestId('themeselector-managethemes');
    };

    it('is available in a file synced with the Free org', async () => {
      const item = await openManageThemesItem({
        provider: StorageProviderType.TOKENS_STUDIO_OAUTH, internalId: 'tokens-studio-free', orgId: 'free', id: 'project-free', name: 'Free org',
      });
      expect(item).not.toHaveAttribute('data-disabled');
    });

    it('stays a Pro feature in a local file', async () => {
      const item = await openManageThemesItem({ provider: StorageProviderType.LOCAL });
      expect(item).toHaveAttribute('data-disabled');
    });
  });
});
