import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from '@tokens-studio/ui';
import { tokensSelector, activeTokenSetSelector } from '@/selectors';
import { ErrorMessage } from '../ErrorMessage';
import Modal from '../Modal';
import Stack from '../Stack';
import Input from '../Input';
import Text from '../Text';
import { StyledTokenButton, StyledTokenButtonText } from '../TokenButton/StyledTokenButton';
import { validateRenameGroupName, ErrorType } from '@/utils/validateGroupName';

type Props = {
  isOpen: boolean
  newName: string
  oldName: string
  onClose?: () => void;
  handleRenameTokenGroupSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  handleNewTokenGroupNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type: string
};

export default function RenameTokenGroupModal({
  isOpen, newName, oldName, onClose, handleRenameTokenGroupSubmit, handleNewTokenGroupNameChange, type,
}: Props) {
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const { t } = useTranslation(['tokens', 'general']);

  const error = useMemo(() => {
    if (newName === oldName || !isOpen) {
      return null;
    }

    return validateRenameGroupName(tokens[activeTokenSet], type, oldName, newName);
  }, [isOpen, activeTokenSet, newName, oldName, tokens, type]);

  const canRename = !(newName === oldName || error);

  return (
    <Modal
      title={`${t('rename')} ${oldName}`}
      isOpen={isOpen}
      close={onClose}
      footer={(
        <form id="renameTokenGroup" onSubmit={handleRenameTokenGroupSubmit}>
          <Stack direction="row" justify="end" gap={4}>
            <Button variant="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={!canRename}>
              {t('change')}
            </Button>
          </Stack>
        </form>
    )}
    >
      <Stack direction="column" gap={4}>
        <Input
          full
          form="renameTokenGroup"
          onChange={handleNewTokenGroupNameChange}
          type="text"
          value={newName}
          autofocus
          required
        />
        {!canRename && error && (
          <ErrorMessage css={{ width: '100%', maxHeight: 150, overflow: 'scroll' }}>
            {{
              [ErrorType.EmptyGroupName]: t('duplicateGroupModal.errors.emptyGroupName'),
              [ErrorType.OverlappingToken]: error.foundOverlappingTokens?.length > 0 && (
                <>
                  {t('renameGroupModal.errors.overlappingToken', {
                    tokenSet: activeTokenSet,
                  })}
                  {error.foundOverlappingTokens?.map((t) => (
                    <StyledTokenButton
                      as="div"
                      css={{
                        display: 'inline-flex', borderRadius: '$small', margin: 0, marginLeft: '$2',
                      }}
                    >
                      <StyledTokenButtonText key={t.name} css={{ wordBreak: 'break-word' }}><span>{t.name}</span></StyledTokenButtonText>
                    </StyledTokenButton>
                  ))}
                </>
              ),
              [ErrorType.OverlappingGroup]: (
                <>
                  {t('renameGroupModal.errors.overlappingGroup', {
                    groupName: newName,
                    tokenSet: activeTokenSet,
                  })}
                  <Stack direction="row" wrap css={{ marginTop: '$2' }}>
                    {error.possibleDuplicates?.map(({ name }) => (
                      <StyledTokenButton as="div" css={{ borderRadius: '$small' }}>
                        <StyledTokenButtonText css={{ wordBreak: 'break-word' }}><span>{name}</span></StyledTokenButtonText>
                      </StyledTokenButton>
                    ))}
                  </Stack>
                </>
              ),
            }[error.type]}
          </ErrorMessage>
        )}
        <Text muted>{t('renameGroupModal.infoSameType')}</Text>
      </Stack>
    </Modal>
  );
}
