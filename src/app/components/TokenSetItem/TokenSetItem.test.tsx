import React from 'react';
import { Provider } from 'react-redux';
import { TreeItem } from '@/utils/tokenset';
import {
  createMockStore,
  fireEvent, render,
} from '../../../../tests/config/setupTest';
import { TokenSetItem } from './TokenSetItem';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

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
    await fireEvent.click(getByText('Rename'));
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
    await fireEvent.click(getByText('Delete'));
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
    await fireEvent.click(getByText('Duplicate'));
    expect(mockOnDuplicate).toBeCalled();
  });
});
