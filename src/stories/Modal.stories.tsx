import React, {useState} from 'react';
import Modal from '@/app/components/Modal';
import { ModalFooter } from '@/app/components/Modal/ModalFooter';
import ReactModal, { Styles as ReactModalStyles } from 'react-modal';

import { ComponentStory, ComponentMeta } from '@storybook/react';

export default {
  title: 'Modal',
  component: Modal,
  argTypes: {
    title: {controls: 'Modal Story'}
  },
  args:{
    // isOpen: true,
    // title: 'Modal Story',
  }
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  const handleModalOpen = React.useCallback(() => {
    setIsModalOpen(true);
  }, [isModalOpen]);
  const handleModalClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, [isModalOpen]);

  return (
    <div>
      <button onClick={handleModalOpen}></button>
      <Modal title='Primary Modal' isOpen={isModalOpen} close={handleModalClose}>
      </Modal>
    </div>
  )
};

export const Primary = Template.bind({});
Primary.args = {
  title: 'Primary',
  full: false,
  large: false,
  isOpen: true,
  footer: ModalFooter,
  showClose: true,
  compact: false,
}