import { MotionConfig } from 'framer-motion';
import React from 'react';
import { act, render } from '../../../../../tests/config/setupTest';
import Box from '../../Box';
import { ThemeStyleManagementCategory } from '../ThemeStyleManagementCategory';

describe('ThemeStyleManagementCategory', () => {
  it('should work', async () => {
    const result = render(
      <MotionConfig reducedMotion="always">
        <ThemeStyleManagementCategory
          label="Typography"
          styles={{
            'typography/body/regular': {
              id: 'S:1234',
            },
            'typography/body/bold': {
              id: 'S:1235',
              name: 'body/bold',
            },
          }}
          icon={(
            <Box data-testid="icon" />
          )}
        />
      </MotionConfig>,
    );

    expect(result.queryByTestId('themestylemanagementcategory-accordion-typography')).not.toBeUndefined();
    expect(result.queryByTestId('icon')).not.toBeUndefined();

    const toggle = await result.findByTestId('accordion-toggle');
    act(() => {
      toggle.click();
    });

    expect(result.queryByText('typography/body/regular')).not.toBeUndefined();
    expect(result.queryByText('typography/body/bold')).not.toBeUndefined();
    expect(result.queryByText('body/bold')).not.toBeUndefined();
  });
});
