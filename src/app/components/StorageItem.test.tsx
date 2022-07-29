import React from 'react';
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
  it('should render storageItem', () => {
    const { getByText } = render(<StorageItem item={gitProvider} onEdit={onEdit} />);
    expect(getByText('Edit')).toBeInTheDocument();
    expect(getByText('Apply')).toBeInTheDocument();
    expect(getByText('Delete local credentials')).toBeInTheDocument();
  });
});
