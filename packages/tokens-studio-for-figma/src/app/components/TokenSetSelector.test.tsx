import React from 'react';
import { fireEvent, render, waitFor } from '../../../tests/config/setupTest';
import { store } from '../store';
import TokenSetSelector from './TokenSetSelector';

describe('TokenSetSelector Component', () => {
  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector />);
    waitFor(async () => {
      expect(await result.findByText('sets')).not.toBeUndefined();
    }, { timeout: 10000 });
  });

  it('hide onboarding explainer syncproviders', async () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');
    const result = render(<TokenSetSelector />);

    fireEvent.click(result.getByTestId('closeButton'));

    expect(result.queryByText('Sets')).toBeNull();
  });

  it('create rename duplicate token set', async () => {
    const result = render(<TokenSetSelector />);
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
