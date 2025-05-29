import React from 'react';
import { fireEvent, render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import TokenSetSelector from './TokenSetSelector';

describe('TokenSetSelector Component', () => {
  const mockSaveScrollPositionSet = () => {};

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

  it('should render collapse all button when folders exist', async () => {
    // Set tokens with folders
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder2/set2': [],
    });

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Simply check that the collapse all button exists
    const collapseAllButton = result.queryByTestId('button-collapse-all-token-sets');
    expect(collapseAllButton).toBeInTheDocument();
  });

  it('should not render collapse all button when no folders exist', async () => {
    // Set tokens without folders (only root level sets)
    store.dispatch.tokenState.setTokens({
      global: [],
      set1: [],
      set2: [],
    });

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Check that the collapse all button doesn't exist
    const collapseAllButton = result.queryByTestId('button-collapse-all-token-sets');
    expect(collapseAllButton).not.toBeInTheDocument();
  });

  it('should toggle collapse state when collapse all button is clicked', async () => {
    // Set tokens with folders
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder1/set2': [],
      'folder2/set3': [],
    });

    const result = render(<TokenSetSelector saveScrollPositionSet={mockSaveScrollPositionSet} />);

    // Find the collapse all button
    const collapseAllButton = result.getByTestId('button-collapse-all-token-sets');
    expect(collapseAllButton).toBeInTheDocument();

    // Initially all should be expanded (no folders collapsed)
    expect(store.getState().tokenState.collapsedTokenSets).toEqual([]);

    // Click the collapse all button
    fireEvent.click(collapseAllButton);

    // Now all folders should be collapsed
    expect(store.getState().tokenState.collapsedTokenSets).toEqual(['folder1', 'folder2']);

    // Click again to expand all
    fireEvent.click(collapseAllButton);

    // Now all should be expanded again
    expect(store.getState().tokenState.collapsedTokenSets).toEqual([]);
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
