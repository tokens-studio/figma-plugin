import React from 'react';
import Text from '@/app/components/Text';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Text',
  component: Text,
  argTypes: {
  },
  args:{
    size: 'small',
    bold: true,
    children: '333',
    muted: false,
  }
} as ComponentMeta<typeof Text>;

const Template: ComponentStory<typeof Text> = (args) => 
{
  return (
    <Text {...args}>
      This is the Story of the Figma Token Plugin
    </Text>
  )
}

export const Primary = Template.bind({});
Primary.args = {
  bold: true,
  size: 'small',
  placeholder : 'Storybook',
}
