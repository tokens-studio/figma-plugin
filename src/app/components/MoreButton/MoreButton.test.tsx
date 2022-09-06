import React from 'react';
import { Provider } from 'react-redux';
import { TokenTypes } from '@/constants/TokenTypes';
import { createMockStore, fireEvent, render } from '../../../../tests/config/setupTest';
import { MoreButton } from './MoreButton';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { store } from '@/app/store';
import { SingleToken } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { TokensContext } from '@/context';

const mockShowForm = jest.fn();
const mockDeleteToken = jest.fn();
const mockSetNodeData = jest.fn();

const messageSpy = jest.spyOn(AsyncMessageChannel.ReactInstance, 'message');

AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_NODE_DATA, mockSetNodeData);

jest.mock('../../store/useManageTokens', () => jest.fn(() => ({
  deleteSingleToken: mockDeleteToken,
})));

const token: SingleToken = {
  value: '16',
  name: 'my-large-token',
  type: TokenTypes.SPACING,
};

const tokensContextStore: { resolvedTokens: SingleToken[] } = {
  resolvedTokens: [{
    name: 'my-comp-token',
    value: {
      paddingLeft: 'my-large-token',
      paddingRight: 'my-large-token',
    },
    type: TokenTypes.COMPOSITION,
  }],
};

describe('MoreButton', () => {
  it('displays menu items', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    expect(getByText(token.name)).toBeInTheDocument();
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Gap')).toBeInTheDocument();
    expect(getByText('Documentation Tokens')).toBeInTheDocument();
  });

  it('should show form on edit', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Edit Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Edit Token'));
    expect(mockShowForm).toHaveBeenCalled();
  });

  it('should show form on duplicate', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Duplicate Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Duplicate Token'));
    expect(mockShowForm).toHaveBeenCalledWith({ name: `${token.name}-copy`, token, status: EditTokenFormStatus.DUPLICATE });
  });

  it('should call delete on delete', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    expect(getByText('Delete Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Delete Token'));
    expect(mockDeleteToken).toHaveBeenCalled();
  });

  it('should apply when clicking', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.click(getByText(token.name));
    expect(messageSpy).toHaveBeenCalledWith({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: {
        itemSpacing: token.name,
      },
      tokens: [],
      settings: store.getState().settings,
    });
  });

  it('should clear when clicking', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          itemSpacing: token.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    await fireEvent.click(result.getByText(token.name));
    expect(messageSpy).toHaveBeenCalledWith({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: {
        itemSpacing: 'delete',
      },
      tokens: [],
      settings: store.getState().settings,
    });
  });

  it('should clear when using context menu', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          itemSpacing: token.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    await fireEvent.contextMenu(result.getByText(token.name));
    await fireEvent.click(result.getByText('Gap'));
    expect(messageSpy).toHaveBeenCalledWith({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: {
        itemSpacing: 'delete',
      },
      tokens: [],
      settings: store.getState().settings,
    });
  });

  it('should clear composition tokens', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          composition: 'my-comp-token',
        },
      },
    });

    const result = render(
      <TokensContext.Provider value={tokensContextStore}>
        <Provider store={mockStore}>
          <MoreButton
            type={TokenTypes.COMPOSITION}
            showForm={mockShowForm}
            token={{
              name: 'my-comp-token',
              value: {
                paddingLeft: 'my-large-token',
                paddingRight: 'my-large-token',
              },
              type: TokenTypes.COMPOSITION,
            }}
          />
        </Provider>
      </TokensContext.Provider>,
    );
    await fireEvent.click(result.getByText('my-comp-token'));
    expect(messageSpy).toHaveBeenCalledWith({
      type: AsyncMessageTypes.SET_NODE_DATA,
      values: {
        composition: 'delete',
        paddingLeft: 'delete',
        paddingRight: 'delete',
      },
      tokens: [],
      settings: { ...store.getState().settings, tokens: tokensContextStore.resolvedTokens },
    });
  });
});
