import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Heading, Label, Text, Textarea } from '@tokens-studio/ui';
import { tokensSelector, activeTokenSetSelector } from '@/selectors';
import { ErrorMessage } from '../ErrorMessage';
import Modal from '../Modal';
import Stack from '../Stack';
import Input from '../Input';
import { StyledTokenButton, StyledTokenButtonText } from '../TokenButton/StyledTokenButton';
import { validateRenameGroupName, ErrorType } from '@/utils/validateGroupName';
import { Dispatch } from '../../store';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupPath: string;
  tokenSet: string;
  type: string;
  currentDescription?: string;
  onRename?: (oldName: string, newName: string) => Promise<void>;
}

export function EditTokenGroupModal({
  isOpen,
  onClose,
  groupPath,
  tokenSet,
  type,
  currentDescription = '',
  onRename,
}: Props) {
  const { t } = useTranslation(['tokens', 'general']);
  const dispatch = useDispatch<Dispatch>();
  const tokens = useSelector(tokensSelector);
  const activeTokenSet = useSelector(activeTokenSetSelector);

  const [name, setName] = useState(groupPath);
  const [description, setDescription] = useState(currentDescription);

  // Update local state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName(groupPath);
      setDescription(currentDescription);
    }
  }, [isOpen, groupPath, currentDescription]);

  const nameError = useMemo(() => {
    if (name === groupPath || !isOpen) {
      return null;
    }

    return validateRenameGroupName(tokens[activeTokenSet], type, groupPath, name);
  }, [isOpen, activeTokenSet, name, groupPath, tokens, type]);

  const canSave = useMemo(() => {
    // Check if anything has changed
    const nameChanged = name !== groupPath;
    const descriptionChanged = description !== currentDescription;
    
    if (!nameChanged && !descriptionChanged) {
      return false;
    }

    // If name changed, check for validation errors
    if (nameChanged && nameError) {
      return false;
    }

    return true;
  }, [name, groupPath, description, currentDescription, nameError]);

  const hasChanges = useMemo(() => {
    return name !== groupPath || description !== currentDescription;
  }, [name, groupPath, description, currentDescription]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameChanged = name !== groupPath;
    const descriptionChanged = description !== currentDescription;

    // Handle description changes
    if (descriptionChanged) {
      if (description.trim()) {
        // Update group description
        dispatch.tokenState.updateGroupDescription({
          path: nameChanged ? name : groupPath, // Use new name if it was changed
          description: description.trim(),
          tokenSet,
        });
      } else {
        // Delete group description if empty
        dispatch.tokenState.deleteGroupMetadata({
          path: nameChanged ? name : groupPath, // Use new name if it was changed
          tokenSet,
        });
      }
    }

    // Handle name changes (must be done after description update)
    if (nameChanged && onRename) {
      await onRename(groupPath, name);
    }

    onClose();
  }, [
    name, 
    groupPath, 
    description, 
    currentDescription, 
    dispatch.tokenState, 
    tokenSet, 
    onRename, 
    onClose
  ]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const handleClose = useCallback(() => {
    setName(groupPath);
    setDescription(currentDescription);
    onClose();
  }, [groupPath, currentDescription, onClose]);

  return (
    <Modal isOpen={isOpen} close={handleClose} title={`Edit ${groupPath}`}>
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={4}>
          <Stack direction="column" gap={2}>
            <Heading size="small">Token Group Settings</Heading>
            <Text size="small" css={{ color: '$fgMuted' }}>
              Edit the name and description for this token group.
            </Text>
          </Stack>

          {/* Name input */}
          <Stack direction="column" gap={2}>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={handleNameChange}
              type="text"
              required
              full
            />
            {nameError && (
              <ErrorMessage css={{ width: '100%', maxHeight: 150, overflow: 'scroll' }}>
                {{
                  [ErrorType.EmptyGroupName]: t('duplicateGroupModal.errors.emptyGroupName'),
                  [ErrorType.OverlappingToken]: nameError.foundOverlappingTokens?.length > 0 && (
                    <>
                      {t('renameGroupModal.errors.overlappingToken', {
                        tokenSet: activeTokenSet,
                      })}
                      {nameError.foundOverlappingTokens?.map((token) => (
                        <StyledTokenButton
                          key={token.name}
                          as="div"
                          css={{
                            display: 'inline-flex', borderRadius: '$small', margin: 0, marginLeft: '$2',
                          }}
                        >
                          <StyledTokenButtonText css={{ wordBreak: 'break-word' }}>
                            <span>{token.name}</span>
                          </StyledTokenButtonText>
                        </StyledTokenButton>
                      ))}
                    </>
                  ),
                  [ErrorType.OverlappingGroup]: (
                    <>
                      {t('renameGroupModal.errors.overlappingGroup', {
                        groupName: name,
                        tokenSet: activeTokenSet,
                      })}
                      <Stack direction="row" wrap css={{ marginTop: '$2' }}>
                        {nameError.possibleDuplicates?.map(({ name: duplicateName }) => (
                          <StyledTokenButton key={duplicateName} as="div" css={{ borderRadius: '$small' }}>
                            <StyledTokenButtonText css={{ wordBreak: 'break-word' }}>
                              <span>{duplicateName}</span>
                            </StyledTokenButtonText>
                          </StyledTokenButton>
                        ))}
                      </Stack>
                    </>
                  ),
                }[nameError.type]}
              </ErrorMessage>
            )}
          </Stack>

          {/* Description input */}
          <Stack direction="column" gap={2}>
            <Label htmlFor="group-description">Description (Optional)</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter a description for this group..."
              rows={4}
              css={{ width: '100%' }}
            />
            <Text size="small" css={{ color: '$fgMuted' }}>
              Add a description to help explain the purpose of this token group.
            </Text>
          </Stack>

          <Stack direction="row" gap={2} justify="end">
            <Button variant="secondary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {hasChanges ? t('save') : t('save')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}