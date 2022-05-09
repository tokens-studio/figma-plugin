import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Stack from '@/app/components/Stack';

export default {
  title: 'Stack',
  component: Stack,
  argTypes: {
  },
} as ComponentMeta<typeof Stack>;

const Template: ComponentStory<typeof Stack> = (args) => (
  <Stack {...args}>
    333
  </Stack>
);

export const Primary = Template.bind({});
Primary.args = {
  direction: 'row',

};
