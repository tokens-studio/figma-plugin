import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Input from '@/app/components/Input';

export default {
  title: 'Input',
  component: Input,
  argTypes: {
  },
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (args) => (
  <Input {...args} />
);

export const Primary = Template.bind({});
Primary.args = {
  placeholder: 'Storybook',
};
