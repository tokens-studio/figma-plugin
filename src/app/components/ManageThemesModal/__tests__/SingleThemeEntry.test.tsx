import React from 'react';
import { Provider } from 'react-redux';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import type { ThemeObject } from '@/types';
import { act, createMockStore, render } from '../../../../../tests/config/setupTest';
import { SingleThemeEntry } from '../SingleThemeEntry';

describe('SingleThemeEntry', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    const mockOpen = jest.fn();
    const mockThemeObject: ThemeObject = {
      id: 'light',
      name: 'Light',
      selectedTokenSets: {
        global: TokenSetStatus.ENABLED,
      },
      $figmaStyleReferences: {
        'colors.brand.primary': 'S:1234',
      },
    };

    const result = render(
      <Provider store={mockStore}>
        <SingleThemeEntry
          isActive={false}
          theme={mockThemeObject}
          onOpen={mockOpen}
          groupName="groupA"
        />
      </Provider>,
    );

    expect(result.queryByText('Light')).not.toBeNull();
    expect(result.queryByText('1 Sets, 1 Styles')).not.toBeNull();

    const openButton = await result.findByTestId('singlethemeentry-light');
    openButton.click();
    expect(mockOpen).toBeCalledTimes(1);

    const toggleSwitch = await result.findByRole('switch');
    act(() => toggleSwitch.click());
    expect(mockStore.getState().tokenState.activeTheme).toEqual({ groupA: 'light' });
  });
});
