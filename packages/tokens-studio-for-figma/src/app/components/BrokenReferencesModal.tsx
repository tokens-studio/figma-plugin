/* eslint-disable react/jsx-no-bind */
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@tokens-studio/ui';
import { useTranslation } from 'react-i18next';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import { Dispatch } from '@/app/store';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import tokenTypes from '@/config/tokenType.defs.json';
import { TokenTypeSchema } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import Modal from './Modal';
import Box from './Box';
import Stack from './Stack';
import Text from './Text';
import Accordion from './Accordion';
import { Count } from './Count';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  brokenTokens: ResolveTokenValuesResult[];
  onTokenEdit: () => void;
};

export function BrokenReferencesModal({
  isOpen,
  onClose,
  brokenTokens,
  onTokenEdit,
}: Props) {
  const { t } = useTranslation(['tokens']);
  const dispatch = useDispatch<Dispatch>();

  const brokenTokensBySet = React.useMemo(() => {
    const grouped = brokenTokens.reduce((acc, token) => {
      const setName = token.internal__Parent || 'unknown';
      if (!acc[setName]) {
        acc[setName] = [];
      }
      acc[setName].push(token);
      return acc;
    }, {} as Record<string, ResolveTokenValuesResult[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [brokenTokens]);

  const handleEditToken = React.useCallback((token: ResolveTokenValuesResult) => {
    // Close the broken references dialog first
    onTokenEdit();

    // Get the appropriate schema for this token type
    const schema = (tokenTypes as Record<string, TokenTypeSchema>)[token.type] || (tokenTypes as Record<string, TokenTypeSchema>)[TokenTypes.OTHER];

    // Set up the edit token with proper structure
    dispatch.uiState.setShowEditForm(true);
    dispatch.uiState.setEditToken({
      ...token,
      type: token.type as any, // Type assertion to handle union type complexity
      schema,
      status: EditTokenFormStatus.EDIT,
      initialName: token.name,
      name: token.name,
    } as any);
  }, [dispatch, onTokenEdit]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      close={onClose}
      title={t('brokenReferences')}
      size="large"
    >
      <Box css={{ padding: '$4' }}>
        <Stack direction="column" gap={4}>
          <Text size="small" muted>
            {t('brokenReferencesDescription', {
              count: brokenTokens.length,
            })}
          </Text>

          <Stack direction="column" gap={3}>
            {brokenTokensBySet.map(([setName, tokens]) => {
              const countElement = <Count count={tokens.length} />;

              return (
                <Accordion
                  key={setName}
                  label={setName}
                  isOpenByDefault={false}
                  extra={countElement}
                >
                  <Stack direction="column" gap={2}>
                    {tokens.map((token) => {
                      const handleTokenEdit = () => handleEditToken(token);

                      return (
                        <Box
                          key={token.name}
                          css={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '$2',
                            backgroundColor: '$bgSubtle',
                            borderRadius: '$small',
                          }}
                        >
                          <Stack direction="column" gap={1}>
                            <Text size="small">
                              <strong>{token.name}</strong>
                            </Text>
                            <Text size="xsmall" muted>
                              {typeof token.value === 'object'
                                ? JSON.stringify(token.value)
                                : String(token.value)}
                            </Text>
                          </Stack>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={handleTokenEdit}
                          >
                            {t('edit')}
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </Accordion>
              );
            })}
          </Stack>

          <Box css={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>
              {t('close')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
}
