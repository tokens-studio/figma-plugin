import { MotionConfig } from 'framer-motion';
import React from 'react';
import { act, render } from '../../../../../tests/config/setupTest';
import Box from '../../Box';
import { ThemeStyleManagementCategory } from '../ThemeStyleManagementCategory';

describe('ThemeStyleManagementCategory', () => {
  it('should work', async () => {
    const mockAttachLocalStyles = jest.fn();
    const mockDisconnectStyle = jest.fn();

    const result = render(
      <MotionConfig reducedMotion="always">
        <ThemeStyleManagementCategory
          label="Typography"
          styles={{
            'typography/body/regular': {
              id: 'S:1234',
              failedToResolve: true,
            },
            'typography/body/bold': {
              id: 'S:1235',
              name: 'body/bold',
            },
            'typography/body/light': {
              id: 'S:1235',
              failedToResolve: false,
            },
          }}
          icon={(
            <Box data-testid="icon" />
          )}
          onAttachLocalStyles={mockAttachLocalStyles}
          onDisconnectStyle={mockDisconnectStyle}
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

    const attachLocalStyles = await result.findByText('Attach local styles');
    attachLocalStyles.click();
    expect(mockAttachLocalStyles).toBeCalledTimes(1);

    const unlinkButton = await result.findAllByTestId('themestylemanagementcategorystyleentry-unlink');
    unlinkButton[0].click();
    expect(mockDisconnectStyle).toBeCalledTimes(1);
  });
});
