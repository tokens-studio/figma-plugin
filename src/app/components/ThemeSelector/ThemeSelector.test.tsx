import React from 'react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { act, createMockStore, render } from '../../../../tests/config/setupTest';
import { ThemeSelector } from './ThemeSelector';
import { INTERNAL_THEMES_NO_GROUP } from '@/constants/InternalTokenGroup';

describe('ThemeSelector', () => {
  it('should show none if no active theme is selected', () => {
    const mockStore = createMockStore({});
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('Theme:None');
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

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('Theme:Light');
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

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('Theme:Unknown');
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
});
