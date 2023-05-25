import React from 'react';
import { fireEvent, render } from '../../../tests/config/setupTest';
import { store } from '../store';
import TokenSetSelector from './TokenSetSelector';

describe('TokenSetSelector Component', () => {
  it('show onboarding explainer sets', () => {
    store.dispatch.uiState.setOnboardingExplainerSets('true');

    const result = render(<TokenSetSelector />);

    expect(result.findByText('Sets')).not.toBeUndefined();
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
    const newTokenSetButton = await result.findByTestId('new-set-button');
    fireEvent.click(newTokenSetButton);
    const newTokenSetInput = await result.findByTestId('create-set-input');
    fireEvent.change(newTokenSetInput, { target: { value: 'Folder/newSet' } });
    const createButton = await result.getByRole('button', {
      name: /create/i,
    });

    fireEvent.click(createButton);
    expect(store.getState().tokenState.tokens).toEqual({
      'Folder/newSet': [],
      global: [],
    });

    // rename token set
    const createdTokenSet = result.getByText('newSet');
    await fireEvent.contextMenu(createdTokenSet);
    let renameButton = await result.findByText('Rename');
    fireEvent.click(renameButton);
    const renameTokenSetInput = await result.findByTestId('rename-set-input');
    fireEvent.change(renameTokenSetInput, { target: { value: 'Folder/renameSet' } });
    let changeButton = await result.getByRole('button', {
      name: /change/i,
    });
    fireEvent.click(changeButton);
    expect(store.getState().tokenState.tokens).toEqual({
      'Folder/renameSet': [],
      global: [],
    });

    // rename sublevel
    const createdSublevel = result.getByText('Folder');
    await fireEvent.contextMenu(createdSublevel);
    renameButton = await result.findByText('Rename');
    fireEvent.click(renameButton);
    const renameSublevelInput = await result.findByTestId('rename-set-input');
    fireEvent.change(renameSublevelInput, { target: { value: 'renameFolder' } });
    changeButton = await result.getByRole('button', {
      name: /change/i,
    });
    fireEvent.click(changeButton);
    expect(store.getState().tokenState.tokens).toEqual({
      'renameFolder/renameSet': [],
      global: [],
    });

    // duplicate token set
    const renamedTokenSet = result.getByText('renameSet');
    await fireEvent.contextMenu(renamedTokenSet);
    const duplicateButton = await result.findByText('Duplicate');
    fireEvent.click(duplicateButton);
    const saveButton = await result.getByRole('button', {
      name: /Save/i,
    });
    fireEvent.click(saveButton);
    expect(store.getState().tokenState.tokens).toEqual({
      'renameFolder/renameSet': [],
      'renameFolder/renameSet_Copy': [],
      global: [],
    });
  });
});
