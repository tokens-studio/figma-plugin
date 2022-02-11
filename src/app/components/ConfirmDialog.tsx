import React from 'react';
import useConfirm from '../hooks/useConfirm';
import Button from './Button';
import Heading from './Heading';
import Modal from './Modal';
import Box from './Box';
import Text from './Text';
import Checkbox from './Checkbox';
import Label from './Label';
import Input from './Input';

function ConfirmDialog() {
  const confirmButton = React.useRef(null);
  const firstInput = React.useRef(null);
  const { onConfirm, onCancel, confirmState } = useConfirm();
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    setInputValue('');
  }, [confirmState.show]);

  const toggleChosen = React.useCallback(
    (id: string, unique?: boolean) => {
      if (unique) {
        return setChosen([id]);
      }
      const index = chosen.indexOf(id);
      if (index === -1) {
        setChosen([...chosen, id]);
      } else {
        setChosen(chosen.filter((item) => item !== id));
      }
    },
    [chosen],
  );

  function handleConfirm() {
    if (confirmState.input) {
      onConfirm(inputValue);
    } else {
      onConfirm(chosen);
    }
  }

  React.useEffect(() => {
    setTimeout(() => {
      if (confirmState.choices) setChosen(confirmState.choices.filter((c) => c.enabled).map((c) => c.key));
      if (firstInput.current) {
        firstInput.current.focus();
      } else if (confirmButton.current) {
        confirmButton.current.focus();
      }
    }, 50);
  }, [confirmState.show, confirmButton, confirmState.choices]);

  return confirmState.show ? (
    <Modal isOpen close={onCancel}>
      <form onSubmit={handleConfirm} className="flex flex-col justify-center space-y-4 text-center">
        <Box css={{ display: 'flex', gap: '$4', flexDirection: 'column' }}>
          <Box css={{ display: 'flex', gap: '$2', flexDirection: 'column' }}>
            <Heading>{confirmState?.text && confirmState.text}</Heading>
            {confirmState?.description && (
            <Text css={{ color: '$textMuted' }}>{confirmState.description}</Text>
            )}
          </Box>
          {confirmState?.input && (
          <Box css={{ display: 'flex', gap: '$2', flexDirection: 'column' }}>
            <Input
              id="input"
              type={confirmState.input.type}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full"
              inputRef={firstInput}
              full
              required
            />
          </Box>
          )}
          {confirmState?.choices && (
            <Box css={{
              display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '$2',
            }}
            >
              {confirmState.choices.map((choice) => (
                <Box
                  css={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
                  key={choice.key}
                >
                  <Checkbox
                    checked={chosen.includes(choice.key)}
                    defaultChecked={choice.enabled}
                    id={choice.key}
                    onCheckedChange={() => toggleChosen(choice.key, choice.unique)}
                  />
                  <Label css={{ paddingLeft: '$3' }} htmlFor={choice.key}>
                    {choice.label}
                  </Label>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        <Box css={{ display: 'flex', gap: '$3', justifyContent: 'space-between' }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" buttonRef={confirmButton}>
            {confirmState?.confirmAction}
          </Button>
        </Box>
      </form>
    </Modal>
  ) : null;
}
export default ConfirmDialog;
