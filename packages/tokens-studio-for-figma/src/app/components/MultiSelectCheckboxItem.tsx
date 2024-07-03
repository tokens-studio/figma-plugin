import React from 'react';
import { Check } from 'iconoir-react';
import { DropdownMenu } from '@tokens-studio/ui';
import Box from './Box';

type Props = {
  item: string;
  isSelected: boolean;
  onItemSelected: (selectedItem: string) => void;
};

export const MultiSelectCheckboxItem: React.FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
  item,
  isSelected,
  onItemSelected,
}) => {
  const handleSelect = React.useCallback(() => {
    onItemSelected(item);
  }, [item, onItemSelected]);

  return (
    <DropdownMenu.CheckboxItem
      checked={isSelected}
      onSelect={handleSelect}
      css={{ display: 'flex', padding: '$3 0' }}
    >
      <Box css={{ width: '$5' }}>
        <DropdownMenu.ItemIndicator css={{ position: 'inherit' }}>
          <Check />
        </DropdownMenu.ItemIndicator>
      </Box>
      <Box>
        {item}
      </Box>
    </DropdownMenu.CheckboxItem>
  );
};
