import React from 'react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { render } from '../../../tests/config/setupTest';
import StorageItem from './StorageItem';

const gitProvider = {
  id: 'other',
  provider: 'github',
  branch: 'main',
  filePath: 'si7/figma-token',
};
const onEdit = () => {};

const mockConfirm = jest.fn();
const mockRestoreStoredProvider = jest.fn();
const mockDeleteProvider = jest.fn();

jest.mock('../hooks/useConfirm', () => ({
  __esModule: true,
  default: () => ({
    confirm: mockConfirm,
  }),
}));

jest.mock('../store/remoteTokens', () => ({
  __esModule: true,
  default: () => ({
    restoreStoredProvider: mockRestoreStoredProvider,
    deleteProvider: mockDeleteProvider,
  }),
}));

describe('StorageItem', () => {
  it('should render storageItem', async () => {
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    expect(result.queryByText('Apply')).toBeInTheDocument();
  });

  it('should be able delete storageItem', async () => {
    mockConfirm.mockImplementationOnce(() => (
      Promise.resolve(true)
    ));
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    await act(async () => {
      const trigger = await result.findByTestId('storage-item-tools-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });
    await act(async () => {
      const deleteButton = await result.getByText('Delete');
      deleteButton?.focus();
      await userEvent.keyboard('[Enter]');
    });
    expect(mockDeleteProvider).toBeCalledTimes(1);
  });

  it('should be able restore storageItem', async () => {
    mockRestoreStoredProvider.mockImplementationOnce(() => (
      Promise.resolve({
        status: 'success',
      })
    ));
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );
    await result.queryByText('Apply')?.click();
    expect(mockRestoreStoredProvider).toBeCalledTimes(1);
  });
});
