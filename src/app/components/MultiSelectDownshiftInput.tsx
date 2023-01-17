import React from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { useUIDSeed } from 'react-uid';
import { XIcon } from '@primer/octicons-react';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
import { StyledDropdown, StyledItem, StyledItemName } from './DownshiftInput/DownshiftInput';
import Box from './Box';
import { StyledInput } from './Input';
import { StyledButton } from './Button/StyledButton';

const SelectedItem: React.FC<{
  children: React.ReactNode;
  onClick: (selectedItem: string) => void;
  selectedItem: string
}> = ({ children, onClick, selectedItem }) => {
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick(selectedItem);
  }, [onClick, selectedItem]);

  return (
    <StyledButton variant="secondary" onClick={handleClick}>
      {children}
    </StyledButton>
  );
};

type Props = {
  menuItems: string[];
  setSelectedMenuItems: (selectedItems: string[]) => void
};

export const MultiSelectDownshiftInput: React.FunctionComponent<Props> = ({
  menuItems,
  setSelectedMenuItems,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const seed = useUIDSeed();

  React.useEffect(() => {
    setSelectedMenuItems(selectedItems);
  }, [selectedItems]);

  const getFilteredBooks = React.useCallback((selectedItems: string[], inputValue: string) => {
    const lowerCasedInputValue = inputValue.toLowerCase();

    return menuItems.filter((menuItem) => (
      !selectedItems.includes(menuItem)
        && (menuItem.toLowerCase().includes(lowerCasedInputValue))
    ));
  }, [menuItems]);

  const filteredItems = React.useMemo(
    () => getFilteredBooks(selectedItems, inputValue),
    [selectedItems, inputValue, getFilteredBooks],
  );

  const {
    getSelectedItemProps,
    getDropdownProps,
    removeSelectedItem,
  } = useMultipleSelection({
    selectedItems,
    onStateChange({ selectedItems: newSelectedItems, type }) {
      switch (type) {
        case useMultipleSelection.stateChangeTypes
          .SelectedItemKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
        case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          if (newSelectedItems) setSelectedItems(newSelectedItems);
          break;
        default:
          break;
      }
    },
  });

  const {
    isOpen,
    getToggleButtonProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: filteredItems,
    selectedItem: null,
    stateReducer(state, actionAndChanges) {
      const { changes, type } = actionAndChanges;

      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          return {
            ...changes,
            ...(changes.selectedItem && { isOpen: true, highlightedIndex: 0 }),
          };
        default:
          return changes;
      }
    },
    onStateChange({
      inputValue: newInputValue,
      type,
      selectedItem: newSelectedItem,
    }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (newSelectedItem) setSelectedItems([...selectedItems, newSelectedItem]);
          break;

        case useCombobox.stateChangeTypes.InputChange:
          if (newInputValue) setInputValue(newInputValue);
          break;
        default:
          break;
      }
    },
  });

  const handleRemoveSelectedItem = React.useCallback((selectedItemForRender: string) => {
    removeSelectedItem(selectedItemForRender);
  }, [removeSelectedItem]);

  return (
    <Box css={{ position: 'relative' }}>
      <Box css={{
        background: '$bgDefault', display: 'inline-flex', flexWrap: 'wrap', gap: '$3', padding: '$3', border: '1px solid $borderMuted',
      }}
      >
        {selectedItems.map((
          selectedItemForRender,
          index,
        ) => (
          <Box
            css={{
              background: '$bgSubtle', display: 'flex', alignItems: 'center', paddingLeft: '$3', gap: '$4',
            }}
            {...getSelectedItemProps({
              selectedItem: selectedItemForRender,
              index,
            })}
          >
            {selectedItemForRender}
            <SelectedItem
              onClick={handleRemoveSelectedItem}
              selectedItem={selectedItemForRender}
            >
              <XIcon />
            </SelectedItem>
          </Box>
        ))}
        <Box
          css={{
            display: 'flex', position: 'relative', width: '100%', flexGrow: 1,
          }}
          className="input"
        >
          <StyledInput
            placeholder="Best book ever"
            {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          />
          <StyledInputSuffix
            type="button"
            data-testid="downshift-input-suffix-button"
            {...getToggleButtonProps()}
          >
            <StyledIconDisclosure />
          </StyledInputSuffix>
        </Box>
      </Box>

      <StyledDropdown
        className="content scroll-container"
        {...getMenuProps()}
      >
        {isOpen
          && filteredItems.map((filteredItem, index) => (
            <StyledItem
              key={seed(index)}
              data-cy="downshift-input-item"
              data-testid="downshift-input-item"
              className="dropdown-item"
              {...getItemProps({ item: filteredItem, index })}
              css={{
                backgroundColor: highlightedIndex === index ? '$interaction' : '$bgDefault',
              }}
              isFocused={highlightedIndex === index}
            >
              <StyledItemName>{filteredItem}</StyledItemName>
            </StyledItem>
          ))}

      </StyledDropdown>
    </Box>
  );
};
