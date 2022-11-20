import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { act, createMockStore, render } from '../../../tests/config/setupTest';
import ApplySelector from './ApplySelector';

describe('ApplySelector', () => {
  it('should work', async () => {
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <ApplySelector />
      </Provider>,
    );

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);
      const updateChanges = result.getByTestId('update-on-change');
      const updateRemote = result.getByTestId('update-remote');
      const updateStyles = result.getByTestId('update-styles');
      const swapStylesAlpha = result.queryByTestId('swap-styles-alpha');

      expect(updateChanges).toBeInTheDocument();
      expect(updateRemote).toBeInTheDocument();
      expect(updateStyles).toBeInTheDocument();
      expect(swapStylesAlpha).toBeNull();
    });
  });

  it('with swap styles feature flag', async () => {
    process.env.LAUNCHDARKLY_FLAGS = 'swapStylesAlpha';
    const mockStore = createMockStore({});
    const result = render(
      <Provider store={mockStore}>
        <ApplySelector />
      </Provider>,
    );

    const trigger = await result.getByTestId('apply-selector');
    await act(async () => {
      await userEvent.click(trigger);

      const swapStylesAlpha = result.getByTestId('swap-styles-alpha');
      expect(swapStylesAlpha).toBeInTheDocument();
    });
  });
});
