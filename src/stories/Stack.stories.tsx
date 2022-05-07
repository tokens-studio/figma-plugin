import React from 'react';
import Stack from '@/app/components/Stack';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Stack',
  component: Stack,
  argTypes: {
  },
} as ComponentMeta<typeof Stack>;

const Template: ComponentStory<typeof Stack> = (args) =>
{
  return (
    <Stack { ...args } >
      333
    </Stack>
  )
};

export const Primary = Template.bind({});
Primary.args = {
  direction : 'row',
  
}