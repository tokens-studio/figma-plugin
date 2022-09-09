import React from 'react';
import { fireEvent, render, resetStore } from '../../../../tests/config/setupTest';
import { TokenGroupHeading } from './TokenGroupHeading';


const mockShowNewForm = jest.fn();

describe('TokenGroup', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should be able to collpase a token group', async () => {
    const { getByText } = render(<TokenGroupHeading
      id='color'
      label='primary'
      path='color.primary'
      type='color'
      showNewForm={mockShowNewForm}
    />);

    await fireEvent.click(getByText('Delete'));

  });

});
