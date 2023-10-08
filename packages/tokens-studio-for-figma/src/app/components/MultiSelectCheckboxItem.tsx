import React from 'react';
import {
  CheckIcon,
} from '@radix-ui/react-icons';
import Box from './Box';
import {
  DropdownMenuItemIndicator,
  DropdownMenuCheckboxItem,
} from './DropdownMenu';

type Props = {
  item: string;
  isSelected: boolean;
  onItemSelected: (selectedItem: string) => void;
};

export const MultiSelectCheckboxItem: React.FunctionComponent<Props> = ({
  item,
  isSelected,
  onItemSelected,
}) => {
  const handleSelect = React.useCallback(() => {
    onItemSelected(item);
  }, [item, onItemSelected]);

  return (
    <DropdownMenuCheckboxItem
      checked={isSelected}
      onSelect={handleSelect}
      css={{ display: 'flex', padding: '$3 0' }}
    >
      <Box css={{ width: '$5' }}>
        <DropdownMenuItemIndicator css={{ position: 'inherit' }}>
          <CheckIcon />
        </DropdownMenuItemIndicator>
      </Box>
      <Box>
        {item}
      </Box>
    </DropdownMenuCheckboxItem>
  );
};
