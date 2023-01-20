import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, render,
} from '../../../../tests/config/setupTest';
import TokensBottomBar from '../TokensBottomBar';

const mockHandleUpdate = jest.fn();

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
    act(() => {
      toolsButton.click();
    });
    const loadButton = await result.findByText('Load');
    act(() => {
      loadButton.click();
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
    act(() => {
      toolsButton.click();
    });
    const exportButton = await result.findByText('Export');
    act(() => {
      exportButton.click();
    });
    expect(result.queryAllByText('Export')).toHaveLength(3);

    const closeButton = await result.findByTestId('close-button');
    act(() => {
      closeButton.click();
    });
    expect(result.queryAllByText('Export')).toHaveLength(1);
  });

  it('should trigger an update', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar hasJSONError={false} />
      </Provider>,
    );

    const updateButton = await result.findByTestId('update-button');
    act(() => {
      updateButton.click();
    });

    expect(mockHandleUpdate).toBeCalledTimes(1);
  });
});
