import { MotionConfig } from 'framer-motion';
import React from 'react';
import { act, render } from '../../../../../tests/config/setupTest';
import { Accordion } from '../Accordion';

describe('Accordion', () => {
  it('Can toggle the accordion', async () => {
    const element = render(
      <MotionConfig reducedMotion="always">
        <Accordion
          label="Header"
          extra={(
            <button type="button" data-testid="accordion-extra">Click me</button>
          )}
        >
          Lorem ipsum
        </Accordion>
      </MotionConfig>,
    );

    expect(element.queryByText('Header')).not.toBeNull();
    expect(element.queryByTestId('accordion-extra')).not.toBeNull();
    expect(element.queryByTestId('accordion-content')).toBeNull();

    await act(async () => {
      (await element.findByTestId('accordion-toggle')).click();
    });

    expect(element.queryByTestId('accordion-content')).not.toBeNull();
  });
});
