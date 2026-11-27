import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Button, Label, Stack, TextInput,
} from '@tokens-studio/ui';
import IconAdd from '@/icons/add.svg';
import Modal from './Modal';
import { editProhibitedSelector } from '@/selectors';
import type { StudioSimpleView } from '@/types/StudioSimpleView';
import { findCollectionByFolder, findModeBySetName } from '@/utils/tokensStudio/simpleView';
import {
  addSimpleCollection, addSimpleMode, renameSimpleCollection, renameSimpleMode,
} from '@/app/store/providers/tokens-studio/simpleViewActions';

type Props = {
  simpleView: StudioSimpleView;
  /** A set or folder of the tree to rename, or null. */
  renamePath: string | null;
  onCloseRename: () => void;
  /** A collection's folder to add a mode to (from its "+" in the tree), or null. */
  addModePath: string | null;
  onCloseAddMode: () => void;
};

/**
 * The set tree's actions for a Tokens Studio project in Simple view, where Studio keeps one set per mode:
 * "Add collection" instead of "New set", a collection folder's "+" adds a mode, and renaming a set or folder
 * renames its mode or collection.
 */
export function SimpleViewSetActions({
  simpleView, renamePath, onCloseRename, addModePath, onCloseAddMode,
}: Props) {
  const { t } = useTranslation(['tokens']);
  const editProhibited = useSelector(editProhibitedSelector);
  const [addingCollection, setAddingCollection] = useState(false);
  const [name, setName] = useState('');

  const renameTarget = useMemo(() => {
    if (!renamePath) return null;
    const match = findModeBySetName(simpleView, renamePath);
    if (match) return { kind: 'mode' as const, mode: match.mode };
    const collection = findCollectionByFolder(simpleView, renamePath);
    if (collection) return { kind: 'collection' as const, collection };
    return null;
  }, [renamePath, simpleView]);

  const addModeCollection = useMemo(
    () => (addModePath ? findCollectionByFolder(simpleView, addModePath) ?? null : null),
    [addModePath, simpleView],
  );

  useEffect(() => {
    if (addModeCollection) setName('');
  }, [addModeCollection]);

  useEffect(() => {
    if (renameTarget) setName(renameTarget.kind === 'mode' ? renameTarget.mode.name : renameTarget.collection.name);
  }, [renameTarget]);

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value), []);
  const openAddCollection = useCallback(() => {
    setName('');
    setAddingCollection(true);
  }, []);
  const closeAdding = useCallback(() => {
    setAddingCollection(false);
    onCloseAddMode();
  }, [onCloseAddMode]);

  const handleAddSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (addModeCollection) {
      addSimpleMode(addModeCollection, trimmed);
    } else {
      addSimpleCollection(trimmed);
    }
    closeAdding();
  }, [addModeCollection, closeAdding, name]);

  const handleRenameSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (renameTarget?.kind === 'mode' && trimmed && trimmed !== renameTarget.mode.name) {
      renameSimpleMode(renameTarget.mode, trimmed);
    } else if (renameTarget?.kind === 'collection' && trimmed && trimmed !== renameTarget.collection.name) {
      renameSimpleCollection(renameTarget.collection, trimmed);
    }
    onCloseRename();
  }, [name, onCloseRename, renameTarget]);

  let renameTitle = '';
  if (renameTarget?.kind === 'mode') renameTitle = t('simpleView.renameModeTitle', { name: renameTarget.mode.name });
  if (renameTarget?.kind === 'collection') renameTitle = t('simpleView.renameCollectionTitle', { name: renameTarget.collection.name });

  return (
    <>
      <Stack direction="column" css={{ padding: '$3' }} gap={2}>
        <Button
          icon={<IconAdd />}
          size="small"
          data-testid="button-simple-add-collection"
          type="button"
          disabled={editProhibited}
          onClick={openAddCollection}
          css={{ justifyContent: 'center' }}
        >
          {t('simpleView.addCollection')}
        </Button>
      </Stack>
      <Modal
        title={addModeCollection ? t('simpleView.addModeTo', { name: addModeCollection.name }) : t('simpleView.addCollection')}
        isOpen={addingCollection || !!addModeCollection}
        close={closeAdding}
      >
        <form onSubmit={handleAddSubmit}>
          <Stack direction="column" gap={4}>
            <Stack direction="column" gap={2}>
              <Label htmlFor="simple-set-name">{addModeCollection ? t('simpleView.modeName') : t('simpleView.collectionName')}</Label>
              <TextInput
                autoFocus
                id="simple-set-name"
                value={name}
                onChange={handleChangeName}
                type="text"
                required
                data-testid="simple-add-name-input"
              />
            </Stack>
            <Stack direction="row" gap={4} justify="end">
              <Button variant="secondary" onClick={closeAdding}>{t('cancel')}</Button>
              <Button data-testid="simple-add-submit" type="submit" variant="primary" disabled={!name.trim()}>{t('create')}</Button>
            </Stack>
          </Stack>
        </form>
      </Modal>
      <Modal title={renameTitle} isOpen={!!renameTarget} close={onCloseRename}>
        <form onSubmit={handleRenameSubmit}>
          <Stack direction="column" gap={4}>
            <Stack direction="column" gap={2}>
              <Label htmlFor="simple-rename-name">{renameTarget?.kind === 'mode' ? t('simpleView.modeName') : t('simpleView.collectionName')}</Label>
              <TextInput
                autoFocus
                id="simple-rename-name"
                value={name}
                onChange={handleChangeName}
                type="text"
                required
                data-testid="simple-rename-input"
              />
            </Stack>
            <Stack direction="row" gap={4} justify="end">
              <Button variant="secondary" onClick={onCloseRename}>{t('cancel')}</Button>
              <Button type="submit" variant="primary" disabled={!name.trim()} data-testid="simple-rename-submit">{t('change')}</Button>
            </Stack>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
