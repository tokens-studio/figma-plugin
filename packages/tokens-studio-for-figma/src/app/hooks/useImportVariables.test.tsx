import React from 'react';
import { Provider } from 'react-redux';
import {
  act, fireEvent, renderHook, screen, waitFor,
} from '@testing-library/react';
import { createMockStore } from '../../../tests/config/setupTest';
import { useImportVariables } from './useImportVariables';
import ConfirmDialog from '../components/ConfirmDialog';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { StorageProviderType } from '@/constants/StorageProviderType';
import type { VariableCollectionInfo } from '@/types/VariableCollectionSelection';

const collections: VariableCollectionInfo[] = [
  {
    id: 'collection1',
    name: 'Core',
    variableCount: 10,
    modes: [{ modeId: 'mode1', name: 'Light' }, { modeId: 'mode2', name: 'Dark' }],
  },
  {
    id: 'collection2',
    name: 'Brand',
    variableCount: 5,
    modes: [{ modeId: 'mode3', name: 'Default' }],
  },
];

const selectedCollections = {
  collection1: { name: 'Core', selectedModes: ['mode1', 'mode2'] },
  collection2: { name: 'Brand', selectedModes: ['mode3'] },
};

const options = { useDimensions: false, useRem: false };

const studioApi = {
  provider: StorageProviderType.TOKENS_STUDIO_OAUTH, id: 'project-1', name: 'Studio', branch: 'main', changeSetId: 'change-set-1',
};
const githubApi = {
  provider: StorageProviderType.GITHUB, id: 'six7/figma-tokens', branch: 'main', filePath: 'tokens.json',
};

describe('useImportVariables', () => {
  let messageSpy: jest.SpyInstance;

  const sentTypes = () => messageSpy.mock.calls.map(([message]) => message.type);

  const setup = async (api: Record<string, unknown>) => {
    const mockStore = createMockStore({ uiState: { api, storageType: api } as any });
    const { result } = renderHook(() => useImportVariables(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore}>
          {children}
          <ConfirmDialog />
        </Provider>
      ),
    });
    await act(async () => {
      await result.current.openDialog();
    });
    return { result, mockStore };
  };

  beforeEach(() => {
    messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message').mockImplementation((async (message: { type: AsyncMessageTypes }) => (
      message.type === AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS ? { collections } : {}
    )) as any);
  });

  afterEach(() => {
    messageSpy.mockRestore();
  });

  it('asks before importing with Tokens Studio sync and imports once confirmed', async () => {
    const { result, mockStore } = await setup(studioApi);

    let importPromise: Promise<void>;
    act(() => {
      importPromise = result.current.importVariables(selectedCollections, options, [], true);
    });

    await waitFor(() => expect(mockStore.getState().uiState.confirmState.show).toBe(true));
    expect(mockStore.getState().uiState.confirmState.text).toBe('importVariablesStudioConfirmTitle');
    expect(sentTypes()).not.toContain(AsyncMessageTypes.PULL_VARIABLES);

    await act(async () => {
      fireEvent.click(screen.getByText('importVariablesStudioConfirmAction'));
      await importPromise;
    });

    expect(messageSpy).toHaveBeenCalledWith({
      type: AsyncMessageTypes.PULL_VARIABLES,
      options: { ...options, selectedCollections },
      themes: [],
      proUser: true,
    });
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('pulls nothing and leaves the plugin state alone when the Tokens Studio confirmation is cancelled', async () => {
    const { result, mockStore } = await setup(studioApi);
    const tokenStateBefore = mockStore.getState().tokenState;

    let importPromise: Promise<void>;
    act(() => {
      importPromise = result.current.importVariables(selectedCollections, options, [], true);
    });

    await waitFor(() => expect(mockStore.getState().uiState.confirmState.show).toBe(true));

    await act(async () => {
      fireEvent.click(screen.getByText('cancel'));
      await importPromise;
    });

    // Without PULL_VARIABLES the plugin never answers with the VARIABLES message that writes to Tokens Studio.
    expect(sentTypes()).not.toContain(AsyncMessageTypes.PULL_VARIABLES);
    expect(mockStore.getState().tokenState).toBe(tokenStateBefore);
    // The collection picker stays open so the selection isn't lost.
    expect(result.current.isDialogOpen).toBe(true);
  });

  it('imports straight away without a confirmation for other sync providers', async () => {
    const { result, mockStore } = await setup(githubApi);

    await act(async () => {
      await result.current.importVariables(selectedCollections, options, [], true);
    });

    expect(mockStore.getState().uiState.confirmState.show).toBe(false);
    expect(sentTypes()).toContain(AsyncMessageTypes.PULL_VARIABLES);
    expect(result.current.isDialogOpen).toBe(false);
  });

  it('imports straight away without a confirmation for a local document', async () => {
    const { result, mockStore } = await setup({ provider: StorageProviderType.LOCAL });

    await act(async () => {
      await result.current.importVariables(selectedCollections, options, [], false);
    });

    expect(mockStore.getState().uiState.confirmState.show).toBe(false);
    expect(sentTypes()).toContain(AsyncMessageTypes.PULL_VARIABLES);
  });

  it('still asks when the branch and variable counts are unknown', async () => {
    const { branch, ...studioApiWithoutBranch } = studioApi;
    messageSpy.mockImplementation((async (message: { type: AsyncMessageTypes }) => (
      message.type === AsyncMessageTypes.GET_AVAILABLE_VARIABLE_COLLECTIONS
        ? { collections: collections.map(({ variableCount, ...collection }) => collection) }
        : {}
    )) as any);
    const { result, mockStore } = await setup(studioApiWithoutBranch);

    let importPromise: Promise<void>;
    act(() => {
      // Only one of the two collections is selected, by a user who can't create themes.
      importPromise = result.current.importVariables({ collection1: selectedCollections.collection1 }, options, [], false);
    });

    await waitFor(() => expect(mockStore.getState().uiState.confirmState.show).toBe(true));
    expect(mockStore.getState().uiState.confirmState.description).toBe(
      'importVariablesStudioConfirmDescription importVariablesStudioConfirmCounts',
    );
    expect(sentTypes()).not.toContain(AsyncMessageTypes.PULL_VARIABLES);

    await act(async () => {
      fireEvent.click(screen.getByText('importVariablesStudioConfirmAction'));
      await importPromise;
    });

    expect(sentTypes()).toContain(AsyncMessageTypes.PULL_VARIABLES);
  });

  it('keeps the dialog closed when the collections cannot be fetched', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    messageSpy.mockRejectedValue(new Error('Failed'));

    const { result } = await setup(githubApi);

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    consoleSpy.mockRestore();
  });

  it('keeps the dialog open when the import fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { result } = await setup(githubApi);
    messageSpy.mockRejectedValue(new Error('Failed'));

    await act(async () => {
      await result.current.importVariables(selectedCollections, options, [], true);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error importing variables:', expect.any(Error));
    expect(result.current.isDialogOpen).toBe(true);
    consoleSpy.mockRestore();
  });
});
