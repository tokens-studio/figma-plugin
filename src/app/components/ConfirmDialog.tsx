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
import Stack from './Stack';

const ChoiceCheckbox: React.FC<{
  checked?: boolean
  choice: { key: string; unique?: boolean; enabled?: boolean }
  onCheckedChange: (key: string, unique?: boolean) => void
}> = ({
  checked,
  choice,
  onCheckedChange,
}) => {
  const handleCheckedChange = React.useCallback(() => {
    onCheckedChange(choice.key, choice.unique);
  }, [choice, onCheckedChange]);

  return (
    <Checkbox
      checked={!!checked}
      defaultChecked={choice.enabled}
      id={choice.key}
      onCheckedChange={handleCheckedChange}
    />
  );
};

function ConfirmDialog() {
  const confirmButton = React.useRef<HTMLButtonElement | null>(null);
  const firstInput = React.useRef<HTMLInputElement | null>(null);
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

      return () => {};
    },
    [chosen],
  );

  const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  }, []);

  const handleConfirm = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmState.input) {
      onConfirm(inputValue);
    } else {
      onConfirm(chosen);
    }
  }, [chosen, inputValue, confirmState, onConfirm]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (confirmState.choices) setChosen(confirmState.choices.filter((c) => c.enabled).map((c) => c.key));
      if (firstInput.current) {
        firstInput.current.focus();
      } else if (confirmButton.current) {
        confirmButton.current.focus();
      }
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [confirmState.show, confirmButton, confirmState.choices]);

  return confirmState.show ? (
    <Modal isOpen close={onCancel}>
      <form onSubmit={handleConfirm}>
        <Stack direction="column" justify="start" gap={4}>
          <Stack direction="column" gap={4}>
            <Stack direction="column" gap={2}>
              <Heading size="small">{confirmState?.text && confirmState.text}</Heading>
              {confirmState?.description && (
              <Text muted>{confirmState.description}</Text>
              )}
            </Stack>
            {confirmState?.input && (
            <Stack direction="column" gap={2}>
              <Input
                id="input"
                type={confirmState.input.type}
                value={inputValue}
                onChange={handleInputChange}
                inputRef={firstInput}
                full
                required
              />
            </Stack>
            )}
            {confirmState?.choices && (
            <Stack direction="column" align="start" gap={2}>
              {confirmState.choices.map((choice) => (
                <Box
                  css={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
                  key={choice.key}
                >
                  <ChoiceCheckbox
                    checked={chosen.includes(choice.key)}
                    choice={choice}
                    onCheckedChange={toggleChosen}
                  />
                  <Label css={{ paddingLeft: '$3' }} htmlFor={choice.key}>
                    {choice.label}
                  </Label>
                </Box>
              ))}
            </Stack>
            )}
          </Stack>
          <Stack direction="row" gap={3} justify="between">
            <Button variant="secondary" onClick={onCancel}>
              {confirmState?.cancelAction}
            </Button>
            <Button type="submit" variant="primary" buttonRef={confirmButton}>
              {confirmState?.confirmAction}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  ) : null;
}
export default ConfirmDialog;
