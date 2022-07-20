import React from 'react';
import { Provider } from 'react-redux';
import { createMockStore, render } from '../../../../tests/config/setupTest';
import { ThemeSelector } from './ThemeSelector';

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
        activeTheme: 'light',
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
        activeTheme: 'light',
      },
    });
    const component = render(
      <Provider store={mockStore}>
        <ThemeSelector />
      </Provider>,
    );

    expect(component.queryByTestId('themeselector-dropdown')?.textContent).toEqual('Theme:Unknown');
  });
});
