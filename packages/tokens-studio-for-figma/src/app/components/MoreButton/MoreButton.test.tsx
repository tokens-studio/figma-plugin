import React from 'react';
import { Provider } from 'react-redux';
import copy from 'copy-to-clipboard';
import { TokenTypes } from '@/constants/TokenTypes';
import {
  act, createMockStore, fireEvent, render,
} from '../../../../tests/config/setupTest';
import { MoreButton } from './MoreButton';
import { SingleToken } from '@/types/tokens';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { UpdateMode } from '@/constants/UpdateMode';
import useManageTokens from '../../store/useManageTokens';

const mockShowForm = jest.fn();
const mockDeleteToken = jest.fn();
const mockSetNodeData = jest.fn(() => Promise.resolve());

jest.mock('../../store/useManageTokens', () => jest.fn(() => ({
  deleteSingleToken: mockDeleteToken,
})));

jest.mock('../../../hooks/useSetNodeData', () => jest.fn(() => mockSetNodeData));

jest.mock('copy-to-clipboard', () => jest.fn());

const token: SingleToken = {
  value: '16',
  name: 'my-large-token',
  type: TokenTypes.SPACING,
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

  it('should not move focus back to the token when edit opens the edit form', async () => {
    const mockStore = createMockStore({});
    const showForm = jest.fn(() => mockStore.dispatch.uiState.setShowEditForm(true));
    const { getByText } = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={showForm}
          token={token}
        />
        <input data-testid="edit-form-input" />
      </Provider>,
    );
    jest.useFakeTimers();
    try {
      const tokenButton = getByText(token.name).closest('button') as HTMLButtonElement;
      act(() => {
        tokenButton.focus();
      });
      fireEvent.contextMenu(tokenButton);
      act(() => {
        fireEvent.click(getByText('Edit Token'));
      });
      // The edit form focuses its first field as it opens, before the closed menu restores focus
      (document.querySelector('[data-testid="edit-form-input"]') as HTMLInputElement).focus();
      // The menu restores focus from a timer once it unmounts. Run it explicitly: waiting for the
      // expectation instead would pass before that timer fires, with or without the fix.
      act(() => {
        jest.runOnlyPendingTimers();
      });
      expect(showForm).toHaveBeenCalled();
      expect(document.activeElement).toBe(document.querySelector('[data-testid="edit-form-input"]'));
    } finally {
      jest.useRealTimers();
    }
  });

  it('should move focus back to the token when the menu closes without opening the edit form', () => {
    const mockStore = createMockStore({});
    const { getByText } = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
        <input data-testid="other-input" />
      </Provider>,
    );
    jest.useFakeTimers();
    try {
      const tokenButton = getByText(token.name).closest('button') as HTMLButtonElement;
      act(() => {
        tokenButton.focus();
      });
      fireEvent.contextMenu(tokenButton);
      act(() => {
        fireEvent.click(getByText('Copy Token Path'));
      });
      (document.querySelector('[data-testid="other-input"]') as HTMLInputElement).focus();
      act(() => {
        jest.runOnlyPendingTimers();
      });
      expect(document.activeElement).toBe(tokenButton);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should copy the token path', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    await fireEvent.contextMenu(getByText(token.name));
    await fireEvent.click(getByText('Copy Token Path'));
    expect(copy).toHaveBeenCalledWith(token.name, {});
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
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: token.name,
    }, []);
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
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: 'delete',
    }, []);
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
    expect(mockSetNodeData).toHaveBeenCalledWith({ itemSpacing: 'delete' }, []);
  });

  it('should remove other properties if a main one is given', async () => {
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          paddingLeft: token.name,
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
    await fireEvent.click(result.getByText('All'));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      counterAxisSpacing: 'delete',
      horizontalPadding: 'delete',
      verticalPadding: 'delete',
      spacing: token.name,
      paddingLeft: 'delete',
      paddingTop: 'delete',
      paddingRight: 'delete',
      paddingBottom: 'delete',
    }, []);
  });

  it('gap property should not be applied when spacing token has multi value', async () => {
    const multiSpacingToken: SingleToken = {
      value: '16 20',
      name: 'two-value-token',
      type: TokenTypes.SPACING,
    };
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          paddingLeft: multiSpacingToken.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={multiSpacingToken}
        />
      </Provider>,
    );
    await fireEvent.contextMenu(result.getByText(multiSpacingToken.name));
    await fireEvent.click(result.getByText('Gap'));
    expect(mockSetNodeData).toBeCalledTimes(0);
  });

  it('should deselect the correct property when token is applied to specific property', async () => {
    // Test case for the bug fix: when a spacing token is applied to gap (itemSpacing),
    // left-clicking should toggle gap, not the first property
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
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: 'delete',
    }, []);
  });

  it('should deselect paddingLeft when token is applied to paddingLeft, not gap', async () => {
    // Test case for the bug fix: when a spacing token is applied to paddingLeft,
    // left-clicking should toggle paddingLeft, not gap
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          paddingLeft: token.name,
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
    expect(mockSetNodeData).toHaveBeenCalledWith({
      paddingLeft: 'delete',
    }, []);
  });

  it('should deselect the property from the latest selection', async () => {
    const mockStore = createMockStore({});

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={mockShowForm}
          token={token}
        />
      </Provider>,
    );
    act(() => {
      mockStore.dispatch.uiState.setSelection({
        selectedLayers: 1, disabled: false, mainNodeSelectionValues: { paddingLeft: token.name }, selectionValues: [],
      });
    });
    await fireEvent.click(result.getByText(token.name));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      paddingLeft: 'delete',
    }, []);
  });

  it('should not re-render when the selection changes without involving the token', () => {
    const mockStore = createMockStore({});
    const onRender = jest.fn();

    render(
      <Provider store={mockStore}>
        <React.Profiler id="more-button" onRender={onRender}>
          <MoreButton
            type={TokenTypes.SPACING}
            showForm={mockShowForm}
            token={token}
          />
        </React.Profiler>
      </Provider>,
    );
    onRender.mockClear();
    act(() => {
      mockStore.dispatch.uiState.setSelection({
        selectedLayers: 1, disabled: false, mainNodeSelectionValues: { itemSpacing: 'another-token' }, selectionValues: [],
      });
    });
    expect(onRender).not.toHaveBeenCalled();
  });

  it('should not re-render or remount on selecting layers, settings changes or opening the edit form', () => {
    const mockStore = createMockStore({});
    const onRender = jest.fn();

    const result = render(
      <Provider store={mockStore}>
        <React.Profiler id="more-button" onRender={onRender}>
          <MoreButton
            type={TokenTypes.SPACING}
            showForm={mockShowForm}
            token={token}
          />
        </React.Profiler>
      </Provider>,
    );
    const button = result.getByText(token.name).closest('button');
    onRender.mockClear();
    act(() => {
      mockStore.dispatch.uiState.setSelection({
        selectedLayers: 1, disabled: false, mainNodeSelectionValues: {}, selectionValues: [],
      });
      mockStore.dispatch.uiState.setSelection({
        selectedLayers: 0, disabled: true, mainNodeSelectionValues: {}, selectionValues: [],
      });
      mockStore.dispatch.settings.setUpdateMode(UpdateMode.DOCUMENT);
      mockStore.dispatch.uiState.setShowEditForm(true);
      mockStore.dispatch.uiState.setShowEditForm(false);
    });
    expect(onRender).not.toHaveBeenCalled();
    expect(result.getByText(token.name).closest('button')).toBe(button);
  });

  it('should only set up the menu actions once the menu is opened', async () => {
    const result = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    expect(useManageTokens).not.toHaveBeenCalled();
    await fireEvent.contextMenu(result.getByText(token.name));
    expect(useManageTokens).toHaveBeenCalled();
  });

  it('should deselect correct child property for dimension tokens', async () => {
    // Test case for dimension tokens with child properties
    const dimensionToken: SingleToken = {
      value: '16px',
      name: 'dimension-token',
      type: TokenTypes.DIMENSION,
    };
    const mockStore = createMockStore({
      uiState: {
        mainNodeSelectionValues: {
          itemSpacing: dimensionToken.name,
        },
      },
    });

    const result = render(
      <Provider store={mockStore}>
        <MoreButton
          type={TokenTypes.DIMENSION}
          showForm={mockShowForm}
          token={dimensionToken}
        />
      </Provider>,
    );
    await fireEvent.click(result.getByText(dimensionToken.name));
    expect(mockSetNodeData).toHaveBeenCalledWith({
      itemSpacing: 'delete',
    }, []);
  });

  it('show all properties about dimension token', async () => {
    const dimensionToken: SingleToken = {
      value: '16px',
      name: 'dimension-regular',
      type: TokenTypes.DIMENSION,
    };
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.DIMENSION}
        showForm={mockShowForm}
        token={dimensionToken}
      />,
    );
    expect(getByText(dimensionToken.name)).toBeInTheDocument();
    await fireEvent.contextMenu(getByText(dimensionToken.name));
    expect(getByText('Spacing')).toBeInTheDocument();
    expect(getByText('Sizing')).toBeInTheDocument();
    expect(getByText('Border radius')).toBeInTheDocument();
    expect(getByText('Border width')).toBeInTheDocument();
  });

  it('cmd + click should lead to editForm', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={token}
      />,
    );
    expect(getByText(token.name)).toBeInTheDocument();
    await fireEvent.click(getByText(token.name), {
      ctrlKey: true,
    });
    expect(mockShowForm).toHaveBeenCalled();
  });

  it('cmd + click should lead to editForm on Mac', async () => {
    const platform = jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const showForm = jest.fn();
    try {
      const { getByText } = render(
        <MoreButton
          type={TokenTypes.SPACING}
          showForm={showForm}
          token={token}
        />,
      );
      await fireEvent.click(getByText(token.name), {
        metaKey: true,
      });
      expect(showForm).toHaveBeenCalledWith({ name: token.name, token, status: EditTokenFormStatus.EDIT });
    } finally {
      platform.mockRestore();
    }
  });
});
