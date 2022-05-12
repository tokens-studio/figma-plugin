import React from 'react';
import { Provider } from 'react-redux';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import TokenGroupHeading from '@/app/components/TokenGroupHeading';
import { store } from '@/app/store';

export default {
  title: 'TokenGroupHeading',
  component: TokenGroupHeading,
  argTypes: {
  },
  args: {
    path: '333.333',
  },
} as ComponentMeta<typeof TokenGroupHeading>;

const Template: ComponentStory<typeof TokenGroupHeading> = (args) => (
  <Provider store={store}>
    <TokenGroupHeading {...args} />
  </Provider>
);

export const Primary = Template.bind({});
Primary.args = {
  label: 'TokenGroup',
  path: '333',
};
