import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Badge, Box, Button, DropdownMenu, EmptyState, IconButton, Stack, TextInput,
} from '@tokens-studio/ui';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { NavArrowDown, NavArrowUp } from 'iconoir-react';
import Modal from '../Modal';
import Text from '../Text';
import IconPlus from '@/icons/plus.svg';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import { editProhibitedSelector, studioSimpleWritePendingSelector } from '@/selectors';
import type { StudioSimpleCollection, StudioSimpleMode, StudioSimpleView } from '@/types/StudioSimpleView';
import {
  addSimpleCollection,
  addSimpleMode,
  copySimpleModeValues,
  deleteSimpleCollection,
  deleteSimpleMode,
  renameSimpleCollection,
  renameSimpleMode,
  reorderSimpleModes,
  setSimpleDefaultMode,
} from '@/app/store/providers/tokens-studio/simpleViewActions';

type Editing =
  | { kind: 'newCollection' }
  | { kind: 'renameCollection'; collectionId: string }
  | { kind: 'newMode'; collectionId: string }
  | { kind: 'renameMode'; modeId: string };

type NameFormProps = {
  initialValue?: string;
  label: string;
  submitLabel: string;
  testId: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
};

function NameForm({
  initialValue = '', label, submitLabel, testId, onSubmit, onCancel,
}: NameFormProps) {
  const { t } = useTranslation(['tokens']);
  const [value, setValue] = useState(initialValue);
  // Waits for the write before it, so it acts on the collections and modes that write left.
  const writePending = useSelector(studioSimpleWritePendingSelector);
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value), []);
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = value.trim();
    if (name && !writePending) onSubmit(name);
  }, [onSubmit, value, writePending]);
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // Close the form, not the modal.
      event.stopPropagation();
      onCancel();
    }
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} data-testid={`${testId}-form`}>
      <Stack direction="row" gap={2} align="center" css={{ padding: '$2 0' }}>
        <TextInput
          autoFocus
          aria-label={label}
          placeholder={label}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          data-testid={`${testId}-input`}
        />
        <Button size="small" variant="secondary" onClick={onCancel}>{t('cancel')}</Button>
        <Button size="small" variant="primary" type="submit" disabled={!value.trim() || writePending} data-testid={`${testId}-submit`}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}

type ModeRowProps = {
  collection: StudioSimpleCollection;
  mode: StudioSimpleMode;
  index: number;
  disabled: boolean;
  editing: Editing | null;
  setEditing: (editing: Editing | null) => void;
};

function ModeRow({
  collection, mode, index, disabled, editing, setEditing,
}: ModeRowProps) {
  const { t } = useTranslation(['tokens']);
  const { confirm } = useConfirm();
  const isDefault = collection.defaultModeId === mode.id;
  const isOnlyMode = collection.modes.length === 1;
  const otherModes = collection.modes.filter((other) => other.id !== mode.id);

  const move = useCallback((offset: number) => {
    const ids = collection.modes.map((m) => m.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + offset, 0, moved);
    reorderSimpleModes(collection, ids);
  }, [collection, index]);
  const handleMoveUp = useCallback(() => move(-1), [move]);
  const handleMoveDown = useCallback(() => move(1), [move]);
  const handleRename = useCallback(() => setEditing({ kind: 'renameMode', modeId: mode.id }), [mode.id, setEditing]);
  const handleSetDefault = useCallback(() => setSimpleDefaultMode(collection, mode), [collection, mode]);
  const handleDelete = useCallback(async () => {
    if (await confirm({ text: t('simpleView.confirmDeleteMode', { name: mode.name }), confirmAction: t('delete'), variant: 'danger' })) {
      deleteSimpleMode(mode);
    }
  }, [confirm, mode, t]);
  const handleCopyFrom = useCallback(async (from: StudioSimpleMode) => {
    if (await confirm({ text: t('simpleView.confirmCopyValues', { into: mode.name, from: from.name }), confirmAction: t('simpleView.copyValues') })) {
      copySimpleModeValues(mode, from);
    }
  }, [confirm, mode, t]);
  const handleRenameSubmit = useCallback((name: string) => {
    setEditing(null);
    if (name !== mode.name) renameSimpleMode(mode, name);
  }, [mode, setEditing]);
  const handleCancel = useCallback(() => setEditing(null), [setEditing]);

  if (editing?.kind === 'renameMode' && editing.modeId === mode.id) {
    return (
      <Box css={{ paddingLeft: '$4' }}>
        <NameForm initialValue={mode.name} label={t('simpleView.modeName')} submitLabel={t('simpleView.save')} testId="simple-rename-mode" onSubmit={handleRenameSubmit} onCancel={handleCancel} />
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      align="center"
      justify="between"
      data-testid={`simple-mode-${collection.name}-${mode.name}`}
      css={{ padding: '$2 $2 $2 $4', borderRadius: '$small', '&:hover': { backgroundColor: '$bgSubtle' } }}
    >
      <Stack direction="row" align="center" gap={2}>
        <Text>{mode.name}</Text>
        {isDefault && <Badge>{t('simpleView.default')}</Badge>}
      </Stack>
      <Stack direction="row" align="center" gap={1}>
        <IconButton
          icon={<NavArrowUp />}
          size="small"
          variant="invisible"
          tooltip={t('simpleView.moveUp')}
          disabled={disabled || index === 0}
          onClick={handleMoveUp}
          data-testid={`simple-mode-${mode.name}-up`}
        />
        <IconButton
          icon={<NavArrowDown />}
          size="small"
          variant="invisible"
          tooltip={t('simpleView.moveDown')}
          disabled={disabled || index === collection.modes.length - 1}
          onClick={handleMoveDown}
          data-testid={`simple-mode-${mode.name}-down`}
        />
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton
              icon={<Box css={{ transform: 'scale(0.75)' }}><DotsVerticalIcon /></Box>}
              size="small"
              variant="invisible"
              tooltip={t('simpleView.modeOptions')}
              disabled={disabled}
              data-testid={`simple-mode-${mode.name}-menu`}
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="bottom" align="end">
              <DropdownMenu.Item onSelect={handleRename}>{t('simpleView.rename')}</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={handleSetDefault} disabled={isDefault}>{t('simpleView.setAsDefault')}</DropdownMenu.Item>
              <DropdownMenu.Sub>
                {/* The default mode holds every token; Studio copies values into the other modes only. */}
                <DropdownMenu.SubTrigger disabled={isDefault || otherModes.length === 0}>{t('simpleView.copyValuesFrom')}</DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent>
                    {otherModes.map((other) => (
                      // eslint-disable-next-line react/jsx-no-bind
                      <DropdownMenu.Item key={other.id} onSelect={() => handleCopyFrom(other)}>{other.name}</DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={handleDelete} disabled={isOnlyMode}>
                {isOnlyMode ? t('simpleView.lastModeHint') : t('simpleView.deleteMode')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu>
      </Stack>
    </Stack>
  );
}

type CollectionSectionProps = {
  collection: StudioSimpleCollection;
  disabled: boolean;
  editing: Editing | null;
  setEditing: (editing: Editing | null) => void;
};

function CollectionSection({
  collection, disabled, editing, setEditing,
}: CollectionSectionProps) {
  const { t } = useTranslation(['tokens']);
  const { confirm } = useConfirm();
  const handleRename = useCallback(() => setEditing({ kind: 'renameCollection', collectionId: collection.id }), [collection.id, setEditing]);
  const handleAddMode = useCallback(() => setEditing({ kind: 'newMode', collectionId: collection.id }), [collection.id, setEditing]);
  const handleDelete = useCallback(async () => {
    if (await confirm({
      text: t('simpleView.confirmDeleteCollection', { name: collection.name, count: collection.modes.length }),
      confirmAction: t('delete'),
      variant: 'danger',
    })) {
      deleteSimpleCollection(collection);
    }
  }, [collection, confirm, t]);
  const handleCancel = useCallback(() => setEditing(null), [setEditing]);
  const handleRenameSubmit = useCallback((name: string) => {
    setEditing(null);
    if (name !== collection.name) renameSimpleCollection(collection, name);
  }, [collection, setEditing]);
  const handleAddModeSubmit = useCallback((name: string) => {
    setEditing(null);
    addSimpleMode(collection, name);
  }, [collection, setEditing]);

  const isRenaming = editing?.kind === 'renameCollection' && editing.collectionId === collection.id;
  const isAddingMode = editing?.kind === 'newMode' && editing.collectionId === collection.id;

  return (
    <Box data-testid={`simple-collection-${collection.name}`} css={{ '&:not(:first-of-type)': { marginTop: '$5' } }}>
      {isRenaming ? (
        <NameForm initialValue={collection.name} label={t('simpleView.collectionName')} submitLabel={t('simpleView.save')} testId="simple-rename-collection" onSubmit={handleRenameSubmit} onCancel={handleCancel} />
      ) : (
        <Stack direction="row" align="center" justify="between" css={{ padding: '$1 $2' }}>
          <Text bold>{collection.name}</Text>
          <Stack direction="row" align="center" gap={1}>
            <Button size="small" variant="invisible" icon={<IconPlus />} disabled={disabled} onClick={handleAddMode} data-testid={`simple-collection-${collection.name}-add-mode`}>
              {t('simpleView.addMode')}
            </Button>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <IconButton
                  icon={<Box css={{ transform: 'scale(0.75)' }}><DotsVerticalIcon /></Box>}
                  size="small"
                  variant="invisible"
                  tooltip={t('simpleView.collectionOptions')}
                  disabled={disabled}
                  data-testid={`simple-collection-${collection.name}-menu`}
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content side="bottom" align="end">
                  <DropdownMenu.Item onSelect={handleRename}>{t('simpleView.rename')}</DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onSelect={handleDelete}>{t('simpleView.deleteCollection')}</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu>
          </Stack>
        </Stack>
      )}
      {collection.modes.map((mode, index) => (
        <ModeRow key={mode.id} collection={collection} mode={mode} index={index} disabled={disabled} editing={editing} setEditing={setEditing} />
      ))}
      {isAddingMode && (
        <Box css={{ paddingLeft: '$4' }}>
          <NameForm label={t('simpleView.modeName')} submitLabel={t('simpleView.add')} testId="simple-new-mode" onSubmit={handleAddModeSubmit} onCancel={handleCancel} />
        </Box>
      )}
    </Box>
  );
}

/**
 * Manage Themes for a Tokens Studio project in Simple view (Studio ADR-182): collections and their modes,
 * without token sets. Studio gives each mode one set and picks every mode's sets itself.
 */
export function SimpleViewThemesModal({ simpleView }: { simpleView: StudioSimpleView }) {
  const dispatch = useDispatch<Dispatch>();
  const { t } = useTranslation(['tokens']);
  const editProhibited = useSelector(editProhibitedSelector);
  // While a write and the pull after it run, every action waits: it would act on the collections before it.
  const writePending = useSelector(studioSimpleWritePendingSelector);
  const disabled = editProhibited || writePending;
  const [editing, setEditing] = useState<Editing | null>(null);

  const handleClose = useCallback(() => dispatch.uiState.setManageThemesModalOpen(false), [dispatch]);
  const handleNewCollection = useCallback(() => setEditing({ kind: 'newCollection' }), []);
  const handleCancel = useCallback(() => setEditing(null), []);
  const handleNewCollectionSubmit = useCallback((name: string) => {
    setEditing(null);
    addSimpleCollection(name);
  }, []);
  const handleEscapeKeyDown = useCallback((event: KeyboardEvent) => {
    if (editing) {
      event.preventDefault();
      setEditing(null);
    }
  }, [editing]);

  return (
    <Modal
      id="manage-themes-modal"
      isOpen
      full
      title={t('simpleView.collections')}
      stickyFooter
      showClose
      close={handleClose}
      onEscapeKeyDown={handleEscapeKeyDown}
      footer={(
        <Stack gap={2} direction="row" justify="end">
          <Button
            data-testid="button-simple-new-collection"
            variant="secondary"
            icon={<IconPlus />}
            disabled={disabled}
            onClick={handleNewCollection}
          >
            {t('simpleView.newCollection')}
          </Button>
        </Stack>
      )}
    >
      <Box css={{ padding: '$3 $4' }} data-testid="simple-view-themes">
        <Text muted size="small" css={{ display: 'block', marginBottom: '$4' }}>{t('simpleView.explainer')}</Text>
        {simpleView.collections.length === 0 && editing?.kind !== 'newCollection' && (
          <EmptyState
            css={{ padding: '$8 $4' }}
            title={t('simpleView.emptyTitle')}
            description={t('simpleView.emptyDescription')}
          />
        )}
        {simpleView.collections.map((collection) => (
          <CollectionSection
            key={collection.id}
            collection={collection}
            disabled={disabled}
            editing={editing}
            setEditing={setEditing}
          />
        ))}
        {editing?.kind === 'newCollection' && (
          <NameForm label={t('simpleView.collectionName')} submitLabel={t('simpleView.add')} testId="simple-new-collection" onSubmit={handleNewCollectionSubmit} onCancel={handleCancel} />
        )}
      </Box>
    </Modal>
  );
}
