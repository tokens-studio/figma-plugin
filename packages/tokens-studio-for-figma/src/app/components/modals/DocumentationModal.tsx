import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, Box, Stack, Checkbox, Button, Label, Select } from '@tokens-studio/ui';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { TokenTypes } from '@/constants/TokenTypes';
import Modal from '../Modal';
import { usedTokenSetSelector } from '@/selectors';
import { DocumentationConfig } from '@/types/AsyncMessages';
import { Dispatch } from '@/app/store';
import IconButton from '@/app/components/IconButton';
import Heading from '@/app/components/Heading';
import { AsyncMessageTypes } from '@/types/AsyncMessages';

type Props = {
  onClose: () => void
};

export default function DocumentationModal({ onClose }: Props) {
  const { t } = useTranslation(['tokens']);
  const usedTokenSets = useSelector(usedTokenSetSelector);
  const dispatch = useDispatch<Dispatch>();
  
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showDescription, setShowDescription] = useState<boolean>(true);
  const [selectedTokenSets, setSelectedTokenSets] = useState<string[]>(
    Object.entries(usedTokenSets)
      .filter(([_, status]) => status === TokenSetStatus.ENABLED)
      .map(([set]) => set)
  );
  const [selectedTokenTypes, setSelectedTokenTypes] = useState<string[]>(Object.values(TokenTypes));
  
  const handleLayoutChange = useCallback((newLayout: 'grid' | 'list') => {
    if (newLayout) {
      setLayout(newLayout);
    }
  }, []);

  const handleTokenSetChange = useCallback((set: string) => {
    setSelectedTokenSets((prev) => {
      if (prev.includes(set)) {
        return prev.filter((s) => s !== set);
      }
      return [...prev, set];
    });
  }, []);

  const handleTokenTypeChange = useCallback((type: string) => {
    setSelectedTokenTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const handleGenerateDocumentation = useCallback(() => {
    const config: DocumentationConfig = {
      tokenSets: selectedTokenSets,
      tokenTypes: selectedTokenTypes,
      layout,
      showValues,
      showDescription,
    };

    dispatch({
      type: AsyncMessageTypes.GENERATE_DOCUMENTATION,
      config,
    });
    
    onClose();
  }, [dispatch, selectedTokenSets, selectedTokenTypes, layout, showValues, showDescription, onClose]);

  return (
    <Modal size="large" isOpen close={onClose} title={t('generateDocumentation')}>
      <Stack gap={4} direction="column">
        <Box>
          <Label>{t('layout')}</Label>
          <ToggleGroup type="single" value={layout} onValueChange={handleLayoutChange}>
            <ToggleGroup.Item iconOnly={false} value="grid">{t('grid')}</ToggleGroup.Item>
            <ToggleGroup.Item iconOnly={false} value="list">{t('list')}</ToggleGroup.Item>
          </ToggleGroup>
        </Box>

        <Box>
          <Label>{t('options')}</Label>
          <Stack direction="column" gap={2}>
            <Checkbox
              checked={showValues}
              onCheckedChange={setShowValues}
              label={t('showValues')}
            />
            <Checkbox
              checked={showDescription}
              onCheckedChange={setShowDescription}
              label={t('showDescription')}
            />
          </Stack>
        </Box>

        <Box>
          <Label>{t('tokenSets')}</Label>
          <Stack direction="column" gap={2}>
            {Object.entries(usedTokenSets).map(([set, status]) => (
              <Checkbox
                key={set}
                checked={selectedTokenSets.includes(set)}
                onCheckedChange={() => handleTokenSetChange(set)}
                label={set}
              />
            ))}
          </Stack>
        </Box>

        <Box>
          <Label>{t('tokenTypes')}</Label>
          <Stack direction="column" gap={2}>
            {Object.values(TokenTypes).map((type) => (
              <Checkbox
                key={type}
                checked={selectedTokenTypes.includes(type)}
                onCheckedChange={() => handleTokenTypeChange(type)}
                label={type}
              />
            ))}
          </Stack>
        </Box>

        <Stack direction="row" gap={2} justify="end">
          <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateDocumentation} 
            disabled={selectedTokenSets.length === 0 || selectedTokenTypes.length === 0}
          >
            {t('generate')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}