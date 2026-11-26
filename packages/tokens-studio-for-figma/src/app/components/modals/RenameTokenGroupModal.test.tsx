import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import {
  createMockStore, render, waitFor,
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

  it('should disable renaming when there are duplicates', async () => {
    // A token with this name already exists. An existing group name alone is allowed.
    const newName = 'otherfoo.something';
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

    await waitFor(async () => {
      expect(getByRole('button', { name: 'change' })).toBeDisabled();
    });
  });

  it('should not disable renaming when there are no duplicates', async () => {
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

    await waitFor(async () => {
      expect(getByRole('button', { name: 'change' })).not.toBeDisabled();
    });
  });
});
