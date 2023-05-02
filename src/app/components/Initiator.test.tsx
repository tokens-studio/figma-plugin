import React from 'react';
import { Provider } from 'react-redux';
import {
  render, fireEvent, resetStore, createMockStore,
} from '../../../tests/config/setupTest';
import App from './App';
import { store } from '../store';
import { Initiator } from './Initiator';
import { TokenTypes } from '@/constants/TokenTypes';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { Tabs } from '@/constants/Tabs';
import { UpdateMode } from '@/constants/UpdateMode';

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

  it('should send no selection', () => {
    const mockStore = createMockStore({
      uiState: {
        disabled: false,
        selectedLayers: 10,
        selectionValues: [
          {
            category: TokenTypes.COLOR,
            type: TokenTypes.COLOR,
            value: '#ff0000',
            nodes: [],
          },
        ],
        mainNodeSelectionValues: {
          color: '#ff0000',
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'noselection',
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.disabled).toEqual(true);
    expect(state.uiState.selectedLayers).toEqual(0);
    expect(state.uiState.selectionValues).toEqual([]);
    expect(state.uiState.mainNodeSelectionValues).toEqual({});
  });

  it('should be able to set tokens', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'set_tokens',
            values: {
              version: '',
              updatedAt: '',
              values: {
                global: [
                  {
                    type: TokenTypes.COLOR,
                    name: 'colors.red',
                    value: '#ff0000',
                  },
                ],
              },
              usedTokenSet: {},
              checkForChanges: true,
              activeTheme: {},
              themes: [],
              storageType: {
                provider: StorageProviderType.LOCAL,
              },
            },
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.tokenState.tokens).toEqual({
      global: [
        {
          type: TokenTypes.COLOR,
          name: 'colors.red',
          value: '#ff0000',
        },
      ],
    });
    expect(state.uiState.activeTab).toEqual(Tabs.TOKENS);
  });

  it('should skip to start screen when there is no tokens', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'set_tokens',
            values: {
              version: '',
              updatedAt: '',
              values: {},
              usedTokenSet: {},
              checkForChanges: true,
              activeTheme: {},
              themes: [],
              storageType: {
                provider: StorageProviderType.LOCAL,
              },
            },
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.activeTab).toEqual(Tabs.START);
  });

  it('should be able to set tokens', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'apiProviders',
            providers: [
              {
                provider: StorageProviderType.GITHUB,
              },
            ],
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.apiProviders).toEqual([
      {
        provider: StorageProviderType.GITHUB,
      },
    ]);
  });

  it('should be able to show empty groups', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'show_empty_groups',
            showEmptyGroups: false,
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.showEmptyGroups).toEqual(false);
  });

  it('should be able to import styles', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'styles',
            values: {
              colors: [
                {
                  name: 'black',
                  type: 'color',
                  value: '#000000',
                },
              ],
              effects: [
                {
                  name: 'light',
                  type: 'boxShadow',
                  value: {
                    blur: 4,
                    color: '#00000040',
                    spread: 0,
                    type: 'dropShadow',
                    x: 0,
                    y: 4,
                  },
                },
              ],
              typography: [
                {
                  fontFamily: '{fontFamilies.inter}',
                  fontSize: '{fontSize.0}',
                  fontWeight: '{fontWeights.inter-0}',
                  letterSpacing: '{letterSpacing.0}',
                  lineHeight: '{lineHeights.0}',
                  paragraphSpacing: '{paragraphSpacing.0}',
                  textCase: '{textCase.none}',
                  textDecoration: '{textDecoration.none}',
                },
              ],
            },
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.tokenState.importedTokens).toEqual({
      newTokens: [
        {
          name: 'black',
          type: 'color',
          value: '#000000',
        },
        {
          name: 'light',
          type: 'boxShadow',
          value: {
            blur: 4,
            color: '#00000040',
            spread: 0,
            type: 'dropShadow',
            x: 0,
            y: 4,
          },
        },
        {
          fontFamily: '{fontFamilies.inter}',
          fontSize: '{fontSize.0}',
          fontWeight: '{fontWeights.inter-0}',
          letterSpacing: '{letterSpacing.0}',
          lineHeight: '{lineHeights.0}',
          paragraphSpacing: '{paragraphSpacing.0}',
          textCase: '{textCase.none}',
          textDecoration: '{textDecoration.none}',
        },
      ],
      updatedTokens: [],
    });
  });

  it('should be able to start a background job', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'start_job',
            job: {
              name: 'job',
            },
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.backgroundJobs).toEqual([
      { name: 'job' },
    ]);
  });

  it('should be able to complete a background job', () => {
    const mockStore = createMockStore({
      uiState: {
        backgroundJobs: [{ name: 'job' }],
      },
    });
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'complete_job',
            name: 'job',
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.backgroundJobs).toEqual([]);
  });

  it('should be able to clear the background jobs', () => {
    const mockStore = createMockStore({
      uiState: {
        backgroundJobs: [{ name: 'job' }, { name: 'job2' }],
      },
    });
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'clear_jobs',
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.backgroundJobs).toEqual([]);
  });

  it('should be able to add job tasks', () => {
    const mockStore = createMockStore({
      uiState: {
        backgroundJobs: [{ name: 'job', completedTasks: 0, totalTasks: 0 }],
      },
    });
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'add_job_tasks',
            name: 'job',
            count: 10,
            expectedTimePerTask: 1000,
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.backgroundJobs).toEqual([
      {
        name: 'job',
        completedTasks: 0,
        totalTasks: 10,
        timePerTask: 1000,
      },
    ]);
  });

  it('should be able to add complete job tasks', () => {
    const mockStore = createMockStore({
      uiState: {
        backgroundJobs: [{
          name: 'job',
          completedTasks: 0,
          totalTasks: 10,
        }],
      },
    });
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'complete_job_tasks',
            name: 'job',
            count: 10,
            timePerTask: 1000,
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.uiState.backgroundJobs).toEqual([
      {
        name: 'job',
        completedTasks: 10,
        totalTasks: 10,
        timePerTask: 1000,
      },
    ]);
  });

  it('should be able to set UI settings', () => {
    const mockStore = createMockStore({});
    render(
      <Provider store={mockStore}>
        <Initiator />
      </Provider>,
    );

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'uiSettings',
            settings: {
              uiWindow: {
                width: 400,
                height: 300,
                isMinimized: false,
              },
              updateMode: UpdateMode.PAGE,
              updateRemote: false,
              updateOnChange: false,
              updateStyles: false,
              ignoreFirstPartForStyles: false,
              prefixStylesWithThemeName: false,
              inspectDeep: false,
            },
          },
        },
      }),
    );

    const state = mockStore.getState();
    expect(state.settings).toEqual({
      uiWindow: {
        width: 400,
        height: 300,
        isMinimized: false,
      },
      shouldSwapStyles: false,
      tokenType: 'object',
      updateMode: UpdateMode.PAGE,
      updateRemote: false,
      updateOnChange: false,
      updateStyles: false,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
      baseFontSize: '16',
      aliasBaseFontSize: '16',
    });
  });
});
