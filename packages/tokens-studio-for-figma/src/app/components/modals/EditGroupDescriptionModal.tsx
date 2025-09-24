import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Heading, Label, Text, Textarea } from '@tokens-studio/ui';
import Modal from '../Modal';
import Stack from '../Stack';
import { Dispatch } from '../../store';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupPath: string;
  tokenSet: string;
  currentDescription?: string;
}

export function EditGroupDescriptionModal({ 
  isOpen, 
  onClose, 
  groupPath, 
  tokenSet, 
  currentDescription = '' 
}: Props) {
  const { t } = useTranslation(['tokens']);
  const dispatch = useDispatch<Dispatch>();
  const [description, setDescription] = useState(currentDescription);

  // Update local state when modal opens with new description
  React.useEffect(() => {
    if (isOpen) {
      setDescription(currentDescription);
    }
  }, [isOpen, currentDescription]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (description.trim()) {
      // Update group description
      dispatch.tokenState.updateGroupDescription({
        path: groupPath,
        description: description.trim(),
        tokenSet,
      });
    } else {
      // Delete group description if empty
      dispatch.tokenState.deleteGroupMetadata({
        path: groupPath,
        tokenSet,
      });
    }
    
    onClose();
  }, [description, dispatch.tokenState, groupPath, tokenSet, onClose]);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
  }, []);

  const handleClose = useCallback(() => {
    setDescription(currentDescription);
    onClose();
  }, [currentDescription, onClose]);

  return (
    <Modal isOpen={isOpen} close={handleClose} title="Edit Group Description">
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap={4}>
          <Stack direction="column" gap={2}>
            <Heading size="small">Group: {groupPath}</Heading>
            <Text size="small" css={{ color: '$fgMuted' }}>
              Add a description to help explain the purpose of this token group.
            </Text>
          </Stack>
          
          <Stack direction="column" gap={2}>
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter a description for this group..."
              rows={4}
              css={{ width: '100%' }}
            />
          </Stack>

          <Stack direction="row" gap={2} justify="end">
            <Button variant="secondary" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button type="submit">
              {t('save')}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  );
}