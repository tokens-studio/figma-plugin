import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { useShortcut } from '@/hooks/useShortcut';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import CompositionTokenForm from './CompositionTokenForm';
import Input from './Input';
import useConfirm from '../hooks/useConfirm';
import useTokens from '../store/useTokens';
import {
  EditTokenObject, SingleBoxShadowToken, SingleDimensionToken, SingleToken,
} from '@/types/tokens';
import { checkIfAlias, checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import {
  activeTokenSetSelector, updateModeSelector, editTokenSelector, themesListSelector,
} from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';
import TypographyInput from './TypographyInput';
import Stack from './Stack';
import DownshiftInput from './DownshiftInput';
import Button from './Button';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { UpdateMode } from '@/constants/UpdateMode';
import trimValue from '@/utils/trimValue';
import BoxShadowInput from './BoxShadowInput';
import { EditTokenFormStatus } from '@/constants/EditTokenFormStatus';
import { StyleOptions } from '@/constants/StyleOptions';
import Textarea from './Textarea';
import Heading from './Heading';
import BorderTokenForm from './BorderTokenForm';
import Box from './Box';
import ColorTokenForm from './ColorTokenForm';
import { ColorModifier } from '@/types/Modifier';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

type Choice = { key: string; label: string; enabled?: boolean, unique?: boolean };

// @TODO this needs to be reviewed from a typings perspective + performance
function EditTokenForm({ resolvedTokens }: Props) {
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const editToken = useSelector(editTokenSelector);
  const themes = useSelector(themesListSelector);
  const updateMode = useSelector(updateModeSelector);
  const { editSingleToken, createSingleToken, duplicateSingleToken } = useManageTokens();
  const { remapToken, renameStylesFromTokens } = useTokens();
  const dispatch = useDispatch<Dispatch>();
  const [error, setError] = React.useState<string | null>(null);
  const [internalEditToken, setInternalEditToken] = React.useState<typeof editToken>(editToken);
  const { confirm } = useConfirm();

  const isValidDimensionToken = React.useMemo(() => internalEditToken.type === TokenTypes.DIMENSION && (internalEditToken.value?.endsWith('px') || internalEditToken.value?.endsWith('rem') || checkIfAlias(internalEditToken as SingleDimensionToken, resolvedTokens)), [internalEditToken, resolvedTokens, checkIfAlias]);
  const isValidColorToken = React.useMemo(() => {
    if (internalEditToken?.$extensions?.['com.figmatokens']?.modify?.type === ColorModifierTypes.MIX) {
      return !!internalEditToken?.$extensions?.['com.figmatokens']?.modify?.color;
    }
    return true;
  }, [internalEditToken]);

  const isValid = React.useMemo(() => {
    if (internalEditToken?.type === TokenTypes.COMPOSITION && internalEditToken.value
      && (internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0)) {
      return false;
    }
    if (internalEditToken.type === TokenTypes.DIMENSION) {
      return isValidDimensionToken;
    }
    if (internalEditToken.type === TokenTypes.COLOR) {
      return isValidColorToken;
    }
    return internalEditToken?.value && !error;
  }, [internalEditToken, error]);

  const hasNameThatExistsAlready = React.useMemo(
    () => resolvedTokens
      .filter((t) => t.internal__Parent === activeTokenSet)
      .find((t) => t.name === internalEditToken?.name),
    [internalEditToken, resolvedTokens, activeTokenSet],
  );

  const hasAnotherTokenThatStartsWithName = React.useMemo(
    () => resolvedTokens
      .filter((t) => t.internal__Parent === activeTokenSet)
      .filter((t) => t.name !== internalEditToken?.initialName)
      .find((t) => t.name.startsWith(`${internalEditToken?.name}.`)),
    [internalEditToken, resolvedTokens, activeTokenSet],
  );

  const hasPriorTokenName = React.useMemo(
    () => resolvedTokens
      .filter((t) => t.internal__Parent === activeTokenSet)
      .find((t) => t.type === internalEditToken.type && internalEditToken.name?.startsWith(`${t.name}.`)),
    [internalEditToken, resolvedTokens, activeTokenSet],
  );

  const nameWasChanged = React.useMemo(() => internalEditToken?.initialName !== internalEditToken?.name, [
    internalEditToken,
  ]);

  React.useEffect(() => {
    if ((internalEditToken?.status !== EditTokenFormStatus.EDIT || nameWasChanged) && hasNameThatExistsAlready) {
      setError('Token names must be unique');
    }
    if ((internalEditToken?.status !== EditTokenFormStatus.EDIT || nameWasChanged) && hasAnotherTokenThatStartsWithName) {
      setError('Must not use name of another group');
    }
    if ((internalEditToken?.status || nameWasChanged) && hasPriorTokenName) {
      setError('Tokens can\'t share name with a group');
    }
  }, [internalEditToken, hasNameThatExistsAlready, nameWasChanged, hasPriorTokenName, hasAnotherTokenThatStartsWithName]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleBlur = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    () => {
      if (internalEditToken.type === TokenTypes.DIMENSION && !isValidDimensionToken) {
        setError('Value must include either px or rem');
      }
    },
    [internalEditToken, isValidDimensionToken],
  );

  const handleBoxShadowValueChange = React.useCallback(
    (shadow: SingleBoxShadowToken['value']) => {
      setError(null);
      if (internalEditToken?.type === TokenTypes.BOX_SHADOW) {
        setInternalEditToken((prev) => ({ ...prev, value: shadow } as typeof editToken));
      }
    },
    [internalEditToken],
  );

  const handleCompositionChange = React.useCallback(
    (newTokenValue: NodeTokenRefMap) => {
      if (internalEditToken?.type === TokenTypes.COMPOSITION) {
        setInternalEditToken((prev) => ({ ...prev, value: newTokenValue } as EditTokenObject));
      }
    },
    [internalEditToken],
  );

  const handleBoxShadowAliasValueChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleTypographyValueChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      e.persist();
      if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof internalEditToken?.value !== 'string') {
        setInternalEditToken({
          ...internalEditToken,
          value: {
            ...internalEditToken.value,
            [e.target.name]: e.target.value,
          },
        });
      }
    },
    [internalEditToken],
  );

  const handleTypographyAliasValueChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleTypographyValueDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
    if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof internalEditToken?.value !== 'string') {
      setInternalEditToken({
        ...internalEditToken,
        value: { ...internalEditToken.value, [property]: newInputValue },
      });
    }
  }, [internalEditToken]);

  const handleBorderValueChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      e.persist();
      if (internalEditToken?.type === TokenTypes.BORDER && typeof internalEditToken?.value !== 'string') {
        setInternalEditToken({
          ...internalEditToken,
          value: {
            ...internalEditToken.value,
            [e.target.name]: e.target.value,
          },
        });
      }
    },
    [internalEditToken],
  );

  const handleBorderValueDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
    if (internalEditToken?.type === TokenTypes.BORDER && typeof internalEditToken?.value !== 'string') {
      setInternalEditToken({
        ...internalEditToken,
        value: { ...internalEditToken.value, [property]: newInputValue },
      });
    }
  }, [internalEditToken]);

  const handleColorModifyChange = React.useCallback((newModify: ColorModifier) => {
    setInternalEditToken({
      ...internalEditToken,
      $extensions: {
        'com.figmatokens': {
          modify: newModify,
        },
      },
    });
  }, [internalEditToken]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setInternalEditToken({
      ...internalEditToken,
      value: newInputValue,
    } as typeof editToken);
  }, [internalEditToken]);

  const handleDescriptionChange = React.useCallback(
    (val: string) => {
      if (internalEditToken) {
        setInternalEditToken({
          ...internalEditToken,
          description: val,
        });
      }
    },
    [internalEditToken],
  );

  // @TODO update to useCallback
  const submitTokenValue = async ({
    type, value, name, $extensions,
  }: EditTokenObject) => {
    if (internalEditToken && value && name) {
      let oldName;
      if (internalEditToken.initialName !== name && internalEditToken.initialName) {
        oldName = internalEditToken.initialName;
      }

      const trimmedValue = trimValue(value);
      const newName = name
        .split('/')
        .map((n) => n.trim())
        .join('.');
      if (internalEditToken.status === EditTokenFormStatus.CREATE) {
        track('Create token', { type: internalEditToken.type });
        createSingleToken({
          description: (
            internalEditToken.description
            ?? internalEditToken.oldDescription
          ),
          parent: activeTokenSet,
          name: newName,
          type,
          value: trimmedValue as SingleToken['value'],
          ...($extensions ? { $extensions } : {}),
        });
      } else if (internalEditToken.status === EditTokenFormStatus.EDIT) {
        editSingleToken({
          description: (
            internalEditToken.description
            ?? internalEditToken.oldDescription
          ),
          parent: activeTokenSet,
          name: newName,
          oldName,
          type,
          value: trimmedValue as SingleToken['value'],
          ...($extensions ? { $extensions } : {}),
        });
        // When users change token names references are still pointing to the old name, ask user to remap
        if (oldName && oldName !== newName) {
          track('Edit token', { renamed: true, type: internalEditToken.type });
          const choices: Choice[] = [
            {
              key: UpdateMode.SELECTION, label: 'Selection', unique: true, enabled: UpdateMode.SELECTION === updateMode,
            },
            {
              key: UpdateMode.PAGE, label: 'Page', unique: true, enabled: UpdateMode.PAGE === updateMode,
            },
            {
              key: UpdateMode.DOCUMENT, label: 'Document', unique: true, enabled: UpdateMode.DOCUMENT === updateMode,
            },
          ];
          if (themes.length > 0 && [TokenTypes.COLOR, TokenTypes.TYPOGRAPHY, TokenTypes.BOX_SHADOW].includes(internalEditToken.type)) {
            choices.push({
              key: StyleOptions.RENAME, label: 'Rename styles',
            });
          }

          const shouldRemap = await confirm({
            text: `Remap all tokens that use ${oldName} to ${newName}?`,
            description: 'This will change all layers that used the old token name. This could take a while.',
            choices,
          });
          if (shouldRemap) {
            remapToken(oldName, newName, shouldRemap.data[0]);
            dispatch.settings.setUpdateMode(shouldRemap.data[0]);
            if (shouldRemap.data.includes(StyleOptions.RENAME)) {
              renameStylesFromTokens({ oldName, newName, parent: activeTokenSet });
            }
          }
        } else {
          track('Edit token', { renamed: false });
        }
      } else if (internalEditToken.status === EditTokenFormStatus.DUPLICATE) {
        oldName = internalEditToken.initialName?.slice(0, internalEditToken.initialName?.lastIndexOf('-copy'));
        duplicateSingleToken({
          description: (
            internalEditToken.description
            ?? internalEditToken.oldDescription
          ),
          parent: activeTokenSet,
          newName,
          oldName,
          type,
          value: trimmedValue as SingleToken['value'],
          ...($extensions ? { $extensions } : {}),
        });
      }
    }
  };

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isValid && internalEditToken) {
        submitTokenValue(internalEditToken);
        dispatch.uiState.setShowEditForm(false);
      }
    },
    [dispatch, isValid, internalEditToken, submitTokenValue],
  );

  const handleSaveShortcut = React.useCallback((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) {
      if (isValid && internalEditToken) {
        submitTokenValue(internalEditToken);
        dispatch.uiState.setShowEditForm(false);
      }
    }
  }, [handleSubmit, submitTokenValue, dispatch, internalEditToken, isValid]);

  useShortcut(['Enter'], handleSaveShortcut);

  const handleReset = React.useCallback(() => {
    dispatch.uiState.setShowEditForm(false);
  }, [dispatch]);

  const resolvedValue = React.useMemo(() => {
    if (internalEditToken) {
      return typeof internalEditToken?.value === 'string'
        ? getAliasValue(internalEditToken.value, resolvedTokens)
        : null;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const renderTokenForm = () => {
    if (!internalEditToken) return null;

    switch (internalEditToken.type) {
      case TokenTypes.BOX_SHADOW: {
        return (
          <BoxShadowInput
            handleBoxShadowValueChange={handleBoxShadowValueChange}
            handleBoxShadowAliasValueChange={handleBoxShadowAliasValueChange}
            resolvedTokens={resolvedTokens}
            internalEditToken={internalEditToken}
            handleDownShiftInputChange={handleDownShiftInputChange}
          />
        );
      }
      case TokenTypes.TYPOGRAPHY: {
        return (
          <TypographyInput
            internalEditToken={internalEditToken}
            handleTypographyValueChange={handleTypographyValueChange}
            handleTypographyAliasValueChange={handleTypographyAliasValueChange}
            resolvedTokens={resolvedTokens}
            handleTypographyValueDownShiftInputChange={handleTypographyValueDownShiftInputChange}
            handleDownShiftInputChange={handleDownShiftInputChange}
          />
        );
      }
      case TokenTypes.COMPOSITION: {
        return (
          <CompositionTokenForm
            internalEditToken={internalEditToken}
            setTokenValue={handleCompositionChange}
            resolvedTokens={resolvedTokens}
          />
        );
      }
      case TokenTypes.BORDER: {
        return (
          <BorderTokenForm
            internalEditToken={internalEditToken}
            resolvedTokens={resolvedTokens}
            handleBorderValueChange={handleBorderValueChange}
            handleBorderValueDownShiftInputChange={handleBorderValueDownShiftInputChange}
          />
        );
      }
      case TokenTypes.COLOR: {
        return (
          <ColorTokenForm
            internalEditToken={internalEditToken}
            resolvedTokens={resolvedTokens}
            resolvedValue={resolvedValue}
            handleColorChange={handleChange}
            handleColorDownShiftInputChange={handleDownShiftInputChange}
            handleColorModifyChange={handleColorModifyChange}
          />
        );
      }
      default: {
        return (
          <div>
            <DownshiftInput
              value={internalEditToken.value}
              type={internalEditToken.type}
              label={internalEditToken.schema?.property}
              resolvedTokens={resolvedTokens}
              initialName={internalEditToken.initialName}
              handleChange={handleChange}
              handleBlur={handleBlur}
              setInputValue={handleDownShiftInputChange}
              placeholder="Value or {alias}"
              suffix
            />

            {checkIfContainsAlias(internalEditToken.value) && (
              <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
                {resolvedValue?.toString()}
              </div>
            )}
          </div>
        );
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={3} direction="column" justify="start">
        <Input
          required
          full
          label="Name"
          value={internalEditToken?.name}
          onChange={handleChange}
          type="text"
          autofocus
          name="name"
          error={error}
          placeholder="Unique name"
        />
        {renderTokenForm()}

        {internalEditToken?.schema?.explainer && <div className="mt-1 text-gray-600 text-xxs">{internalEditToken.schema.explainer}</div>}
        <Box>
          <Heading size="xsmall">Description</Heading>
          <Textarea
            key="description"
            value={internalEditToken?.description || ''}
            placeholder="Optional description"
            onChange={handleDescriptionChange}
            rows={3}
            border
          />
        </Box>
        <Stack direction="row" justify="end" gap={2}>
          <Button variant="secondary" type="button" onClick={handleReset}>
            Cancel
          </Button>
          <Button disabled={!isValid} variant="primary" type="submit">
            {internalEditToken?.status === EditTokenFormStatus.CREATE && 'Create'}
            {internalEditToken?.status === EditTokenFormStatus.EDIT && 'Save'}
            {(
              internalEditToken?.status !== EditTokenFormStatus.CREATE
              && internalEditToken?.status !== EditTokenFormStatus.EDIT
            ) && 'Duplicate'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export default EditTokenForm;
