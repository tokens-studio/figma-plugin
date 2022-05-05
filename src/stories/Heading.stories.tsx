import React from 'react';
import Heading from '@/app/components/Heading';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Heading',
  component: Heading,
  argTypes: {
  },
} as ComponentMeta<typeof Heading>;

const Template: ComponentStory<typeof Heading> = (args) => <Heading { ...args } />;

export const Primary = Template.bind({});
Primary.args = {
  size : 'small',
}