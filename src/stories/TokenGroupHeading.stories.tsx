import React from 'react';
import TokenGroupHeading from '@/app/components/TokenGroupHeading';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'TokenGroupHeading',
  component: TokenGroupHeading,
  argTypes: {
  },
  args:{
    path: '333.333'
  }
} as ComponentMeta<typeof TokenGroupHeading>;

const Template: ComponentStory<typeof TokenGroupHeading> = (args) => {
  return (
   <div>
        <TokenGroupHeading {...args}>
        </TokenGroupHeading>
   </div>
  )
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'TokenGroup',
  path: '333',
}