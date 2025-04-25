import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import {
  createMockStore, render, waitFor,
} from '../../../../tests/config/setupTest';
import DuplicateTokenGroupModal from './DuplicateTokenGroupModal';

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

describe('DuplicateTokenGroupModal', () => {
  it('render without crashing', async () => {
    render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName="newName"
          oldName="oldName"
        />
      </Provider>,
    );
  });

  it('should disable duplication when there are duplicates', () => {
    const newName = 'foo.bar';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName={newName}
          oldName={oldName}
        />
      </Provider>,
    );

    waitFor(async () => {
      expect(getByText('duplicate')).toBeDisabled();
    });
  });

  it('should not disable duplication when there are no duplicates', () => {
    const newName = 'foo.bar.ss';
    const oldName = 'otherfoo-copy';

    const { getByText } = render(
      <Provider store={store}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName={newName}
          oldName={oldName}
        />
      </Provider>,
    );

    waitFor(async () => {
      expect(getByText('duplicate')).not.toBeDisabled();
    });
  });
});
