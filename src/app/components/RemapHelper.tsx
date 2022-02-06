import React from 'react';
import useTokens from '../store/useTokens';
import Button from './Button';
import Heading from './Heading';
import Text from './Text';
import Input from './Input';
import Modal from './Modal';

export default function RemapHelper() {
  const [open, setOpen] = React.useState(false);
  const initialData = { oldName: '', newName: '' };
  const [formData, setFormData] = React.useState(initialData);
  const { remapToken } = useTokens();

  function handleClose() {
    setOpen(false);
    setFormData(initialData);
  }

  function handleSubmit() {
    remapToken(formData.oldName, formData.newName);
    console.log('SUBMITTED');
    handleClose();
  }

  const firstInput: React.RefObject<HTMLInputElement> = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      firstInput.current?.focus();
    }, 50);
  }, [open]);

  return (
    <div>
      <Button
        type="button"
        size="small"
        variant="ghost"
        onClick={() => setOpen(true)}
      >
        Remap tokens
      </Button>
      <Modal isOpen={open} close={() => setOpen(false)}>
        <div className="flex flex-col justify-center space-y-4 text-center">
          <Heading>
            Remap tokens
          </Heading>
          <Text>Change all occurences of tokens across selection/page/document.</Text>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              full
              value={formData.oldName}
              onChange={(e) => setFormData({ ...formData, oldName: e.target.value })}
              type="text"
              label="Old name"
              name="oldName"
              inputRef={firstInput}
              placeholder="Old name"
              required
            />
            <Input
              full
              value={formData.newName}
              onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
              type="text"
              label="New name"
              name="newName"
              placeholder="New name"
              required
            />
            <div className="space-x-4">
              <Button variant="secondary" size="large" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="large">
                Change
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
