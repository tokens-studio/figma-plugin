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

    expect(getByText('Duplicate')).toBeInTheDocument();
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
    await fireEvent.click(getByText('Rename'));

    expect(getByText('Rename color.slate')).toBeInTheDocument();
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
    await fireEvent.click(getByText('Duplicate'));

    expect(getByText('Duplicate group')).toBeInTheDocument();
  });
});
