import React from 'react';
import { fireEvent, render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import TokenSetSelector from './TokenSetSelector';

describe('TokenSetSelector Component', () => {
  beforeEach(() => {
    // Reset the store state before each test
    store.dispatch.tokenState.setTokens({
      global: [],
      'folder1/set1': [],
      'folder1/set2': [],
      'folder2/set3': [],
    });
    store.dispatch.tokenState.setCollapsedTokenSets([]);
  });

  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    waitFor(async () => {
      expect(await result.findByText('sets')).not.toBeUndefined();
    }, { timeout: 10000 });
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Sets')).toBeNull();
  });

  it('should show collapse all button when there are folders', async () => {
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    
    const collapseAllButton = await result.findByTestId('button-collapse-all-token-sets');
    expect(collapseAllButton).toBeInTheDocument();
    expect(collapseAllButton).toHaveTextContent('to collapse all');
  });

  it('should not show collapse all button when there are no folders', async () => {
    // Set tokens with no folders (only root level sets)
    store.dispatch.tokenState.setTokens({
      global: [],
      set1: [],
      set2: [],
    });
    
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    
    const collapseAllButton = result.queryByTestId('button-collapse-all-token-sets');
    expect(collapseAllButton).not.toBeInTheDocument();
  });

  it('should collapse all folders when clicking collapse all', async () => {
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    
    const collapseAllButton = await result.findByTestId('button-collapse-all-token-sets');
    
    // Initially should show "to collapse all"
    expect(collapseAllButton).toHaveTextContent('to collapse all');
    
    // Click to collapse all
    fireEvent.click(collapseAllButton);
    
    // Check that state is updated
    await waitFor(() => {
      const state = store.getState();
      expect(state.tokenState.collapsedTokenSets).toEqual(['folder1', 'folder2']);
    });
  });

  it('should expand all folders when all are collapsed', async () => {
    // Start with all folders collapsed
    store.dispatch.tokenState.setCollapsedTokenSets(['folder1', 'folder2']);
    
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    
    const collapseAllButton = await result.findByTestId('button-collapse-all-token-sets');
    
    // Should show "to expand all" since all are collapsed
    expect(collapseAllButton).toHaveTextContent('to expand all');
    
    // Click to expand all
    fireEvent.click(collapseAllButton);
    
    // Check that state is updated (empty array means all expanded)
    await waitFor(() => {
      const state = store.getState();
      expect(state.tokenState.collapsedTokenSets).toEqual([]);
    });
  });

  it('should collapse all when in mixed state', async () => {
    // Start with some folders collapsed
    store.dispatch.tokenState.setCollapsedTokenSets(['folder1']);
    
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
    
    const collapseAllButton = await result.findByTestId('button-collapse-all-token-sets');
    
    // Should show "to collapse all" since it's mixed state
    expect(collapseAllButton).toHaveTextContent('to collapse all');
    
    // Click to collapse all
    fireEvent.click(collapseAllButton);
    
    // Check that all folders are now collapsed
    await waitFor(() => {
      const state = store.getState();
      expect(state.tokenState.collapsedTokenSets).toEqual(['folder1', 'folder2']);
    });
  });

  it('create rename duplicate token set', async () => {
    const result = render(<TokenSetSelector saveScrollPositionSet={() => {}} />);
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
