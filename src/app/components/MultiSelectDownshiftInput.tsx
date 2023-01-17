import React from 'react';
import { useCombobox, useMultipleSelection } from 'downshift';
import { useUIDSeed } from 'react-uid';
import { StyledIconDisclosure, StyledInputSuffix } from './StyledInputSuffix';
import { StyledDropdown, StyledItem, StyledItemName } from './DownshiftInput/DownshiftInput';
import Box from './Box';
import { StyledDownshiftInput } from './DownshiftInput/StyledDownshiftInput';
import { StyledInput } from './Input';

type Book = {
  author: string;
  title: string;
};

const books = [
  { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { author: 'Lev Tolstoy', title: 'War and Peace' },
  { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
  { author: 'Oscar Wilde', title: 'A Picture of Dorian Gray' },
  { author: 'George Orwell', title: '1984' },
  { author: 'Jane Austen', title: 'Pride and Prejudice' },
  { author: 'Marcus Aurelius', title: 'Meditations' },
  { author: 'Fyodor Dostoevsky', title: 'The Brothers Karamazov' },
  { author: 'Lev Tolstoy', title: 'Anna Karenina' },
  { author: 'Fyodor Dostoevsky', title: 'Crime and Punishment' },
];
const initialSelectedItems = [books[0], books[1]];

export const MultiSelectDownshiftInput: React.FunctionComponent = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectedItems, setSelectedItems] = React.useState<Book[]>(initialSelectedItems);
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);
  const seed = useUIDSeed();

  const getFilteredBooks = React.useCallback((selectedItems: Book[], inputValue: string) => {
    const lowerCasedInputValue = inputValue.toLowerCase();

    return books.filter((book) => (
      !selectedItems.includes(book)
        && (book.title.toLowerCase().includes(lowerCasedInputValue)
          || book.author.toLowerCase().includes(lowerCasedInputValue))
    ));
  }, []);

  const items = React.useMemo(
    () => getFilteredBooks(selectedItems, inputValue),
    [selectedItems, inputValue, getFilteredBooks],
  );

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
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
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.title : '';
    },
    defaultHighlightedIndex: 0, // after selection, highlight the first item.
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
          if (newSelectedItem) {
            setSelectedItems([...selectedItems, newSelectedItem]);
          }
          break;

        case useCombobox.stateChangeTypes.InputChange:
          if (newInputValue) {
            setInputValue(newInputValue);
          }
          break;
        default:
          break;
      }
    },
  });

  const handleAutoSuggest = React.useCallback(() => {
    setShowAutoSuggest(!showAutoSuggest);
  }, [showAutoSuggest]);

  return (
    <div className="w-[592px]">
      <div className="flex flex-col gap-1">
        <div className="shadow-sm bg-white inline-flex gap-2 items-center flex-wrap p-1.5">
          {selectedItems.map((
            selectedItemForRender,
            index,
          ) => (
            <span
              className="bg-gray-100 rounded-md px-1 focus:bg-red-400"
              {...getSelectedItemProps({
                selectedItem: selectedItemForRender,
                index,
              })}
            >
              {selectedItemForRender.title}
              <span
                className="px-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(selectedItemForRender);
                }}
              >
                &#10005;
              </span>
            </span>
          ))}
          {/* <div className="flex gap-0.5 grow">
            <input
              placeholder="Best book ever"
              className="w-full"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            />
            <button
              aria-label="toggle menu"
              className="px-2"
              type="button"
              {...getToggleButtonProps()}
            >
              &#8595;
            </button>
          </div> */}
          <Box css={{ display: 'flex', position: 'relative' }} className="input">
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
        </div>
      </div>

      <StyledDropdown
        className="content scroll-container"
        {...getMenuProps()}
      >
        {isOpen
          && items.map((item, index) => (
            <StyledItem
              data-cy="downshift-input-item"
              data-testid="downshift-input-item"
              className="dropdown-item"
              {...getItemProps({ item, index })}
              css={{
                backgroundColor: highlightedIndex === index ? '$interaction' : '$bgDefault',
              }}
              isFocused={highlightedIndex === index}
            >
              <StyledItemName>{item.title}</StyledItemName>
            </StyledItem>
          ))}

      </StyledDropdown>
    </div>
  );
};
