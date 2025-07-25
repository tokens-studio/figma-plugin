import React from 'react';
import { Provider } from 'react-redux';
import { TreeItem } from '@/utils/tokenset';
import {
  createMockStore,
  fireEvent, render,
} from '../../../../tests/config/setupTest';
import { TokenSetItem } from './TokenSetItem';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { StorageProviderType } from '@/constants/StorageProviderType';

describe('TokenSetItem', () => {
  const mockOnClick = jest.fn();
  const mockOnRename = jest.fn();
  const mockOnCheck = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnDuplicate = jest.fn();
  const mockOnTreatAsSource = jest.fn();
  const mockOnDragStart = jest.fn();

  it('should be able to rename token set', async () => {
    const mockItem = {
      label: 'light',
      path: 'light',
      isLeaf: true,
    } as unknown as TreeItem;
    const { getByText } = render(<TokenSetItem
      isActive
      onClick={mockOnClick}
      isChecked
      item={mockItem}
      onCheck={mockOnCheck}
      canReorder
      canEdit
      canDelete
      onDelete={mockOnDelete}
      onDuplicate={mockOnDuplicate}
      onDragStart={mockOnDragStart}
      onRename={mockOnRename}
      onTreatAsSource={mockOnTreatAsSource}
    />);

    await fireEvent.contextMenu(getByText('light'));
    await fireEvent.click(getByText('rename'));
    expect(mockOnRename).toBeCalled();
  });

  it('should be able to delete token set', async () => {
    const mockItem = {
      label: 'light',
      path: 'light',
      isLeaf: true,
    } as unknown as TreeItem;
    const { getByText } = render(<TokenSetItem
      isActive
      onClick={mockOnClick}
      isChecked
      item={mockItem}
      onCheck={mockOnCheck}
      canReorder
      canEdit
      canDelete
      onDelete={mockOnDelete}
      onDuplicate={mockOnDuplicate}
      onDragStart={mockOnDragStart}
      onRename={mockOnRename}
      onTreatAsSource={mockOnTreatAsSource}
    />);

    await fireEvent.contextMenu(getByText('light'));
    await fireEvent.click(getByText('delete'));
    expect(mockOnDelete).toBeCalled();
  });

  it('should be able to duplicate token set', async () => {
    const mockItem = {
      label: 'light',
      path: 'light',
      isLeaf: true,
    } as unknown as TreeItem;
    const mockStore = createMockStore({
      tokenState: {
        usedTokenSet: {
          light: TokenSetStatus.SOURCE,
        },
      },
    });

    const { getByText } = render(
      <Provider store={mockStore}>
        <TokenSetItem
          isActive
          onClick={mockOnClick}
          isChecked
          item={mockItem}
          onCheck={mockOnCheck}
          canReorder
          canEdit
          canDelete
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onDragStart={mockOnDragStart}
          onRename={mockOnRename}
          onTreatAsSource={mockOnTreatAsSource}
        />
      </Provider>,
    );

    await fireEvent.contextMenu(getByText('light'));
    await fireEvent.click(getByText('duplicate'));
    expect(mockOnDuplicate).toBeCalled();
  });

  it('should show "Edit in Studio" option when using Tokens Studio storage', async () => {
    const mockItem = {
      label: 'core',
      path: 'core',
      isLeaf: true,
    } as unknown as TreeItem;
    const mockStore = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.TOKENS_STUDIO,
          orgId: 'test-org',
          id: 'test-project',
          name: 'Test Project',
          baseUrl: 'https://app.tokens.studio',
        },
      },
    });

    const { getByText } = render(
      <Provider store={mockStore}>
        <TokenSetItem
          isActive
          onClick={mockOnClick}
          isChecked
          item={mockItem}
          onCheck={mockOnCheck}
          canReorder
          canEdit
          canDelete
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onDragStart={mockOnDragStart}
          onRename={mockOnRename}
          onTreatAsSource={mockOnTreatAsSource}
        />
      </Provider>,
    );

    await fireEvent.contextMenu(getByText('core'));
    expect(getByText('Edit in Studio')).toBeInTheDocument();
  });

  it('should not show "Edit in Studio" option when not using Tokens Studio storage', async () => {
    const mockItem = {
      label: 'core',
      path: 'core',
      isLeaf: true,
    } as unknown as TreeItem;
    const mockStore = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.GITHUB,
          id: 'test/repo',
          name: 'Test Repo',
          branch: 'main',
          filePath: 'tokens.json',
        },
      },
    });

    const { getByText, queryByText } = render(
      <Provider store={mockStore}>
        <TokenSetItem
          isActive
          onClick={mockOnClick}
          isChecked
          item={mockItem}
          onCheck={mockOnCheck}
          canReorder
          canEdit
          canDelete
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onDragStart={mockOnDragStart}
          onRename={mockOnRename}
          onTreatAsSource={mockOnTreatAsSource}
        />
      </Provider>,
    );

    await fireEvent.contextMenu(getByText('core'));
    expect(queryByText('Edit in Studio')).not.toBeInTheDocument();
  });

  it('should open studio URL when "Edit in Studio" is clicked', async () => {
    const mockItem = {
      label: 'core',
      path: 'core',
      isLeaf: true,
    } as unknown as TreeItem;
    const mockStore = createMockStore({
      uiState: {
        storageType: {
          provider: StorageProviderType.TOKENS_STUDIO,
          orgId: 'test-org',
          id: 'test-project',
          name: 'Test Project',
          baseUrl: 'https://app.tokens.studio',
        },
      },
    });

    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true,
    });

    const { getByText } = render(
      <Provider store={mockStore}>
        <TokenSetItem
          isActive
          onClick={mockOnClick}
          isChecked
          item={mockItem}
          onCheck={mockOnCheck}
          canReorder
          canEdit
          canDelete
          onDelete={mockOnDelete}
          onDuplicate={mockOnDuplicate}
          onDragStart={mockOnDragStart}
          onRename={mockOnRename}
          onTreatAsSource={mockOnTreatAsSource}
        />
      </Provider>,
    );

    await fireEvent.contextMenu(getByText('core'));
    await fireEvent.click(getByText('Edit in Studio'));

    expect(mockOpen).toHaveBeenCalledWith(
      'https://app.tokens.studio/org/test-org/project/test-project/data/main/tokens/set/core',
      '_blank'
    );
  });
});
