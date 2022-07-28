import React from 'react';
import { Provider } from 'react-redux';
import {
  render, fireEvent, resetStore, createMockStore,
} from '../../../tests/config/setupTest';
import App from './App';
import { store } from '../store';
import { Initiator } from './Initiator';

describe('Initiator', () => {
  beforeEach(() => {
    resetStore();
  });

  it('set main node selection values with specific order when one node is selected', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'selection',
            selectionValues: [{
              category: 'sizing',
              type: 'sizing',
              value: 'sizing.xs',
            },
            {
              category: 'opacity',
              type: 'opacity',
              value: 'opacity.50',
            },
            {
              category: 'fontSizes',
              type: 'fontSizes',
              value: 'font-size.12',
            }],
            selectedNodes: 1,
            mainNodeSelectionValues: [{
              sizing: 'sizing.xs',
              opacity: 'opacity.50',
              fontSizes: 'font-size.12',
            }],
          },
        },
      }),
    );
    expect(mockStore.getState().uiState.mainNodeSelectionValues).toEqual({
      sizing: 'sizing.xs',
      opacity: 'opacity.50',
      fontSizes: 'font-size.12',
    });
    expect(mockStore.getState().uiState.selectionValues).toEqual([{
      category: 'sizing',
      type: 'sizing',
      value: 'sizing.xs',
    },
    {
      category: 'opacity',
      type: 'opacity',
      value: 'opacity.50',
    },
    {
      category: 'fontSizes',
      type: 'fontSizes',
      value: 'font-size.12',
    }]);
    result.unmount();
  });

  it('set main node selection values with specific order when multi nodes are selected', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'selection',
            mainNodeSelectionValues: [{
              sizing: 'sizing.xs',
            }, {
              opacity: 'opacity.50',
              fontSizes: 'font-size.12',
            }],
          },
        },
      }),
    );
    expect(mockStore.getState().uiState.mainNodeSelectionValues).toEqual({
      sizing: 'sizing.xs',
      opacity: 'opacity.50',
      fontSizes: 'font-size.12',
    });
    result.unmount();
  });

  it('reset main node selection value when there is no main node selection values', async () => {
    const result = render(<App />);
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'selection',
            mainNodeSelectionValues: [],
          },
        },
      }),
    );
    expect(store.getState().uiState.mainNodeSelectionValues).toEqual({});
    result.unmount();
  });

  it('reset selection value when there is no selection values', () => {
    const result = render(<App />);
    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'selection',
            mainNodeSelectionValues: [],
          },
        },
      }),
    );
    expect(store.getState().uiState.selectionValues).toEqual([]);
    result.unmount();
  });
});
