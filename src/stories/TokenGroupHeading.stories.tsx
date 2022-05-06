import React from 'react';
import TokenGroupHeading from '@/app/components/TokenGroupHeading';
import {Provider} from 'react-redux';
import {store} from '@/app/store';

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
      <Provider store={store}>
        <TokenGroupHeading {...args}>
        </TokenGroupHeading>
      </Provider>
  )
};

export const Primary = Template.bind({});
Primary.args = {
  label: 'TokenGroup',
  path: '333',
}