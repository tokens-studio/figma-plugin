import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, Text } from '@tokens-studio/ui';
import { EditTokenObject } from '@/types/tokens';
import Box from './Box';
import { TokenTypes } from '@/constants/TokenTypes';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import DownshiftInput from './DownshiftInput';
import { checkIfAlias } from '@/utils/alias';
import { ErrorValidation } from './ErrorValidation';

type BooleanValue = 'true' | 'false' | 'reference';

export default function BooleanTokenForm({
  internalEditToken,
  resolvedTokens,
  handleBooleanChange,
  handleBooleanDownShiftInputChange,
  onSubmit,
}: {
  internalEditToken: Extract<EditTokenObject, { type: TokenTypes.BOOLEAN }>;
  resolvedTokens: ResolveTokenValuesResult[];
  handleBooleanChange: (property: string, value: string) => void;
  handleBooleanDownShiftInputChange: (newInputValue: string) => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation(['tokens']);

  // Determine current mode based on value
  const currentMode = useMemo<BooleanValue>(() => {
    const { value } = internalEditToken;
    if (value === 'true') return 'true';
    if (value === 'false') return 'false';
    return 'reference';
  }, [internalEditToken.value]);

  // Check if the current value is a valid reference
  const isValidReference = useMemo(() => {
    if (currentMode === 'reference' && typeof internalEditToken.value === 'string') {
      return checkIfAlias(internalEditToken.value, resolvedTokens);
    }
    return true;
  }, [currentMode, internalEditToken.value, resolvedTokens]);

  // Check if value is invalid (not true, false, or a valid reference)
  const hasInvalidValue = useMemo(() => {
    if (currentMode === 'reference') {
      const { value } = internalEditToken;
      if (typeof value !== 'string') return true;

      // Check if it's a valid alias format
      const isAliasFormat = /^(\{[^}]+\}|\$[a-zA-Z0-9._-]+)$/.test(value);
      if (!isAliasFormat) return true;

      return !isValidReference;
    }
    return false;
  }, [currentMode, internalEditToken.value, isValidReference]);

  const handleModeChange = useCallback((value: string) => {
    if (value === 'true' || value === 'false') {
      handleBooleanDownShiftInputChange(value);
    } else if (value === 'reference') {
      // Switch to reference mode with empty value if coming from true/false
      if (currentMode !== 'reference') {
        handleBooleanDownShiftInputChange('');
      }
    }
  }, [handleBooleanDownShiftInputChange, currentMode]);

  return (
    <>
      <Box css={{ marginBottom: '$3' }}>
        <Text size="small" bold css={{ marginBottom: '$1' }}>
          {t('value')}
        </Text>
        <ToggleGroup
          type="single"
          value={currentMode}
          onValueChange={handleModeChange}
          css={{ 
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
          }}
        >
          <ToggleGroup.Item value="true">
            true
          </ToggleGroup.Item>
          <ToggleGroup.Item value="false">
            false
          </ToggleGroup.Item>
          <ToggleGroup.Item value="reference">
            {t('reference', { ns: 'general' }) || 'Reference'}
          </ToggleGroup.Item>
        </ToggleGroup>
      </Box>

      {currentMode === 'reference' && (
        <>
          <DownshiftInput
            value={internalEditToken.value}
            type={TokenTypes.BOOLEAN}
            label={t('referenceValue')}
            resolvedTokens={resolvedTokens}
            initialName={internalEditToken.initialName}
            handleChange={handleBooleanChange}
            setInputValue={handleBooleanDownShiftInputChange}
            placeholder="{alias}"
            suffix
            onSubmit={onSubmit}
          />
          {hasInvalidValue && (
            <Box css={{ marginTop: '$2' }}>
              <ErrorValidation>
                {t('invalidBooleanValue', { ns: 'errors' }) || 'Value must be true, false, or a valid reference'}
              </ErrorValidation>
            </Box>
          )}
        </>
      )}
    </>
  );
}
