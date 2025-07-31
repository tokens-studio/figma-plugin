import React from 'react';
import {
  fireEvent, render,
} from '../../../../tests/config/setupTest';
import { TokenGroupHeading } from './TokenGroupHeading';

const mockShowNewForm = jest.fn();

describe('TokenGroupHeading', () => {
  it('should render group context menu', async () => {
    const { getByText } = render(<TokenGroupHeading
      id="1"
      label="color"
      path="color.slate"
      type="color"
      showNewForm={mockShowNewForm}
    />);

    await fireEvent.contextMenu(getByText('color'));

    expect(getByText('duplicate')).toBeInTheDocument();
  });

  it('should render rename token group modal', async () => {
    const { getByText } = render(<TokenGroupHeading
      id="1"
      label="color"
      path="color.slate"
      type="color"
      showNewForm={mockShowNewForm}
    />);

    await fireEvent.contextMenu(getByText('color'));
    await fireEvent.click(getByText('rename'));

    expect(getByText('rename color.slate')).toBeInTheDocument();
  });

  it('should render duplicate token group modal', async () => {
    const { getByText } = render(<TokenGroupHeading
      id="1"
      label="color"
      path="color.slate"
      type="color"
      showNewForm={mockShowNewForm}
    />);

    await fireEvent.contextMenu(getByText('color'));
    await fireEvent.click(getByText('duplicate'));

    expect(getByText('duplicateGroup')).toBeInTheDocument();
  });
});
