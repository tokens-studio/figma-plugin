import React from 'react';
import Modal from '../app/components/Modal';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Modal',
  component: Modal,
  argTypes: {
  },
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => <Modal { ...args } />;

export const Primary = Template.bind({});
Primary.args = {
  full : true,
}