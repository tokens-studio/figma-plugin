import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import {
  createMockStore, render, waitFor, fireEvent,
} from '../../../../tests/config/setupTest';
import RenameTokenGroupModal from './RenameTokenGroupModal';

const tokens: Record<string, AnyTokenList> = {
  global: [
    {
      value: '#f0',
      type: TokenTypes.COLOR,
      name: 'foo.bar.something.bar',
    },
    {
      value: '#fff',
      type: TokenTypes.COLOR,
      name: 'otherfoo.something',
    },
  ],
};

const store = createMockStore({ tokenState: { tokens, activeTokenSet: 'global' } });

describe('RenameTokenGroupModal', () => {
  it('render without crashing', async () => {
    render(
      <Provider store={store}>
        <RenameTokenGroupModal
          isOpen
          newName="newName"
          oldName="oldName"
          type={TokenTypes.COLOR}
        />
      </Provider>,
    );
  });

  it('should disable renaming when there are duplicates', () => {
    const newName = 'foo.bar';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <RenameTokenGroupModal
          isOpen
          newName={newName}
          oldName={oldName}
          type={TokenTypes.COLOR}
        />
      </Provider>,
    );

    waitFor(async () => {
      expect(getByText('Change')).toBeDisabled();
    });
  });

  it('should not disable renaming when there are no duplicates', () => {
    const newName = 'foo.bar.ss';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <RenameTokenGroupModal
          isOpen
          newName={newName}
          oldName={oldName}
          type={TokenTypes.COLOR}
        />
      </Provider>,
    );

    waitFor(async () => {
      expect(getByText('Change')).not.toBeDisabled();
    });
  });

  it('should connect input to form via form attribute', () => {
    const newName = 'foo.bar.ss';
    const oldName = 'otherfoo-copy';

    const { getByRole } = render(
      <Provider store={store}>
        <RenameTokenGroupModal
          isOpen
          newName={newName}
          oldName={oldName}
          type={TokenTypes.COLOR}
        />
      </Provider>,
    );

    const input = getByRole('textbox') as HTMLInputElement;
    
    // Check that the input has the form attribute set to connect it to the form
    expect(input.getAttribute('form')).toBe('renameTokenGroup');
    
    // Check that there's a form with the matching id
    const form = document.getElementById('renameTokenGroup');
    expect(form).toBeTruthy();
    expect(form?.tagName).toBe('FORM');
  });
});
