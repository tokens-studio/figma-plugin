import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { useUIDSeed } from 'react-uid';
import { useTranslation } from 'react-i18next';
import { Search, Xmark } from 'iconoir-react';
import {
  Box, Button, Checkbox, IconButton, Label, Text, TextInput,
} from '@tokens-studio/ui';
import { SearchableMultiSelectItem } from './SearchableMultiSelectItem';

export type SearchableMultiSelectProps = {
  menuItems: string[];
  selectedItems: string[];
  handleSelectedItemChange: (selectedItems: string[]) => void;
  /** Placeholder of the search field, defaults to a generic "Search" */
  searchPlaceholder?: string;
  /** Label of the trigger when nothing is selected, defaults to "None selected" */
  emptyLabel?: string;
  'data-testid'?: string;
};

/**
 * A dropdown that lets you select multiple items at once. Unlike a regular dropdown
 * menu it stays open while you tick items, and it filters the list through a search
 * field at the top, which keeps it usable for long lists such as token sets.
 */
export const SearchableMultiSelect: React.FunctionComponent<React.PropsWithChildren<SearchableMultiSelectProps>> = ({
  menuItems,
  selectedItems,
  handleSelectedItemChange,
  searchPlaceholder,
  emptyLabel,
  'data-testid': dataTestId = 'searchable-multi-select',
}) => {
  const seed = useUIDSeed();
  const { t } = useTranslation(['general']);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return menuItems;
    }
    return menuItems.filter((item) => item.toLowerCase().includes(term));
  }, [menuItems, searchTerm]);

  const toggleAllState = React.useMemo<boolean | 'indeterminate'>(() => {
    if (filteredItems.length === 0) {
      return false;
    }
    if (filteredItems.every((item) => selectedItems.includes(item))) {
      return true;
    }
    if (filteredItems.some((item) => selectedItems.includes(item))) {
      return 'indeterminate';
    }
    return false;
  }, [filteredItems, selectedItems]);

  const triggerLabel = React.useMemo(() => {
    if (selectedItems.length === 0) {
      return emptyLabel ?? t('multiSelect.noneSelected');
    }
    if (selectedItems.length === 1) {
      return selectedItems[0];
    }
    if (menuItems.length > 0 && selectedItems.length === menuItems.length) {
      return t('multiSelect.allSelected', { number: menuItems.length });
    }
    return t('multiSelect.itemsSelected', { number: selectedItems.length });
  }, [selectedItems, menuItems, emptyLabel, t]);

  const handleItemSelected = React.useCallback((item: string) => {
    if (selectedItems.includes(item)) {
      handleSelectedItemChange(selectedItems.filter((selectedItem) => selectedItem !== item));
    } else {
      handleSelectedItemChange([...selectedItems, item]);
    }
  }, [selectedItems, handleSelectedItemChange]);

  // Toggles every item that is currently visible, so it acts on the search results when filtering
  const handleToggleAll = React.useCallback(() => {
    if (filteredItems.length === 0) {
      return;
    }
    if (filteredItems.every((item) => selectedItems.includes(item))) {
      handleSelectedItemChange(selectedItems.filter((item) => !filteredItems.includes(item)));
    } else {
      handleSelectedItemChange([...selectedItems, ...filteredItems.filter((item) => !selectedItems.includes(item))]);
    }
  }, [filteredItems, selectedItems, handleSelectedItemChange]);

  const handleSearchTermChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleClearSearchTerm = React.useCallback(() => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm('');
    }
  }, []);

  // Focus the search field instead of the panel itself, so you can start typing right away
  const handleOpenAutoFocus = React.useCallback((event: Event) => {
    event.preventDefault();
    searchInputRef.current?.focus();
  }, []);

  return (
    <Popover.Root modal open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          asDropdown
          data-testid={`${dataTestId}-trigger`}
          title={selectedItems.join(', ')}
          css={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Box css={{
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
          >
            {triggerLabel}
          </Box>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={handleOpenAutoFocus}
          style={{ zIndex: 30, width: 'var(--radix-popover-trigger-width)', minWidth: '200px' }}
        >
          <Box
            data-testid={`${dataTestId}-content`}
            css={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: 'var(--radix-popover-content-available-height)',
              backgroundColor: '$bgCanvas',
              border: '1px solid $borderSubtle',
              borderRadius: '$medium',
              boxShadow: '$contextMenu',
            }}
          >
            <Box css={{ padding: '$3', borderBottom: '1px solid $borderSubtle' }}>
              <TextInput
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchTermChange}
                placeholder={searchPlaceholder ?? (t('multiSelect.search') as string)}
                leadingVisual={<Search />}
                data-testid={`${dataTestId}-search`}
                css={{ width: '100%' }}
                trailingAction={searchTerm ? (
                  <IconButton
                    icon={<Xmark />}
                    size="small"
                    variant="invisible"
                    onClick={handleClearSearchTerm}
                    tooltip={t('multiSelect.clearSearch') as string}
                    data-testid={`${dataTestId}-clear-search`}
                  />
                ) : undefined}
              />
            </Box>
            {filteredItems.length > 0 && (
              <Box css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '$3',
                padding: '$2 $3',
                borderBottom: '1px solid $borderSubtle',
              }}
              >
                <Box css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
                  <Checkbox
                    id={seed('toggle-all')}
                    checked={toggleAllState}
                    onCheckedChange={handleToggleAll}
                    data-testid={`${dataTestId}-toggle-all`}
                  />
                  <Label
                    htmlFor={seed('toggle-all')}
                    css={{ cursor: 'pointer', fontWeight: '$sansRegular', fontSize: '$xsmall' }}
                  >
                    {t('multiSelect.selectAll')}
                  </Label>
                </Box>
                <Text muted size="xsmall">{`${selectedItems.length}/${menuItems.length}`}</Text>
              </Box>
            )}
            <Box
              className="scroll-container"
              css={{
                flexGrow: 1, minHeight: 0, maxHeight: 'clamp(120px, 30vh, 300px)', overflowY: 'auto', padding: '$2',
              }}
            >
              {filteredItems.map((item) => (
                <SearchableMultiSelectItem
                  key={item}
                  id={seed(item)}
                  item={item}
                  isSelected={selectedItems.includes(item)}
                  testIdPrefix={dataTestId}
                  onItemSelected={handleItemSelected}
                />
              ))}
              {filteredItems.length === 0 && (
                <Box css={{ padding: '$3', textAlign: 'center' }} data-testid={`${dataTestId}-no-results`}>
                  <Text muted size="small">{t('multiSelect.noResults')}</Text>
                </Box>
              )}
            </Box>
          </Box>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
