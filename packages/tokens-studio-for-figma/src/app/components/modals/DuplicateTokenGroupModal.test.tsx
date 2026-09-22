import React from 'react';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import {
  createMockStore, render, waitFor,
} from '../../../../tests/config/setupTest';
import DuplicateTokenGroupModal from './DuplicateTokenGroupModal';

const otherTokens: Record<string, AnyTokenList> = {
  global: [
    {
      value: '#f0',
      type: TokenTypes.COLOR,
      name: 'foo.bar.something.bar',
    },
  ],
  light: [],
  dark: [],
};

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

  it('should allow selecting multiple sets without closing the dropdown', async () => {
    const multiSetStore = createMockStore({ tokenState: { tokens: otherTokens, activeTokenSet: 'global' } });

    const { getByTestId } = render(
      <Provider store={multiSetStore}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName="foo-copy"
          oldName="foo"
        />
      </Provider>,
    );

    await userEvent.click(getByTestId('duplicate-token-group-sets-trigger'), { pointerEventsCheck: 0 });
    await userEvent.click(getByTestId('duplicate-token-group-sets-checkbox-light'), { pointerEventsCheck: 0 });
    await userEvent.click(getByTestId('duplicate-token-group-sets-checkbox-dark'), { pointerEventsCheck: 0 });

    expect(getByTestId('duplicate-token-group-sets-content')).toBeInTheDocument();
    expect(getByTestId('duplicate-token-group-sets-checkbox-global')).toHaveAttribute('data-state', 'checked');
    expect(getByTestId('duplicate-token-group-sets-checkbox-light')).toHaveAttribute('data-state', 'checked');
    expect(getByTestId('duplicate-token-group-sets-checkbox-dark')).toHaveAttribute('data-state', 'checked');
  });

  it('should filter the sets through the search field', async () => {
    const multiSetStore = createMockStore({ tokenState: { tokens: otherTokens, activeTokenSet: 'global' } });

    const { getByTestId, queryByTestId } = render(
      <Provider store={multiSetStore}>
        <DuplicateTokenGroupModal
          isOpen
          type={TokenTypes.COLOR}
          newName="foo-copy"
          oldName="foo"
        />
      </Provider>,
    );

    await userEvent.click(getByTestId('duplicate-token-group-sets-trigger'), { pointerEventsCheck: 0 });
    await userEvent.type(getByTestId('duplicate-token-group-sets-search'), 'light');

    expect(getByTestId('duplicate-token-group-sets-item-light')).toBeInTheDocument();
    expect(queryByTestId('duplicate-token-group-sets-item-dark')).not.toBeInTheDocument();
  });
});
