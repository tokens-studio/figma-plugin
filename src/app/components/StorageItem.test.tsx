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

describe('StorageItem', () => {
  it('should render storageItem', async () => {
    const result = render(
      <StorageItem item={gitProvider} onEdit={onEdit} />,
    );

    expect(result.queryByText('Apply')).toBeInTheDocument();

    await act(async () => {
      const trigger = await result.findByTestId('storage-item-tools-dropdown');
      trigger.focus();
      await userEvent.keyboard('[Enter]');
    });
    expect(result.queryByText('Edit')).toBeInTheDocument();
    expect(result.queryByText('Delete')).toBeInTheDocument();
  });
});
