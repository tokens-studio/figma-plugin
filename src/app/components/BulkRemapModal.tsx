import React from 'react';
import { DownshiftInput } from './DownshiftInput';

interface RemapTokenModalProps {
  tokenToDisplay: Token;
  resolvedTokens: Token[];
  onCancel: () => void;
  onConfirm: (newTokenName: string) => void;
}

export const RemapTokenModal: React.FC<RemapTokenModalProps> = ({
  tokenToDisplay,
  resolvedTokens,
  onCancel,
  onConfirm,
}) => {
  const [newTokenName, setNewTokenName] = React.useState('');

  const handleChange = (value: string) => {
  setNewTokenName(value);
  };

  const handleDownShiftInputChange = (value: string) => {
  setNewTokenName(value);
  };

  const handleSubmit = (event: React.FormEventFormElement>) => {
  event.preventDefault();
  onConfirm(newTokenName);
  };

  return (
    <Modal title={Choose a new token for ${tokenToDisplay?.name || token.value}} large isOpen close={onCancel}>
    <form onSubmit={handleSubmit}>
    <Stack direction="column" gap={4}>
    <DownshiftInput
    value={newTokenName}
    type={property}
    resolvedTokens={resolvedTokens}
    handleChange={handleChange}
    setInputValue={handleDownShiftInputChange}
    placeholder="Choose a new token"
    suffix
    />
  
    <Stack direction="row" gap={4} justify="between">
    <Button variant="secondary" onClick={onCancel}>
    Cancel
    </Button>
    <Button type="submit" variant="primary">
    Remap
    </Button>
    </Stack>
    </Stack>
    </form>
    </Modal>
  
  );
};