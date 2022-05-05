import React from 'react';
import Text from '@/app/components/Text';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Text',
  component: Text,
  argTypes: {
  },
} as ComponentMeta<typeof Text>;

const Template: ComponentStory<typeof Text> = (args) => <Text { ...args } />;

export const Primary = Template.bind({});
Primary.args = {
  placeholder : 'Storybook',
}
