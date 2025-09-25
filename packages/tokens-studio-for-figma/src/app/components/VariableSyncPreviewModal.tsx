import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Stack, Checkbox, Heading, Text, Tabs,
} from '@tokens-studio/ui';
import { ChevronLeftIcon } from '@primer/octicons-react';
import Modal from './Modal';
import Box from './Box';
import { VariableChangePreview } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { ExportTokenSet } from '@/types/ExportTokenSet';
import { SettingsState } from '@/app/store/models/settings';

export type VariableSyncPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedChanges: VariableChangePreview[]) => void;
  tokens: Record<string, any>;
  settings: SettingsState;
  selectedThemes?: string[];
  selectedSets?: ExportTokenSet[];
};

export type SyncCategories = {
  create: boolean;
  update: boolean;
  delete: boolean;
};

const VariableSyncPreviewModal: React.FC<VariableSyncPreviewProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tokens,
  settings,
  selectedThemes,
  selectedSets,
}) => {
  const { t } = useTranslation(['variableSync']);
  const [changes, setChanges] = useState<VariableChangePreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<SyncCategories>({
    create: true,
    update: true,
    delete: true,
  });
  const [summary, setSummary] = useState({ toCreate: 0, toUpdate: 0, toDelete: 0 });
  const [activeTab, setActiveTab] = useState<'create' | 'update' | 'delete'>('create');

  // Load preview data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPreviewData();
    }
  }, [isOpen, tokens, settings, selectedThemes, selectedSets]);

  const loadPreviewData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.PREVIEW_VARIABLE_SYNC,
        tokens,
        settings,
        selectedThemes,
        selectedSets,
      });

      setChanges(result.changes);
      setSummary(result.summary);
      
      // Initially select all changes that match enabled categories
      const initialSelection = new Set<string>();
      result.changes.forEach((change, index) => {
        if (categories[change.type]) {
          initialSelection.add(`${change.type}-${index}`);
        }
      });
      setSelectedChanges(initialSelection);

      // Set active tab to first available category with changes
      if (result.summary.toCreate > 0) {
        setActiveTab('create');
      } else if (result.summary.toUpdate > 0) {
        setActiveTab('update');
      } else if (result.summary.toDelete > 0) {
        setActiveTab('delete');
      }
    } catch (error) {
      console.error('Failed to load variable sync preview:', error);
    } finally {
      setLoading(false);
    }
  }, [tokens, settings, selectedThemes, selectedSets, categories]);

  const handleCategoryToggle = useCallback((category: keyof SyncCategories) => {
    const newCategories = { ...categories, [category]: !categories[category] };
    setCategories(newCategories);

    // Update selected changes based on new categories
    const newSelection = new Set<string>();
    changes.forEach((change, index) => {
      const changeId = `${change.type}-${index}`;
      const wasSelected = selectedChanges.has(changeId);
      
      if (newCategories[change.type] && wasSelected) {
        newSelection.add(changeId);
      } else if (!newCategories[change.type]) {
        // If category is disabled, don't include its changes
        return;
      } else if (newCategories[change.type] && !categories[change.type]) {
        // If category was just enabled, select all its changes
        newSelection.add(changeId);
      }
    });
    
    setSelectedChanges(newSelection);
  }, [categories, changes, selectedChanges]);

  const handleChangeToggle = useCallback((changeId: string) => {
    const newSelection = new Set(selectedChanges);
    if (newSelection.has(changeId)) {
      newSelection.delete(changeId);
    } else {
      newSelection.add(changeId);
    }
    setSelectedChanges(newSelection);
  }, [selectedChanges]);

  const handleSelectAll = useCallback((type: 'create' | 'update' | 'delete') => {
    const typeChanges = changes.filter(change => change.type === type);
    const allSelected = typeChanges.every((_, index) => selectedChanges.has(`${type}-${changes.findIndex(c => c === typeChanges[index])}`));
    
    const newSelection = new Set(selectedChanges);
    
    typeChanges.forEach((change) => {
      const originalIndex = changes.findIndex(c => c === change);
      const changeId = `${type}-${originalIndex}`;
      
      if (allSelected) {
        newSelection.delete(changeId);
      } else {
        newSelection.add(changeId);
      }
    });
    
    setSelectedChanges(newSelection);
  }, [changes, selectedChanges]);

  const handleConfirm = useCallback(() => {
    const selectedChangesList = changes.filter((change, index) => {
      const changeId = `${change.type}-${index}`;
      return selectedChanges.has(changeId) && categories[change.type];
    });
    onConfirm(selectedChangesList);
  }, [changes, selectedChanges, categories, onConfirm]);

  const getFilteredChanges = useCallback((type: 'create' | 'update' | 'delete') => {
    return changes.filter(change => change.type === type);
  }, [changes]);

  const renderChangeItem = useCallback((change: VariableChangePreview, index: number) => {
    const originalIndex = changes.findIndex(c => c === change);
    const changeId = `${change.type}-${originalIndex}`;
    const isSelected = selectedChanges.has(changeId);
    const isCategoryEnabled = categories[change.type];

    return (
      <Box
        key={changeId}
        css={{
          padding: '$3',
          border: '1px solid $borderMuted',
          borderRadius: '$small',
          opacity: isCategoryEnabled ? 1 : 0.5,
        }}
      >
        <Stack direction="row" align="start" gap={3}>
          <Checkbox
            checked={isSelected && isCategoryEnabled}
            disabled={!isCategoryEnabled}
            onCheckedChange={() => handleChangeToggle(changeId)}
          />
          <Stack direction="column" gap={2} css={{ flex: 1 }}>
            <Stack direction="row" justify="between" align="start">
              <Stack direction="column" gap={1}>
                <Text css={{ fontWeight: '$sansBold', fontSize: '$small' }}>
                  {change.name}
                </Text>
                <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                  {change.path} • {change.tokenType}
                </Text>
              </Stack>
              <Stack direction="column" align="end" gap={1}>
                {change.collectionName && (
                  <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                    {change.collectionName}
                  </Text>
                )}
                {change.mode && (
                  <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                    Mode: {change.mode}
                  </Text>
                )}
              </Stack>
            </Stack>
            
            {change.description && (
              <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                {change.description}
              </Text>
            )}

            {/* Show before/after values for updates */}
            {change.type === 'update' && (
              <Stack direction="column" gap={1}>
                <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                  Current: <span style={{ fontFamily: 'monospace' }}>{change.currentValue}</span>
                </Text>
                <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                  New: <span style={{ fontFamily: 'monospace' }}>{change.newValue}</span>
                </Text>
              </Stack>
            )}

            {/* Show new value for creates */}
            {change.type === 'create' && (
              <Text css={{ fontSize: '$xsmall', color: '$textSubtle' }}>
                Value: <span style={{ fontFamily: 'monospace' }}>{change.newValue}</span>
              </Text>
            )}

            {/* Show current value for deletes */}
            {change.type === 'delete' && (
              <Text css={{ fontSize: '$xsmall', color: '$dangerFg' }}>
                Current: <span style={{ fontFamily: 'monospace' }}>{change.currentValue}</span>
              </Text>
            )}
          </Stack>
        </Stack>
      </Box>
    );
  }, [changes, selectedChanges, categories, handleChangeToggle]);

  const renderTabContent = useCallback((type: 'create' | 'update' | 'delete') => {
    const filteredChanges = getFilteredChanges(type);
    const selectedCount = filteredChanges.filter((change) => {
      const originalIndex = changes.findIndex(c => c === change);
      return selectedChanges.has(`${type}-${originalIndex}`) && categories[type];
    }).length;

    if (filteredChanges.length === 0) {
      return (
        <Box css={{ padding: '$6', textAlign: 'center' }}>
          <Text css={{ color: '$textSubtle' }}>
            No variables to {type}
          </Text>
        </Box>
      );
    }

    return (
      <Stack direction="column" gap={3}>
        <Stack direction="row" justify="between" align="center">
          <Stack direction="row" align="center" gap={2}>
            <Checkbox
              checked={categories[type]}
              onCheckedChange={() => handleCategoryToggle(type)}
            />
            <Text css={{ fontWeight: '$sansBold' }}>
              {type === 'create' ? 'Create all' : type === 'update' ? 'Update all' : 'Delete all'}
            </Text>
            <Text css={{ color: '$textSubtle' }}>
              ({selectedCount}/{filteredChanges.length} selected)
            </Text>
          </Stack>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleSelectAll(type)}
            disabled={!categories[type]}
          >
            {filteredChanges.every((_, index) => {
              const originalIndex = changes.findIndex(c => c === filteredChanges[index]);
              return selectedChanges.has(`${type}-${originalIndex}`);
            }) ? 'Deselect All' : 'Select All'}
          </Button>
        </Stack>
        
        <Stack direction="column" gap={2} css={{ maxHeight: '400px', overflow: 'auto' }}>
          {filteredChanges.map((change, index) => renderChangeItem(change, index))}
        </Stack>
      </Stack>
    );
  }, [getFilteredChanges, changes, selectedChanges, categories, handleCategoryToggle, handleSelectAll, renderChangeItem]);

  if (!isOpen) return null;

  const selectedCount = Array.from(selectedChanges).filter(changeId => {
    const [type] = changeId.split('-');
    return categories[type as keyof SyncCategories];
  }).length;

  return (
    <Modal
      size="large"
      title={t('preview.title')}
      showClose
      isOpen={isOpen}
      close={onClose}
      footer={(
        <Stack direction="row" gap={4} justify="between">
          <Button variant="secondary" onClick={onClose} icon={<ChevronLeftIcon />}>
            {t('preview.actions.cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={selectedCount === 0 || loading}
          >
            {t('preview.actions.applyChanges')} ({selectedCount})
          </Button>
        </Stack>
      )}
    >
      {loading ? (
        <Box css={{ padding: '$6', textAlign: 'center' }}>
          <Text>Analyzing variable changes...</Text>
        </Box>
      ) : (
        <Stack direction="column" gap={4}>
          <Box css={{ padding: '$4', backgroundColor: '$bgSubtle', borderRadius: '$small' }}>
            <Stack direction="row" gap={6}>
              <Text css={{ fontSize: '$small' }}>
                <strong>{summary.toCreate}</strong> to create
              </Text>
              <Text css={{ fontSize: '$small' }}>
                <strong>{summary.toUpdate}</strong> to update
              </Text>
              <Text css={{ fontSize: '$small' }}>
                <strong>{summary.toDelete}</strong> to delete
              </Text>
            </Stack>
          </Box>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <Tabs.List>
              <Tabs.Trigger value="create" disabled={summary.toCreate === 0}>
                To Create ({summary.toCreate})
              </Tabs.Trigger>
              <Tabs.Trigger value="update" disabled={summary.toUpdate === 0}>
                To Update ({summary.toUpdate})
              </Tabs.Trigger>
              <Tabs.Trigger value="delete" disabled={summary.toDelete === 0}>
                To Delete ({summary.toDelete})
              </Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="create">
              {renderTabContent('create')}
            </Tabs.Content>
            
            <Tabs.Content value="update">
              {renderTabContent('update')}
            </Tabs.Content>
            
            <Tabs.Content value="delete">
              {renderTabContent('delete')}
            </Tabs.Content>
          </Tabs>
        </Stack>
      )}
    </Modal>
  );
};

export default VariableSyncPreviewModal;