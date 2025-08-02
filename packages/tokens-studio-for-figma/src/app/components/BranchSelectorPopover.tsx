import React, { useRef, useEffect } from 'react';
import { useUIDSeed } from 'react-uid';
import {
  Box, Text, Button,
  IconButton,
  TextInput,
  Heading,
} from '@tokens-studio/ui';
import * as Popover from '@radix-ui/react-popover';
import Downshift from 'downshift';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import { useTranslation } from 'react-i18next';
import ProBadge from './ProBadge';
import { useIsProUser } from '../hooks/useIsProUser';
import { useChangedState } from '@/hooks/useChangedState';

type PopoverMode = 'switch' | 'create';

interface BranchSelectorPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  branches: string[];
  onBranchSelected: (branch: string) => void;
  onCreateBranchFromSelected: (branch: string) => void;
  onCreateBranchFromCurrentChanges: () => void;
  currentBranch: string;
}

export const BranchSelectorPopover: React.FC<BranchSelectorPopoverProps> = ({
  isOpen,
  onOpenChange,
  branches,
  onBranchSelected,
  onCreateBranchFromSelected,
  currentBranch,
  onCreateBranchFromCurrentChanges,
}) => {
  const seed = useUIDSeed();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = React.useState<PopoverMode>('switch');
  const [searchValue, setSearchValue] = React.useState('');
  const isProUser = useIsProUser();
  const { hasChanges } = useChangedState();
  const { t } = useTranslation(['branch']);

  // Auto-focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, mode]);

  // On close reset mode to switch to always start with switch mode
  useEffect(() => {
    if (!isOpen) {
      setMode('switch');
    }
  }, [isOpen]);

  // Filter branches based on search query
  const filteredBranches = React.useMemo(() => {
    if (!searchValue.trim()) {
      return branches;
    }
    return branches.filter((branch) => branch.toLowerCase().includes(searchValue.toLowerCase()));
  }, [branches, searchValue]);

  const handleSetMode = React.useCallback((newMode: PopoverMode) => {
    setMode(newMode);
    setSearchValue('');
  }, []);

  const handleCreateButtonClick = React.useCallback(() => {
    handleSetMode('create');
  }, [handleSetMode]);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleBackButtonClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    handleSetMode('switch');
  }, [handleSetMode]);

  const getTitle = () => ((mode === 'switch') ? 'Switch branch' : 'Create branch from');

  // Prepare items based on current mode
  const items = React.useMemo(() => {
    const returnedItems: Array<{
      id: string;
      label: string;
      isSelected: boolean;
      onClick?: (() => void) | (() => Promise<void>);
      isCurrentChanges?: boolean;
    }> = filteredBranches.map((branch) => ({
      id: branch,
      label: branch,
      isSelected: currentBranch === branch,
      onClick: () => (mode === 'switch' ? onBranchSelected(branch) : onCreateBranchFromSelected(branch)),
    }));

    if (hasChanges && mode === 'create') {
      returnedItems.push({
        id: 'TOKENS_STUDIO_CURRENT_CHANGES',
        label: t('currentChanges') || 'Current changes',
        isSelected: false,
        onClick: onCreateBranchFromCurrentChanges,
        isCurrentChanges: true,
      });
    }

    return returnedItems;
  }, [filteredBranches, hasChanges, mode, currentBranch, onBranchSelected, onCreateBranchFromSelected, t, onCreateBranchFromCurrentChanges]);

  const handleDownshiftSelect = React.useCallback((selectedItem: any) => {
    if (!isProUser) {
      return;
    }
    if (!selectedItem) {
      onOpenChange(false);
      return;
    }

    if (selectedItem.isCurrentChanges) {
      onCreateBranchFromCurrentChanges();
      return;
    }
    if (mode === 'switch') {
      onBranchSelected(selectedItem.id);
    }
    if (mode === 'create') {
      onCreateBranchFromSelected(selectedItem.id);
    }
  }, [isProUser, mode, onOpenChange, onCreateBranchFromCurrentChanges, onBranchSelected, onCreateBranchFromSelected]);

  const handleItemToString = React.useCallback((item: any) => item?.label ?? '', []);

  return (
    <Downshift
      isOpen={isOpen}
      onSelect={handleDownshiftSelect}
      itemToString={handleItemToString}
    >
      {({ getItemProps, getInputProps, highlightedIndex }) => (
        <div style={{ position: 'relative' }}>
          <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
            <Popover.Trigger asChild>
              <Button size="small" variant="invisible" icon={<GitBranchIcon />} data-testid="branch-selector-menu-trigger">
                {currentBranch}
              </Button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                side="top"
                align="start"
                sideOffset={4}
                style={{ width: 'auto' }}
              >
                <Box
                  css={{
                    backgroundColor: '$bgCanvas',
                    border: '1px solid',
                    borderColor: '$borderSubtle',
                    borderRadius: '$medium',
                    boxShadow: '$contextMenu',
                    maxHeight: '60vh',
                    overflow: 'hidden',
                    width: '70vw',
                    minWidth: '150px',
                    position: 'relative',
                  }}
                >
                  <Box
                    css={{
                      padding: '$3 $4',
                      paddingBottom: 0,
                      background: 'var(--colors-bgCanvas)',
                      position: 'sticky',
                      zIndex: 10,
                      top: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {(mode === 'create') && (
                      <IconButton
                        onMouseDown={handleBackButtonClick}
                        icon={<ArrowLeftIcon />}
                        variant="invisible"
                        title="Go back"
                        size="small"
                        css={{ flexShrink: 0 }}
                      />
                    )}
                    <Text size="small" bold css={{ flex: 1 }}>
                      {getTitle()}
                    </Text>
                    {mode === 'switch' && (
                    <Button
                      type="button"
                      onClick={handleCreateButtonClick}
                      css={{ flexShrink: 0 }}
                      variant="invisible"
                      size="small"
                    >
                      {t('createNew')}
                    </Button>
                    )}
                  </Box>

                  <Box
                    css={{
                      padding: '$3',
                      borderBottom: '1px solid $borderSubtle',
                      background: 'var(--colors-bgCanvas)',
                      position: 'sticky',
                      zIndex: 10,
                      top: 0,
                      display: 'flex',
                      gap: '$2',
                      alignItems: 'center',
                    }}
                  >
                    <TextInput
                      ref={searchInputRef}
                      {...getInputProps()}
                      type="text"
                      placeholder={t('search')}
                      autoFocus
                      value={searchValue}
                      onChange={handleSearchChange}
                      css={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontFamily: '$mono',
                      }}
                    />
                  </Box>

                  <Box css={{ maxHeight: '50vh', overflow: 'auto' }}>
                    {/* Items List */}
                    {items.length > 0 && items.map((item, index) => {
                      const itemProps = getItemProps({ item, index });

                      return (
                        <Box
                          key={seed(index)}
                          {...itemProps}
                          data-testid={`popover-item-${item.id}`}
                          css={{
                            padding: '$3',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontFamily: '$mono',
                            gap: '$2',
                            backgroundColor: highlightedIndex === index ? 'var(--colors-bgDefault)' : 'transparent',
                            '&:hover': { backgroundColor: 'var(--colors-bgDefault)' },
                          }}
                        >
                          {item.isSelected && (
                          <Box css={{
                            width: '16px', height: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          >
                            ✓
                          </Box>
                          )}
                          {!item.isSelected && <Box css={{ width: '16px', flexShrink: 0 }} />}
                          <span>{item.label}</span>
                        </Box>
                      );
                    })}

                    {/* Empty State */}
                    {items.length === 0 && searchValue && (
                    <Box css={{ padding: '12px', textAlign: 'center', color: 'var(--colors-fgMuted)' }}>
                      {t('noBranchesFound')}
                    </Box>
                    )}

                  </Box>
                  {!isProUser && (
                  <Box
                    css={{
                      padding: '$3 $4',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      top: 0,
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '$2',
                    }}
                  >
                    <Box css={{
                      position: 'absolute', zIndex: -1, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '$bgDefault', opacity: 0.8,
                    }}
                    />
                    <Heading>{t('branchingProFeature')}</Heading>
                    <Text muted>{t('upgradeToPro')}</Text>
                    <ProBadge campaign="branch-selector" />
                  </Box>
                  )}
                </Box>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      )}
    </Downshift>
  );
};
