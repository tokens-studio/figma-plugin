import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Stack, 
  Box, 
  Text, 
  Checkbox, 
  Radio, 
  RadioGroup,
  Heading
} from '@tokens-studio/ui';
import Modal from '../Modal';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { tokensSelector } from '@/selectors/tokens';
import { tokenSetStatusSelector } from '@/selectors/tokenSetStatus';
import { Dispatch } from '@/app/store';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { track } from '@/utils/analytics';
import { ErrorMessage } from '../ErrorMessage';

export default function LivingDocumentationModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation(['tokens']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [includeAllTokens, setIncludeAllTokens] = useState(true);
  const [selectedTokenSets, setSelectedTokenSets] = useState<string[]>([]);
  const [documentationLayout, setDocumentationLayout] = useState<'grid' | 'list'>('grid');
  
  const tokens = useSelector(tokensSelector);
  const tokenSetStatus = useSelector(tokenSetStatusSelector);
  
  const dispatch = useDispatch<Dispatch>();
  
  const handleCloseModal = useCallback(() => {
    if (!isGenerating) {
      onClose();
    }
  }, [onClose, isGenerating]);

  const handleSelectTokenSet = useCallback((tokenSet: string) => {
    setSelectedTokenSets((prev) => {
      if (prev.includes(tokenSet)) {
        return prev.filter((set) => set !== tokenSet);
      }
      return [...prev, tokenSet];
    });
  }, []);

  const handleToggleIncludeAllTokens = useCallback((checked: boolean) => {
    setIncludeAllTokens(checked);
  }, []);

  const handleSetDocumentationLayout = useCallback((value: string) => {
    setDocumentationLayout(value as 'grid' | 'list');
  }, []);

  const handleGenerateDocumentation = useCallback(async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      // Track analytics
      track('Generate Living Documentation', {
        includeAllTokens,
        tokenSetsCount: includeAllTokens ? Object.keys(tokens).length : selectedTokenSets.length,
        layout: documentationLayout,
      });

      // Call the plugin to generate documentation
      const response = await AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.GENERATE_LIVING_DOCUMENTATION,
        tokenSets: selectedTokenSets,
        includeAllTokens,
        documentationLayout,
      });

      if (response.success) {
        setSuccess(response.message);
        // Optionally close the modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, [includeAllTokens, selectedTokenSets, documentationLayout, tokens, onClose]);

  // Get available token sets
  const availableTokenSets = Object.entries(tokenSetStatus)
    .filter(([, status]) => status !== TokenSetStatus.DISABLED)
    .map(([name]) => name);

  const isValid = includeAllTokens || selectedTokenSets.length > 0;

  return (
    <Modal isOpen title={t('generateLivingDocumentation')} close={handleCloseModal}>
      <Stack direction="column" gap={4}>
        <Box>
          <Text>{t('livingDocumentationDescription')}</Text>
        </Box>

        <Box>
          <Checkbox 
            id="include-all-tokens" 
            checked={includeAllTokens} 
            onChange={handleToggleIncludeAllTokens}
          >
            {t('includeAllTokens')}
          </Checkbox>
        </Box>

        {!includeAllTokens && (
          <Box css={{ marginTop: '$2' }}>
            <Heading size="small">{t('selectTokenSets')}</Heading>
            <Stack direction="column" gap={2}>
              {availableTokenSets.length > 0 ? (
                availableTokenSets.map((tokenSet) => (
                  <Checkbox 
                    key={tokenSet}
                    id={`token-set-${tokenSet}`}
                    checked={selectedTokenSets.includes(tokenSet)}
                    onChange={() => handleSelectTokenSet(tokenSet)}
                  >
                    {tokenSet}
                  </Checkbox>
                ))
              ) : (
                <Text>{t('noTokenSetsAvailable')}</Text>
              )}
            </Stack>
          </Box>
        )}

        <Box css={{ marginTop: '$2' }}>
          <Heading size="small">{t('documentationLayout')}</Heading>
          <RadioGroup 
            value={documentationLayout} 
            onValueChange={handleSetDocumentationLayout}
          >
            <Radio value="grid" id="layout-grid">{t('gridLayout')}</Radio>
            <Radio value="list" id="layout-list">{t('listLayout')}</Radio>
          </RadioGroup>
        </Box>

        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}

        {success && (
          <Box css={{ 
            padding: '$3',
            backgroundColor: '$successBg',
            color: '$successFg',
            borderRadius: '$default'
          }}>
            {success}
          </Box>
        )}

        <Stack direction="row" gap={2} justify="end">
          <Button variant="secondary" onClick={handleCloseModal} disabled={isGenerating}>
            {t('cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGenerateDocumentation} 
            disabled={!isValid || isGenerating}
          >
            {isGenerating ? t('generating') : t('generateDocumentation')}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}