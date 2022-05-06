import React from 'react';
import Input from '@/app/components/Input';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Input',
  component: Input,
  argTypes: {
  },
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => {
  return (
    <Input { ...args } />
  )
}

export const Primary = Template.bind({});
Primary.args = {
  placeholder : 'Storybook',
}
