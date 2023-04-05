import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  act, createMockStore, render,
} from '../../../../tests/config/setupTest';
import TokensBottomBar from '../TokensBottomBar';

describe('TokenBottomBar', () => {
  it('should render', () => {
    const mockStore = createMockStore({});

    render(
      <Provider store={mockStore}>
        <TokensBottomBar hasJSONError={false} />
      </Provider>,
    );
  });

  it('should show the preset modal', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar hasJSONError={false} />
      </Provider>,
    );

    const toolsButton = await result.findByText('Tools');
    await act(async () => {
      await userEvent.click(toolsButton);
      const loadButton = await result.findByText('Load from file/folder or preset');
      await userEvent.click(loadButton, { pointerEventsCheck: 0 });
    });
    expect(result.queryByText('Import')).toBeInTheDocument();

    const closeButton = await result.findByTestId('close-button');
    act(() => {
      closeButton.click();
    });
    expect(result.queryByText('Import')).toBeNull();
  });

  it('should show the export modal', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar hasJSONError={false} />
      </Provider>,
    );

    const toolsButton = await result.findByText('Tools');
    await act(async () => {
      await userEvent.click(toolsButton);
      const exportButton = await result.findByText('Export to file/folder');
      await userEvent.click(exportButton, { pointerEventsCheck: 0 });
    });
    expect(result.queryByText('Export tokens')).toBeInTheDocument();
  });
});
