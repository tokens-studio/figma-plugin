import React, { useCallback, useRef, useEffect } from 'react';
import { IconButton, TextInput } from '@tokens-studio/ui';
import { Search, Xmark } from 'iconoir-react';
import { useTranslation } from 'react-i18next';

interface SearchInputWithToggleProps {
  isSearchActive: boolean;
  searchTerm: string;
  onToggleSearch: () => void;
  onSearchTermChange: (term: string) => void;
  placeholder?: string;
  tooltip?: string;
  autofocus?: boolean;
}

export const SearchInputWithToggle: React.FC<SearchInputWithToggleProps> = ({
  isSearchActive,
  searchTerm,
  onToggleSearch,
  onSearchTermChange,
  placeholder = '',
  tooltip = '',
  autofocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(['tokens']);

  const handleClearClick = useCallback(() => {
    onSearchTermChange('');
    onToggleSearch();
  }, [onSearchTermChange, onToggleSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  }, [onSearchTermChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onToggleSearch();
    }
  }, [onToggleSearch]);

  useEffect(() => {
    if (autofocus && isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive, autofocus]);

  if (isSearchActive) {
    return (
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        data-testid="search-input-with-toggle-input"
        trailingAction={(
          <IconButton
            icon={<Xmark />}
            size="small"
            variant="invisible"
            onClick={handleClearClick}
            tooltip={t('clearSearch')}
            data-testid="search-input-with-toggle-clear"
          />
        )}
      />
    );
  }

  return (
    <IconButton
      icon={<Search />}
      variant="invisible"
      onClick={onToggleSearch}
      tooltip={tooltip}
      data-testid="search-input-with-toggle-button"
    />
  );
};
