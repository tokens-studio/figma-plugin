import React from 'react';
import { TokenTypes } from '@/constants/TokenTypes';
import { fireEvent, render } from '../../../../tests/config/setupTest';
import { MoreButton } from './MoreButton';

const mockShowForm = jest.fn();
const mockDeleteToken = jest.fn();

jest.mock('../../store/useManageTokens', () => jest.fn(() => ({
  deleteSingleToken: mockDeleteToken,
})));

describe('MoreButton', () => {
  it('displays menu items', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={{
          value: '16',
          name: 'my-large-token',
          type: TokenTypes.SPACING,
        }}
      />,
    );
    expect(getByText('my-large-token')).toBeInTheDocument();
    await fireEvent.contextMenu(getByText('my-large-token'));
    expect(getByText('Gap')).toBeInTheDocument();
    expect(getByText('Documentation Tokens')).toBeInTheDocument();
  });

  it('should show form on edit', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={{
          value: '16',
          name: 'my-large-token',
          type: TokenTypes.SPACING,
        }}
      />,
    );
    await fireEvent.contextMenu(getByText('my-large-token'));
    expect(getByText('Edit Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Edit Token'));
    expect(mockShowForm).toHaveBeenCalled();
  });

  it('should call delete on delete', async () => {
    const { getByText } = render(
      <MoreButton
        type={TokenTypes.SPACING}
        showForm={mockShowForm}
        token={{
          value: '16',
          name: 'my-large-token',
          type: TokenTypes.SPACING,
        }}
      />,
    );
    await fireEvent.contextMenu(getByText('my-large-token'));
    expect(getByText('Delete Token')).toBeInTheDocument();
    await fireEvent.click(getByText('Delete Token'));
    expect(mockDeleteToken).toHaveBeenCalled();
  });
});
