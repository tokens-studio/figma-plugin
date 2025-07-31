import React from 'react';
import { useUIDSeed } from 'react-uid';
import { DropdownMenu, Button } from '@tokens-studio/ui';

import { MultiSelectCheckboxItem } from './MultiSelectCheckboxItem';

type Props = {
  menuItems: string[];
  selectedItems: string[]
  handleSelectedItemChange: (selectedItems: string[]) => void
};

export const MultiSelectDropdown: React.FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<Props>>> = ({
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
      <DropdownMenu.Trigger asChild>
        <Button asDropdown>
          {selectedItemsString}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content side="bottom" className="content scroll-container" css={{ maxHeight: 'clamp(100px, 30vh, 500px)' }}>
          {
          menuItems.map((menuItem, index) => <MultiSelectCheckboxItem key={`multi_checkbox_${seed(index)}`} item={menuItem} isSelected={selectedItems.includes(menuItem)} onItemSelected={handleSelectedItem} />)
        }
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu>
  );
};
