import React from 'react';
import { fireEvent, render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import TokenSetSelector from './TokenSetSelector';

const mockSaveScrollPositionSet = () => {};

describe('TokenSetSelector Component', () => {
  beforeEach(() => {
    // Reset the store state before each test
    store.dispatch.tokenState.setTokens({
      global: [],
    });
    store.dispatch.tokenState.setCollapsedTokenSets([]);
  });

  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);
    waitFor(async () => {
      expect(await result.findByText('sets')).not.toBeUndefined();
    }, { timeout: 10000 });
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');
    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Sets')).toBeNull();
  });

  it('should collapse individual folder on regular click', async () => {
    // Set tokens with folders
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder2/set2': [],
    });

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Find a folder button and click it normally
    const folderButton = result.container.querySelector('[data-testid*="folder1"] button');
    if (folderButton) {
      await fireEvent.click(folderButton);

      // Check that only that specific folder is collapsed
      const { collapsedTokenSets } = store.getState().tokenState;
      expect(collapsedTokenSets).toContain('folder1');
      expect(collapsedTokenSets).not.toContain('folder2');
    }
  });

  it('should collapse all folders on alt+click', async () => {
    // Set tokens with multiple folders
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder2/set2': [],
      'folder3/subfolder/set3': [],
    });

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Find any folder button and alt+click it
    const folderButton = result.container.querySelector('[data-testid*="folder1"] button');
    if (folderButton) {
      await fireEvent.click(folderButton, {
        altKey: true,
        bubbles: true,
        cancelable: true,
      });

      // Check that all folders are collapsed
      const { collapsedTokenSets } = store.getState().tokenState;
      expect(collapsedTokenSets).toEqual(expect.arrayContaining(['folder1', 'folder2', 'folder3', 'folder3/subfolder']));
    }
  });

  it('should expand all folders on alt+click when all are collapsed', async () => {
    // Set tokens with multiple folders
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder2/set2': [],
    });

    // Start with all folders collapsed
    store.dispatch.tokenState.setCollapsedTokenSets(['folder1', 'folder2']);

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Find any folder button and alt+click it
    const folderButton = result.container.querySelector('[data-testid*="folder1"] button');
    if (folderButton) {
      await fireEvent.click(folderButton, {
        altKey: true,
        bubbles: true,
        cancelable: true,
      });

      // Check that all folders are expanded (empty array)
      const { collapsedTokenSets } = store.getState().tokenState;
      expect(collapsedTokenSets).toEqual([]);
    }
  });

  it('create rename duplicate token set', async () => {
    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);
    // create new token set
    const newTokenSetButton = await result.findByTestId('button-new-token-set');
    fireEvent.click(newTokenSetButton);
    const newTokenSetInput = await result.findByTestId('token-set-input');
    fireEvent.change(newTokenSetInput, { target: { value: 'Folder/newSetCreated' } });
    const createButton = await result.getByRole('button', {
      name: /create/i,
    });

    fireEvent.click(createButton);
    waitFor(() => {
      expect(store.getState().tokenState.tokens).toEqual({
        'Folder/newSetCreated': [],
        global: [],
      });
    });

    // rename token set
    const createdTokenSet = result.getByText('newSetCreated');
    await fireEvent.contextMenu(createdTokenSet);
    let renameButton = await result.findByText('rename');
    fireEvent.click(renameButton);
    const renameTokenSetInput = await result.findByTestId('rename-set-input');
    fireEvent.change(renameTokenSetInput, { target: { value: 'Folder/renameSet' } });
    let changeButton = await result.getByRole('button', {
      name: /change/i,
    });
    fireEvent.click(changeButton);
    waitFor(() => {
      expect(store.getState().tokenState.tokens).toEqual({
        'Folder/renameSet': [],
        global: [],
      });
    });

    // rename sublevel
    const createdSublevel = result.getByText('Folder');
    await fireEvent.contextMenu(createdSublevel);
    renameButton = await result.findByText('rename');
    fireEvent.click(renameButton);
    const renameSublevelInput = await result.findByTestId('rename-set-input');
    fireEvent.change(renameSublevelInput, { target: { value: 'renameFolder' } });
    changeButton = await result.getByRole('button', {
      name: /change/i,
    });
    fireEvent.click(changeButton);
    waitFor(() => {
      expect(store.getState().tokenState.tokens).toEqual({
        'renameFolder/renameSet': [],
        global: [],
      });
    });

    // duplicate token set
    const renamedTokenSet = result.getByText('renameSet');
    await fireEvent.contextMenu(renamedTokenSet);
    const duplicateButton = await result.findByText('duplicate');
    fireEvent.click(duplicateButton);
    const saveButton = await result.getByRole('button', {
      name: /Save/i,
    });
    fireEvent.click(saveButton);
    waitFor(() => {
      expect(store.getState().tokenState.tokens).toEqual({
        'renameFolder/renameSet': [],
        'renameFolder/renameSet_sets.duplicateSetSuffix': [],
        global: [],
      });
    });
  });
});
