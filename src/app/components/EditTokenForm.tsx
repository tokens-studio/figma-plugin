import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { track } from '@/utils/analytics';
import { useShortcut } from '@/hooks/useShortcut';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import CompositionTokenForm from './CompositionTokenForm';
import Input from './Input';
import Text from './Text';
import useConfirm from '../hooks/useConfirm';
import useTokens from '../store/useTokens';
import {
  EditTokenObject, SingleBoxShadowToken, SingleDimensionToken, SingleToken, SingleTypographyToken,
} from '@/types/tokens';
import { checkIfAlias, checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/utils/tokenHelpers';
import {
  activeTokenSetSelector, editTokenSelector, themesListSelector, tokensSelector,
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
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { tokenTypesToCreateVariable } from '@/constants/VariableTypes';
import { ModalOptions } from '@/constants/ModalOptions';

let lastUsedRenameOption: UpdateMode = UpdateMode.SELECTION;
let lastUsedRenameStyles = false;

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

type Choice = { key: string; label: string; enabled?: boolean, unique?: boolean };

// @TODO this needs to be reviewed from a typings perspective + performance
function EditTokenForm({ resolvedTokens }: Props) {
  const { t } = useTranslation(['tokens', 'errors']);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const tokens = useSelector(tokensSelector);
  const editToken = useSelector(editTokenSelector);
  const themes = useSelector(themesListSelector);
  const [selectedTokenSets, setSelectedTokenSets] = React.useState<string[]>([activeTokenSet]);
  const {
    editSingleToken, createSingleToken, duplicateSingleToken, renameTokensAcrossSets,
  } = useManageTokens();
  const {
    remapToken, renameStylesFromTokens, renameVariablesFromToken, updateVariablesFromToken,
  } = useTokens();
  const dispatch = useDispatch<Dispatch>();
  const [error, setError] = React.useState<string | null>(null);
  const [internalEditToken, setInternalEditToken] = React.useState<typeof editToken>(editToken);
  const { confirm } = useConfirm();
  const isValidDimensionToken = React.useMemo(() => internalEditToken.type === TokenTypes.DIMENSION && (internalEditToken.value?.endsWith('px') || internalEditToken.value?.endsWith('rem') || checkIfAlias(internalEditToken as SingleDimensionToken, resolvedTokens)), [internalEditToken, resolvedTokens, checkIfAlias]);
  const isValidColorToken = React.useMemo(() => {
    if (internalEditToken?.$extensions?.['studio.tokens']?.modify?.type === ColorModifierTypes.MIX) {
      return !!internalEditToken?.$extensions?.['studio.tokens']?.modify?.color;
    }
    return true;
  }, [internalEditToken]);

  const isValid = React.useMemo(() => {
    if (internalEditToken?.type === TokenTypes.COMPOSITION && internalEditToken.value
      && (internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0)) {
      return false;
    }
    if (internalEditToken.type === TokenTypes.DIMENSION) {
      return true;
    }
    if (internalEditToken.type === TokenTypes.COLOR) {
      return isValidColorToken;
    }
    return internalEditToken?.value && internalEditToken.name && !error;
  }, [internalEditToken, error, isValidColorToken, isValidDimensionToken]);

  const hasNameThatExistsAlready = React.useMemo(
    () => {
      const editToken = resolvedTokens
        .filter((t) => selectedTokenSets.includes(t.internal__Parent ?? ''))
        .find((t) => t.name === internalEditToken?.name);

      if (editToken) {
        editToken.description = internalEditToken.description;
      }

      return editToken;
    },
    [internalEditToken, resolvedTokens, activeTokenSet, selectedTokenSets],
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
      setError(t('tokenNamesMustBeUnique', { ns: 'errors' }));
    }
    if ((internalEditToken?.status !== EditTokenFormStatus.EDIT || nameWasChanged) && hasAnotherTokenThatStartsWithName) {
      setError(t('mustNotUseNameOfAnotherGroup', { ns: 'errors' }));
    }
    if ((internalEditToken?.status || nameWasChanged) && hasPriorTokenName) {
      setError(t('tokensCantShareNameWithGroup', { ns: 'errors' }));
    }
  }, [internalEditToken, hasNameThatExistsAlready, nameWasChanged, hasPriorTokenName, hasAnotherTokenThatStartsWithName, selectedTokenSets]);

  const handleChange = React.useCallback(
    (property: string, value: string) => {
      setError(null);
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [property]: value });
      }
    },
    [internalEditToken],
  );

  const handleNameChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleBlur = React.useCallback(
    () => {
      if (internalEditToken.type === TokenTypes.DIMENSION && !isValidDimensionToken) {
        setError(t('valueMustIncludePxOrRem', { ns: 'errors' }));
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

  const handleTypographyValueChange = React.useCallback(
    (property: string, value: string) => {
      if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof internalEditToken?.value !== 'string') {
        if (value) {
          setInternalEditToken({
            ...internalEditToken,
            value: {
              ...internalEditToken.value,
              [property]: value,
            },
          });
        } else if (internalEditToken.value) {
          delete internalEditToken.value[property as keyof typeof internalEditToken.value];
          setInternalEditToken({
            ...internalEditToken,
          });
        }
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

  const setTypographyValue = React.useCallback((newTypographyValue: SingleTypographyToken['value']) => {
    if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof newTypographyValue === 'object') {
      setInternalEditToken({
        ...internalEditToken,
        value: { ...newTypographyValue },
      });
    }
  }, [internalEditToken]);

  const handleBorderValueChange = React.useCallback(
    (property: string, value: string) => {
      if (internalEditToken?.type === TokenTypes.BORDER && typeof internalEditToken?.value !== 'string') {
        setInternalEditToken({
          ...internalEditToken,
          value: {
            ...internalEditToken.value,
            [property]: value,
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

  const removeColorModify = React.useCallback(() => {
    const newValue = { ...internalEditToken.$extensions?.['studio.tokens'] };
    delete newValue?.modify;
    setInternalEditToken({
      ...internalEditToken,
      $extensions: {
        ...internalEditToken.$extensions,
        'studio.tokens': Object.keys(newValue).length > 0 ? newValue : undefined,
      } as SingleToken['$extensions'],
    });
  }, [internalEditToken]);

  const handleColorModifyChange = React.useCallback((newModify: ColorModifier) => {
    setInternalEditToken({
      ...internalEditToken,
      $extensions: {
        ...internalEditToken.$extensions,
        'studio.tokens': {
          ...internalEditToken.$extensions?.['studio.tokens'],
          modify: newModify,
        },
      } as SingleToken['$extensions'],
    });
  }, [internalEditToken]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setInternalEditToken({
      ...internalEditToken,
      value: newInputValue,
    } as typeof editToken);
  }, [internalEditToken]);

  const handleDescriptionChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (internalEditToken) {
        setInternalEditToken({
          ...internalEditToken,
          description: e.target.value,
        });
      }
    },
    [internalEditToken],
  );

  const resolvedValue = React.useMemo(() => {
    if (internalEditToken) {
      return typeof internalEditToken?.value === 'string'
        ? getAliasValue(internalEditToken as SingleToken, resolvedTokens, false)
        : null;
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  // @TODO update to useCallback
  const submitTokenValue = async ({
    type, value, name, $extensions,
  }: EditTokenObject) => {
    if (internalEditToken && value && name) {
      let oldName: string | undefined;
      if (internalEditToken.initialName !== name && internalEditToken.initialName) {
        oldName = internalEditToken.initialName;
      }

      const trimmedValue = trimValue(value);
      const newName = name
        .split('/')
        .map((n) => n.trim())
        .join('.');
      if (internalEditToken.status === EditTokenFormStatus.CREATE) {
        track('Create token', { type: internalEditToken.type, isModifier: !!$extensions?.['studio.tokens']?.modify });
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
        if (themes.length > 0 && tokenTypesToCreateVariable.includes(internalEditToken.type)) {
          updateVariablesFromToken({
            parent: activeTokenSet,
            name: internalEditToken.initialName ?? name,
            type,
            value: resolvedValue,
            rawValue: internalEditToken.value,
            ...($extensions ? { $extensions } : {}),
          });
        }
        // When users change token names the applied tokens on layers are still pointing to the old name, ask user to remap
        if (oldName && oldName !== newName) {
          track('Edit token', { renamed: true, type: internalEditToken.type });
          const choices: Choice[] = [
            {
              key: UpdateMode.SELECTION, label: 'Selection', unique: true, enabled: UpdateMode.SELECTION === lastUsedRenameOption,
            },
            {
              key: UpdateMode.PAGE, label: 'Page', unique: true, enabled: UpdateMode.PAGE === lastUsedRenameOption,
            },
            {
              key: UpdateMode.DOCUMENT, label: 'Document', unique: true, enabled: UpdateMode.DOCUMENT === lastUsedRenameOption,
            },
          ];
          if (themes.length > 0 && [TokenTypes.COLOR, TokenTypes.TYPOGRAPHY, TokenTypes.BOX_SHADOW].includes(internalEditToken.type)) {
            choices.push({
              key: StyleOptions.RENAME, label: 'Rename styles', enabled: lastUsedRenameStyles,
            });
          }
          if (themes.length > 0 && tokenTypesToCreateVariable.includes(internalEditToken.type)) {
            choices.push({
              key: ModalOptions.RENAME_VARIABLE, label: 'Rename variable',
            });
          }
          const tokenSetsContainsSameToken: string[] = [];
          Object.entries(tokens).forEach(([tokenSet, tokenList]) => {
            if (tokenList.find((token) => token.name === oldName)) {
              tokenSetsContainsSameToken.push(tokenSet);
            }
          });
          if (tokenSetsContainsSameToken.length > 1) {
            choices.push({
              key: ModalOptions.RENAME_ACROSS_SETS, label: 'Rename in other sets',
            });
          }
          const confirmData = await confirm({
            text: `Remap all tokens that use ${oldName} to ${newName}?`,
            description: 'This will change all layers that used the old token name. This could take a while.',
            choices,
          });
          if (confirmData && confirmData.result) {
            if (confirmData.data.some((data: string) => [UpdateMode.DOCUMENT, UpdateMode.PAGE, UpdateMode.SELECTION].includes(data as UpdateMode))) {
              remapToken(oldName, newName, confirmData.data[0]);
              lastUsedRenameOption = confirmData.data[0] as UpdateMode;
            }
            if (confirmData.data.includes(ModalOptions.RENAME_ACROSS_SETS)) {
              renameTokensAcrossSets(oldName, newName, type, tokenSetsContainsSameToken);
            }
            if (confirmData.data.includes(StyleOptions.RENAME)) {
              renameStylesFromTokens([{ oldName, newName }], activeTokenSet);
              lastUsedRenameStyles = true;
            }
            if (confirmData.data.includes(ModalOptions.RENAME_VARIABLE)) {
              renameVariablesFromToken({ oldName, newName });
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
          tokenSets: selectedTokenSets,
          ...($extensions ? { $extensions } : {}),
        });
      }
    }
  };

  const checkAndSubmitTokenValue = React.useCallback(() => {
    if (internalEditToken.type === TokenTypes.DIMENSION && !isValidDimensionToken) {
      setError(t('valueMustIncludePxOrRem', { ns: 'errors' }));
      return;
    }
    if (isValid && internalEditToken) {
      submitTokenValue(internalEditToken);
      dispatch.uiState.setShowEditForm(false);
    }
  }, [dispatch, isValid, internalEditToken, submitTokenValue, isValidDimensionToken]);

  const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    checkAndSubmitTokenValue();
  }, [checkAndSubmitTokenValue]);

  const handleSaveShortcut = React.useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      checkAndSubmitTokenValue();
    }
  }, [checkAndSubmitTokenValue]);

  useShortcut(['Enter'], handleSaveShortcut);

  const handleReset = React.useCallback(() => {
    dispatch.uiState.setShowEditForm(false);
  }, [dispatch]);

  const handleSelectedItemChange = React.useCallback((selectedItems: string[]) => {
    setSelectedTokenSets(selectedItems);
    if (selectedItems.length > 0) setError(null);
  }, []);

  const renderTokenForm = () => {
    if (!internalEditToken) return null;

    switch (internalEditToken.type) {
      case TokenTypes.BOX_SHADOW: {
        return (
          <BoxShadowInput
            handleBoxShadowValueChange={handleBoxShadowValueChange}
            handleBoxShadowAliasValueChange={handleChange}
            resolvedTokens={resolvedTokens}
            internalEditToken={internalEditToken}
            handleDownShiftInputChange={handleDownShiftInputChange}
            onSubmit={checkAndSubmitTokenValue}
          />
        );
      }
      case TokenTypes.TYPOGRAPHY: {
        return (
          <TypographyInput
            internalEditToken={internalEditToken}
            handleTypographyValueChange={handleTypographyValueChange}
            handleTypographyAliasValueChange={handleChange}
            resolvedTokens={resolvedTokens}
            handleTypographyValueDownShiftInputChange={handleTypographyValueDownShiftInputChange}
            handleDownShiftInputChange={handleDownShiftInputChange}
            setTypographyValue={setTypographyValue}
            onSubmit={checkAndSubmitTokenValue}
          />
        );
      }
      case TokenTypes.COMPOSITION: {
        return (
          <CompositionTokenForm
            internalEditToken={internalEditToken}
            setTokenValue={handleCompositionChange}
            resolvedTokens={resolvedTokens}
            onSubmit={checkAndSubmitTokenValue}
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
            handleBorderAliasValueChange={handleChange}
            handleDownShiftInputChange={handleDownShiftInputChange}
            onSubmit={checkAndSubmitTokenValue}
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
            handleRemoveColorModify={removeColorModify}
            onSubmit={checkAndSubmitTokenValue}
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
              onSubmit={checkAndSubmitTokenValue}
            />

            {checkIfContainsAlias(internalEditToken.value) && (
              <Box css={{
                display: 'flex',
                padding: '$3',
                marginTop: '$3',
                fontFamily: '$mono',
                color: '$fgMuted',
                backgroundColor: '$bgSubtle',
                borderColor: '$borderSubtle',
                borderRadius: '$medium',
                fontSize: '$xxs',
                alignItems: 'center',
              }}
              >
                {resolvedValue?.toString()}
              </Box>
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
          label={t('name')}
          value={internalEditToken?.name}
          onChange={handleNameChange}
          type="text"
          autofocus
          name="name"
          error={error}
          placeholder={t('uniqueName')}
        />
        {renderTokenForm()}

        {internalEditToken?.schema?.explainer && <Text muted size="small">{internalEditToken.schema.explainer}</Text>}
        <Box>
          <Heading size="xsmall">{t('description')}</Heading>
          <Textarea
            key="description"
            value={internalEditToken?.description || ''}
            placeholder={t('optionalDescription')}
            onChange={handleDescriptionChange}
            rows={3}
            border
          />
        </Box>
        {
          internalEditToken.status === EditTokenFormStatus.DUPLICATE && (
            <Box>
              <Heading size="xsmall">{t('set', { ns: 'general' })}</Heading>
              <MultiSelectDropdown menuItems={Object.keys(tokens)} selectedItems={selectedTokenSets} handleSelectedItemChange={handleSelectedItemChange} />
            </Box>
          )
        }
        <Stack direction="row" justify="end" gap={2}>
          <Button variant="secondary" type="button" onClick={handleReset}>
            {t('cancel')}
          </Button>
          <Button disabled={!isValid} variant="primary" type="submit">
            {internalEditToken?.status === EditTokenFormStatus.CREATE && t('create')}
            {internalEditToken?.status === EditTokenFormStatus.EDIT && t('save')}
            {(
              internalEditToken?.status !== EditTokenFormStatus.CREATE
              && internalEditToken?.status !== EditTokenFormStatus.EDIT
            ) && t('duplicate')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export default EditTokenForm;
