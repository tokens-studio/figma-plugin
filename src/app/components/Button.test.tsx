import React from 'react';
import { Button } from '@tokens-studio/ui';
import { render } from '../../../tests/config/setupTest';

describe('Button', () => {
  it('displays text', () => {
    const { getByText } = render(<Button variant="primary">Content</Button>);
    expect(getByText('Content')).toBeInTheDocument();
  });
});
