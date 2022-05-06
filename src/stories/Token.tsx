import React from 'react';
import Tokens from '@/app/components/Tokens';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Token',
  component: Tokens,
  argTypes: {
  },
} as ComponentMeta<typeof Tokens>;

const Template: ComponentStory<typeof Tokens> = (args) => <Tokens { ...args } />;

export const Primary = Template.bind({});
Primary.args = {
  isActive : true,
}