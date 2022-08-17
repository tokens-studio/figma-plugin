import React from 'react';
import { Provider } from 'react-redux';
import {
  act, createMockStore, fireEvent, render,
} from '../../../../tests/config/setupTest';
import TokensBottomBar from '../TokensBottomBar';

const mockHandleUpdate = jest.fn();
const mockHandleSaveJSON = jest.fn();

describe('TokenBottomBar', () => {
  it('should render', () => {
    const mockStore = createMockStore({});

    render(
      <Provider store={mockStore}>
        <TokensBottomBar
          handleSaveJSON={mockHandleSaveJSON}
          handleUpdate={mockHandleUpdate}
          hasJSONError={false}
        />
      </Provider>,
    );
  });

  it('should show the preset modal', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <TokensBottomBar
          handleSaveJSON={mockHandleSaveJSON}
          handleUpdate={mockHandleUpdate}
          hasJSONError={false}
        />
      </Provider>,
    );

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
        <TokensBottomBar
          handleSaveJSON={mockHandleSaveJSON}
          handleUpdate={mockHandleUpdate}
          hasJSONError={false}
        />
      </Provider>,
    );

    const epxortButton = await result.findByText('Export');
    act(() => {
      epxortButton.click();
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
        <TokensBottomBar
          handleSaveJSON={mockHandleSaveJSON}
          handleUpdate={mockHandleUpdate}
          hasJSONError={false}
        />
      </Provider>,
    );

    const updateButton = await result.findByText('Update');
    act(() => {
      updateButton.click();
    });

    expect(mockHandleUpdate).toBeCalledTimes(1);
  });

  it('should trigger a save', async () => {
    const mockStore = createMockStore({});

    render(
      <Provider store={mockStore}>
        <TokensBottomBar
          handleSaveJSON={mockHandleSaveJSON}
          handleUpdate={mockHandleUpdate}
          hasJSONError={false}
        />
      </Provider>,
    );

    act(() => {
      fireEvent.keyDown(document, {
        key: 'S',
        code: 'KeyS',
        ctrlKey: true,
      });
    });

    expect(mockHandleSaveJSON).toBeCalledTimes(1);
  });
});
