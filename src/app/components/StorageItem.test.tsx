import React from 'react';
import * as reactRedux from 'react-redux';
import { render } from '../../../tests/config/setupTest';
import StorageItem from './StorageItem';

const activeProvideer = {
  id: 'defalut',
  provider: 'github',
  branch: 'main',
  filePath: 'si7/figma-token',
};
const gitProvider = {
  id: 'other',
  provider: 'github',
  branch: 'main',
  filePath: 'si7/figma-token',
};
const onEdit = () => {};

describe('StorageItem', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
  beforeEach(() => {
    useSelectorMock.mockClear();
  });

  it('should render storageItem', () => {
    const { getByText } = render(<StorageItem item={gitProvider} onEdit={onEdit} />);
    expect(getByText('Edit')).toBeInTheDocument();
    expect(getByText('Apply')).toBeInTheDocument();
    expect(getByText('Delete local credentials')).toBeInTheDocument();
  });

  it('should render delete button when item is active', () => {
    useSelectorMock.mockReturnValue({
      id: 'defalut',
      provider: 'github',
      branch: 'main',
      filePath: 'si7/figma-token',
    });
    const { getByText, queryByText } = render(<StorageItem item={activeProvideer} onEdit={onEdit} />);
    expect(getByText('Edit')).toBeInTheDocument();
    expect(queryByText('Apply')).not.toBeInTheDocument();
    expect(getByText('Delete local credentials')).toBeInTheDocument();
  });
});
