import React from 'react';
import { render } from '../../../tests/config/setupTest';
import Button from './Button';

describe('Button', () => {
  it('displays text', () => {
    const { getByText } = render(<Button variant="primary">Content</Button>);
    expect(getByText('Content')).toBeInTheDocument();
  });
});
