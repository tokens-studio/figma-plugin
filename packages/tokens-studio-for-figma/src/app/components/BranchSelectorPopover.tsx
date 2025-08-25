import React, { useRef, useEffect, useState } from 'react';
import { useUIDSeed } from 'react-uid';
import {
  Box, Text, Button,
  IconButton,
  TextInput,
} from '@tokens-studio/ui';
import * as Popover from '@radix-ui/react-popover';
import Downshift from 'downshift';
import { ArrowLeftIcon, PlusIcon } from '@radix-ui/react-icons';
import { GitBranchIcon } from '@primer/octicons-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import { useIsProUser } from '../hooks/useIsProUser';
import { useChangedState } from '@/hooks/useChangedState';
import UpgradeToProModal from './UpgradeToProModal';
import branchingImage from '@/app/assets/hints/branchselector.png';
import { track } from '@/utils/analytics';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  // Debounced tracking for search events to reduce the number of events
  const debouncedTrackSearch = useDebouncedCallback(() => {
    if (searchValue.trim()) {
      track('Branch Selector Search', {
        totalBranches: branches.length,
      });
    }
  }, 1000); // 1 second debounce

  const handleSearchChangeWithTracking = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    debouncedTrackSearch();
  }, [debouncedTrackSearch]);

  const handleBackButtonClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    handleSetMode('switch');
  }, [handleSetMode]);

  const handleNonProUserClick = React.useCallback(() => {
    setShowUpgradeModal(true);
  }, []);

  const handleCloseUpgradeModal = React.useCallback(() => {
    setShowUpgradeModal(false);
  }, []);

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
    <>
      {/* For non-pro users, show a simple button that opens a dialog */}
      {!isProUser ? (
        <>
          <Button
            size="small"
            variant="invisible"
            icon={<GitBranchIcon />}
            onClick={handleNonProUserClick}
            data-testid="branch-selector-menu-trigger"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
            }}
          >
            {currentBranch}
          </Button>

          <UpgradeToProModal
            isOpen={showUpgradeModal}
            onClose={handleCloseUpgradeModal}
            feature="branching-feature"
            image={branchingImage}
            title={t('branchingProFeature')}
            description="You can switch branches, create new ones from current changes or any other branch, easily find branches, and collaborate seamlessly with your team. Branching enables powerful version control and team collaboration workflows."
          />
        </>
      ) : (
        /* For pro users, show the full popover functionality */
        <Downshift
          isOpen={isOpen}
          onSelect={handleDownshiftSelect}
          itemToString={handleItemToString}
        >
          {({ getItemProps, getInputProps, highlightedIndex }) => (
            <div style={{
              position: 'relative',
              flexShrink: 1,
              overflow: 'hidden',
            }}
            >
              <Popover.Root open={isOpen} onOpenChange={onOpenChange}>
                <Popover.Trigger asChild>
                  <Button
                    size="small"
                    variant="invisible"
                    icon={<GitBranchIcon />}
                    data-testid="branch-selector-menu-trigger"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
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
                        minHeight: '300px',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        width: 'auto',
                        minWidth: '200px',
                        maxWidth: '80vw',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
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
                          gap: '$1',
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
                        <IconButton
                          type="button"
                          tooltip={t('createNew')}
                          tooltipSide="top"
                          aria-label={t('createNew')}
                          onClick={handleCreateButtonClick}
                          css={{ flexShrink: 0 }}
                          variant="invisible"
                          size="small"
                          icon={<PlusIcon />}
                        />
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
                          onChange={handleSearchChangeWithTracking}
                          css={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontFamily: '$mono',
                          }}
                        />
                      </Box>

                      <Box css={{ maxHeight: '50vh', overflow: 'auto', padding: '$2' }}>
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
                                borderRadius: '$medium',
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
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.label}</span>
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
                    </Box>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          )}
        </Downshift>
      )}
    </>
  );
};
