import React from 'react';
import { render } from '../../../../../tests/config/setupTest';
import { ColorDisplayBubble } from '../ColorDisplayBubble';

describe('ColorDisplayBubble', () => {
  it('should render correctly', async () => {
    const result = render(<ColorDisplayBubble data-testid="colordisplaybubble" color="#ff0000" />);
    const element = await result.findByTestId('colordisplaybubble');
    expect(element.style.getPropertyValue('--backgroundColor')).toEqual('#ff0000');
  });
});
