import React from 'react';
import { useUIDSeed } from 'react-uid';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
import Box from './Box';
import { StyledInput } from './Input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './DropdownMenu';

import { MultiSelectCheckboxItem } from './MultiSelectCheckboxItem';

type Props = {
  menuItems: string[];
  selectedItems: string[]
  handleSelectedItemChange: (selectedItems: string[]) => void
};

export const MultiSelectDropdown: React.FunctionComponent<Props> = ({
  menuItems,
  selectedItems,
  handleSelectedItemChange,
}) => {
  const seed = useUIDSeed();

  const selectedItemsString = React.useMemo(() => selectedItems.join(','), [selectedItems]);

  const handleSelectedItem = React.useCallback((selectedItem: string) => {
    if (selectedItems.includes(selectedItem)) {
      const newSelectedItems = selectedItems.filter((item) => item !== selectedItem);
      handleSelectedItemChange(newSelectedItems);
    } else {
      const newSelectedItems = [...selectedItems, selectedItem];
      handleSelectedItemChange(newSelectedItems);
    }
  }, [selectedItems, handleSelectedItemChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger css={{ width: '100%', padding: '0' }}>
        <Box
          css={{
            display: 'flex', position: 'relative', width: '100%', flexGrow: 1,
          }}
          className="input"
        >
          <StyledInput placeholder="Select token sets" value={selectedItemsString} readOnly />
          <StyledInputSuffix type="button">
            <StyledIconDisclosure />
          </StyledInputSuffix>
        </Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="content content-dark scroll-container" css={{ maxHeight: '$dropdownMaxHeight' }}>
        {
          menuItems.map((menuItem, index) => <MultiSelectCheckboxItem key={`multi_checkbox_${seed(index)}`} item={menuItem} isSelected={selectedItems.includes(menuItem)} onItemSelected={handleSelectedItem} />)
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
