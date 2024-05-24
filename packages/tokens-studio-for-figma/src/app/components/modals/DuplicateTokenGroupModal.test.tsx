import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import { createMockStore, fireEvent, render, waitFor } from '../../../../tests/config/setupTest';
import DuplicateTokenGroupModal from './DuplicateTokenGroupModal';

const tokens: Record<string, AnyTokenList> = {
  global: [
    {
      value: '#f0',
      type: TokenTypes.COLOR,
      name: 'foo.bar.something.bar'
    },
    {
      value: '#fff',
      type: TokenTypes.COLOR,
      name: 'otherfoo.something'
    }
  ]
};

const store = createMockStore({ tokenState: { tokens, activeTokenSet: 'global' } });

describe('DuplicateTokenGroupModal', () => {
  it('render without crashing', async () => {
    render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName="newName"
          oldName="oldName"
          onClose={() => {}}
          handleNewTokenGroupNameChange={() => {}}
        />
      </Provider>
    );
  });

  it('should allow duplication when there are no duplicates', async () => {
    const newName = 'foo.bar';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName={newName}
          oldName={oldName}
          onClose={() => {}}
          handleNewTokenGroupNameChange={() => {}}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(getByText('duplicate')).not.toBeDisabled();
    });
  });

  it('should disable duplication when there are duplicates', () => {
    const newName = 'foo.bar.ss';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName={newName}
          oldName={oldName}
          onClose={() => {}}
          handleNewTokenGroupNameChange={() => {}}
        />
      </Provider>
    );

    expect(getByText('duplicate')).not.toBeDisabled();
  });
});