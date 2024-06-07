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
import { SingleToken } from '@/types/tokens';

type Props = {
  isOpen: boolean;
  type: string;
  newName: string;
  oldName: string;
  onClose: () => void;
  handleNewTokenGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

enum ErrorType {
  UniqueToken = 'uniqueToken',
  NoSetSelected = 'noSetSelected',
  ExistingGroup = 'existingGroup',
  OverlappingToken = 'overlappingToken',
  OverlappingGroup = 'overlappingGroup',
}

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
    onClose();
  }, [duplicateGroup, oldName, newName, selectedTokenSets, type, onClose]);

  const error = useMemo(() => {
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

    const possibleDuplicates: { [key: string]: SingleToken[] } = selectedTokenSets.reduce((acc, selectedTokenSet) => {
      const newGroupTokens = tokens[selectedTokenSet].filter((token) => token.name.startsWith(`${newName}.`));
      const oldGroupTokens = tokens[activeTokenSet].filter((token) => token.name.startsWith(`${oldName}`)).map((token) => {
        const [, ...name] = token.name.split('.');

        return {
          ...token,
          name: `${newName}.${name.join('.')}`,
        };
      });
      const overlappingTokens = newGroupTokens.filter((a) => oldGroupTokens.filter((b) => a.name === b.name).length > 0);
      if (overlappingTokens.length > 0) {
        acc[selectedTokenSet] = overlappingTokens;
      }
      return acc;
    }, {});
    const foundOverlappingToken: { [key: string]: SingleToken } = selectedTokenSets.reduce((acc, selectedTokenSet) => {
      const overlappingToken = tokens[selectedTokenSet].find((token) => token.name === newName);
      if (overlappingToken) {
        acc[selectedTokenSet] = overlappingToken;
      }

      return acc;
    }, {});

    if (Object.keys(possibleDuplicates).length > 0) {
      return {
        possibleDuplicates,
        type: ErrorType.OverlappingGroup,
      };
    }
    if (Object.keys(foundOverlappingToken).length > 0) {
      return {
        type: ErrorType.OverlappingToken,
        foundOverlappingToken,
      };
    }
    return null;
  }, [activeTokenSet, newName, oldName, selectedTokenSets, tokens]);

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
          autoFocus
          required
          css={{ width: '100%' }}
        />
        {!canDuplicate && error?.type && (
          <ErrorMessage css={{ width: '100%', maxHeight: 150, overflow: 'scroll' }}>
            {{
              [ErrorType.NoSetSelected]: t('duplicateGroupModal.errors.noSetSelected'),
              [ErrorType.ExistingGroup]: t('duplicateGroupModal.errors.existingGroup'),
              [ErrorType.OverlappingToken]: error.foundOverlappingToken && (
                <>
                  {t('duplicateGroupModal.errors.overlappingToken', {
                    tokenSets: Object.keys(error.foundOverlappingToken).map((n) => `“${n}”`).join(', '),
                  })}
                  {Object.entries(error.foundOverlappingToken).map(([selectedSet, overlappingToken]) => (
                    <>
                      <Tooltip label="Set" side="right">
                        <Text css={{ marginTop: '$2', marginBottom: '$2', fontWeight: '$bold' }}>
                          {selectedSet}
                        </Text>
                      </Tooltip>
                      <StyledTokenButton as="div" css={{ display: 'inline-flex', borderRadius: '$small', margin: 0 }}>
                        <StyledTokenButtonText css={{ wordBreak: 'break-word' }}><span>{overlappingToken.name}</span></StyledTokenButtonText>
                      </StyledTokenButton>
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
