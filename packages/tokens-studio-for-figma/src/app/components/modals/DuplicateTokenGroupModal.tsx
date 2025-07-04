import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, TextInput, Stack, Text,
  Tooltip,
} from '@tokens-studio/ui';
import Modal from '../Modal';
import { MultiSelectDropdown } from '../MultiSelectDropdown';
import { ErrorMessage } from '../ErrorMessage';
import { activeTokenSetSelector, tokensSelector } from '@/selectors';
import useManageTokens from '@/app/store/useManageTokens';
import { StyledTokenButton, StyledTokenButtonText } from '../TokenButton/StyledTokenButton';
import { validateDuplicateGroupName, ErrorType } from '@/utils/validateGroupName';

type Props = {
  isOpen: boolean;
  type: string;
  newName: string;
  oldName: string;
  onClose?: () => void;
  handleNewTokenGroupNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DuplicateTokenGroupModal({
  isOpen, type, newName, oldName, onClose, handleNewTokenGroupNameChange,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const [selectedTokenSets, setSelectedTokenSets] = React.useState<string[]>([activeTokenSet]);
  const { duplicateGroup } = useManageTokens();
  const { t } = useTranslation(['tokens']);

  const handleSelectedItemChange = React.useCallback((selectedItems: string[]) => {
    setSelectedTokenSets(selectedItems);
  }, []);

  const handleDuplicateTokenGroupSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    duplicateGroup({
      oldName, newName, tokenSets: selectedTokenSets, type,
    });
    if (onClose) {
      onClose();
    }
  }, [duplicateGroup, oldName, newName, selectedTokenSets, type, onClose]);

  const error = useMemo(() => {
    if (!isOpen) {
      return null;
    }
    if (newName === oldName && selectedTokenSets.includes(activeTokenSet)) {
      return {
        type: ErrorType.ExistingGroup,
      };
    }
    if (selectedTokenSets.length === 0) {
      return {
        type: ErrorType.NoSetSelected,
      };
    }
    return validateDuplicateGroupName(tokens, selectedTokenSets, activeTokenSet, type, oldName, newName);
  }, [isOpen, activeTokenSet, newName, oldName, selectedTokenSets, tokens, type]);

  const canDuplicate = !error;

  return (
    <Modal
      title={t('duplicateGroup') as string}
      isOpen={isOpen}
      close={onClose}
      size="large"
      footer={(
        <form id="duplicateTokenGroup" onSubmit={handleDuplicateTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!canDuplicate}>
              {t('duplicate')}
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" justify="center" align="start" gap={4}>
        <TextInput
          form="duplicateTokenGroup"
          onChange={handleNewTokenGroupNameChange}
          type="text"
          name="tokengroupname"
          value={newName}
          readOnly={!handleNewTokenGroupNameChange}
          autoFocus
          required
          css={{ width: '100%' }}
        />
        {!canDuplicate && error?.type && (
          <ErrorMessage css={{ width: '100%', maxHeight: 150, overflow: 'scroll' }}>
            {{
              [ErrorType.NoSetSelected]: t('duplicateGroupModal.errors.noSetSelected'),
              [ErrorType.EmptyGroupName]: t('duplicateGroupModal.errors.emptyGroupName'),
              [ErrorType.ExistingGroup]: t('duplicateGroupModal.errors.existingGroup'),
              [ErrorType.OverlappingToken]: error.foundOverlappingTokens && (
                <>
                  {t('duplicateGroupModal.errors.overlappingToken', {
                    tokenSets: Object.keys(error.foundOverlappingTokens).map((n) => `“${n}”`).join(', '),
                  })}
                    {Object.entries(error.foundOverlappingTokens).map(([selectedSet, overlappingTokens]) => (
                      <>
                        <Tooltip label="Set" side="right">
                          <Text css={{ marginTop: '$2', marginBottom: '$2', fontWeight: '$bold' }}>
                            {selectedSet}
                          </Text>
                        </Tooltip>
                        <Stack direction="row" gap={2}>
                          {overlappingTokens.map((t) => (
                            <StyledTokenButton as="div" css={{ display: 'inline-flex', borderRadius: '$small', margin: 0 }}>
                              <StyledTokenButtonText css={{ wordBreak: 'break-word' }}><span>{t.name}</span></StyledTokenButtonText>
                            </StyledTokenButton>
                          ))}
                        </Stack>
                      </>
                    ))}
                </>
              ),
              [ErrorType.OverlappingGroup]: (
                <>
                  {t('duplicateGroupModal.errors.overlappingGroup', {
                    groupName: newName, tokenSets: error.possibleDuplicates && Object.keys(error.possibleDuplicates).map((n) => `“${n}”`).join(', '),
                  })}
                  {error.possibleDuplicates && Object.entries(error.possibleDuplicates).map(([selectedSet, overlappingTokens]) => (
                    <>
                      <Tooltip label="Set" side="right">
                        <Text css={{ marginTop: '$2', marginBottom: '$2', fontWeight: '$bold' }}>
                          {selectedSet}
                        </Text>
                      </Tooltip>
                      <Stack direction="row" wrap css={{ marginTop: '$2' }}>
                        {overlappingTokens.map(({ name }) => (
                          <StyledTokenButton as="div" css={{ borderRadius: '$small' }}>
                            <StyledTokenButtonText css={{ wordBreak: 'break-word' }}><span>{name}</span></StyledTokenButtonText>
                          </StyledTokenButton>
                        ))}
                      </Stack>
                    </>
                  ))}
                </>
              ),
            }[error.type]}
          </ErrorMessage>
        )}
        <MultiSelectDropdown menuItems={Object.keys(tokens)} selectedItems={selectedTokenSets} handleSelectedItemChange={handleSelectedItemChange} />
      </Stack>
    </Modal>
  );
}
