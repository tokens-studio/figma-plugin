import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Heading from '@/app/components/Heading';

export default {
  title: 'Heading',
  component: Heading,
  argTypes: {
  },
} as ComponentMeta<typeof Heading>;

const Template: ComponentStory<typeof Heading> = (args) => (
  <Heading {...args}>
    Story
  </Heading>
);

export const Primary = Template.bind({});
Primary.args = {
  size: 'small',
};
