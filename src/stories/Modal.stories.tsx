import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Modal from '@/app/components/Modal';
import { ModalFooter } from '@/app/components/Modal/ModalFooter';

export default {
  title: 'Modal',
  component: Modal,
  argTypes: {
    title: { controls: 'Modal Story' },
  },
  args: {
    title: 'Primary',
    full: false,
    large: false,
    isOpen: true,
    footer: ModalFooter,
    showClose: true,
    compact: false,
  },
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = () => {
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const handleModalOpen = React.useCallback(() => {
    setIsModalOpen(true);
  }, [isModalOpen]);
  const handleModalClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, [isModalOpen]);
  return (
    <div>
      <button onClick={handleModalOpen}>Click Here to Open Modal</button>
      <Modal title="Primary" full={false} large={false} isOpen={isModalOpen} close={handleModalClose} />
    </div>
  );
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
};
