import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import CompositionTokenForm from './CompositionTokenForm';
import Input from './Input';
import ColorPicker from './ColorPicker';
import useConfirm from '../hooks/useConfirm';
import useTokens from '../store/useTokens';
import { EditTokenObject, SingleBoxShadowToken } from '@/types/tokens';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { activeTokenSetSelector, editTokenSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';
import TypographyInput from './TypographyInput';
import Stack from './Stack';
import DownshiftInput from './DownshiftInput';
import Button from './Button';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { UpdateMode } from '@/constants/UpdateMode';
import BoxShadowInput from './BoxShadowInput';

type Props = {
  resolvedTokens: ResolveTokenValuesResult[];
};

// @TODO this needs to be reviewed from a typings perspective + performance
function EditTokenForm({ resolvedTokens }: Props) {
  const firstInput = React.useRef<HTMLInputElement | null>(null);
  const activeTokenSet = useSelector(activeTokenSetSelector);
  const editToken = useSelector(editTokenSelector);
  const { editSingleToken, createSingleToken } = useManageTokens();
  const { remapToken } = useTokens();
  const dispatch = useDispatch<Dispatch>();
  const [inputHelperOpen, setInputHelperOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [internalEditToken, setInternalEditToken] = React.useState<typeof editToken>(editToken);
  const { confirm } = useConfirm();

  React.useEffect(() => {
    console.log("useeff", internalEditToken)
  }, [internalEditToken])
  const isValid = React.useMemo(() => {
    if (internalEditToken?.type === TokenTypes.COMPOSITION && internalEditToken.value
      && (internalEditToken.value.hasOwnProperty('') || Object.keys(internalEditToken.value).length === 0)) {
      return false;
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
      .find((t) => t.name.startsWith(`${internalEditToken?.name}.`)),
    [internalEditToken, resolvedTokens, activeTokenSet],
  );

  const nameWasChanged = React.useMemo(() => internalEditToken?.initialName !== internalEditToken?.name, [
    internalEditToken,
  ]);

  React.useEffect(() => {
    if ((internalEditToken?.isPristine || nameWasChanged) && hasNameThatExistsAlready) {
      setError('Token names must be unique');
    }
    if ((internalEditToken?.isPristine || nameWasChanged) && hasAnotherTokenThatStartsWithName) {
      setError('Must not use name of another group');
    }
  }, [internalEditToken, hasNameThatExistsAlready, nameWasChanged]);

  const handleToggleInputHelper = React.useCallback(() => {
    setInputHelperOpen(!inputHelperOpen);
  }, [inputHelperOpen]);

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

  const handleBoxShadowChange = React.useCallback(
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

  const handleBoxShadowChangeByAlias = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleColorValueChange = React.useCallback(
    (color: string) => {
      setError(null);
      if (internalEditToken?.type === TokenTypes.COLOR) {
        setInternalEditToken({ ...internalEditToken, value: color });
      }
    },
    [internalEditToken],
  );

  const handleTypographyChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
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

  const handleTypographyChangeByAlias = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
      }
    },
    [internalEditToken],
  );

  const handleTypographyDownShiftInputChange = React.useCallback((newInputValue: string, property: string) => {
    if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof internalEditToken?.value !== 'string') {
      setInternalEditToken({
        ...internalEditToken,
        value: { ...internalEditToken.value, [property]: newInputValue },
      });
    }
  }, [internalEditToken]);

  const handleDownShiftInputChange = React.useCallback((newInputValue: string) => {
    setInternalEditToken({
      ...internalEditToken,
      value: newInputValue,
    } as typeof editToken);
  }, [internalEditToken]);

  const handleDescriptionChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({
          ...internalEditToken,
          description: e.target.value,
        });
      }
    },
    [internalEditToken],
  );

  // @TODO update to useCallback
  const submitTokenValue = async ({ type, value, name }: EditTokenObject) => {
    if (internalEditToken && value && name) {
      let oldName;
      if (internalEditToken.initialName !== name && internalEditToken.initialName) {
        oldName = internalEditToken.initialName;
      }

      const newName = name
        .split('/')
        .map((n) => n.trim())
        .join('.');
      console.log("isPristine", internalEditToken)
      if (internalEditToken.isPristine) {
        track('Create token', { type: internalEditToken.type });
        createSingleToken({
          description: (
            internalEditToken.description
            ?? internalEditToken.oldDescription
          ),
          parent: activeTokenSet,
          name: newName,
          type,
          value,
        });
      } else {
        editSingleToken({
          description: (
            internalEditToken.description
            ?? internalEditToken.oldDescription
          ),
          parent: activeTokenSet,
          name: newName,
          oldName,
          type,
          value,
        });
        // When users change token names references are still pointing to the old name, ask user to remap
        if (oldName && oldName !== newName) {
          track('Edit token', { renamed: true, type: internalEditToken.type });

          const shouldRemap = await confirm({
            text: `Remap all tokens that use ${oldName} to ${newName}?`,
            description: 'This will change all layers that used the old token name. This could take a while.',
            choices: [
              { key: UpdateMode.SELECTION, label: 'Selection', unique: true },
              {
                key: UpdateMode.PAGE,
                label: 'Page',
                enabled: true,
                unique: true,
              },
              { key: UpdateMode.DOCUMENT, label: 'Document', unique: true },
            ],
          });

          if (shouldRemap) {
            remapToken(oldName, newName, shouldRemap.data[0]);
          }
        } else {
          track('Edit token', { renamed: false });
        }
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
    [dispatch, isValid, internalEditToken],
  );

  const handleReset = React.useCallback(() => {
    dispatch.uiState.setShowEditForm(false);
  }, [dispatch]);

  React.useEffect(() => {
    setTimeout(() => {
      firstInput.current?.focus();
    }, 50);
  }, []);

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
            handleBoxShadowChange={handleBoxShadowChange}
            handleBoxShadowChangeByAlias={handleBoxShadowChangeByAlias}
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
            handleTypographyChange={handleTypographyChange}
            handleTypographyChangeByAlias={handleTypographyChangeByAlias}
            resolvedTokens={resolvedTokens}
            handleTypographyDownShiftInputChange={handleTypographyDownShiftInputChange}
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
      default: {
        return (
          <div>
            <DownshiftInput
              value={internalEditToken.value}
              type={internalEditToken.type}
              label={internalEditToken.schema?.property}
              resolvedTokens={resolvedTokens}
              handleChange={handleChange}
              setInputValue={handleDownShiftInputChange}
              placeholder={
                internalEditToken.type === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
              }
              prefix={
                internalEditToken.type === 'color' && (
                  <button
                    type="button"
                    className="block w-4 h-4 rounded-sm cursor-pointer shadow-border shadow-gray-300 focus:shadow-focus focus:shadow-primary-400"
                    style={{ background: internalEditToken.value, fontSize: 0 }}
                    onClick={handleToggleInputHelper}
                  >
                    {internalEditToken.value}
                  </button>
                )
              }
              suffix
            />

            {inputHelperOpen && internalEditToken.type === 'color' && (
              <ColorPicker value={internalEditToken.value} onChange={handleColorValueChange} />
            )}
            {checkIfContainsAlias(internalEditToken.value) && (
              <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
                {internalEditToken.type === 'color' ? (
                  <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: String(resolvedValue) }} />
                ) : null}
                {resolvedValue}
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
          name="name"
          inputRef={firstInput}
          error={error}
          placeholder="Unique name"
        />
        {renderTokenForm()}

        {internalEditToken?.schema?.explainer && <div className="mt-1 text-gray-600 text-xxs">{internalEditToken.schema.explainer}</div>}
        <Input
          full
          key="description"
          label="description"
          value={internalEditToken?.description}
          onChange={handleDescriptionChange}
          type="text"
          name="description"
          capitalize
        />
        <Stack direction="row" justify="end" gap={2}>
          <Button variant="secondary" type="button" onClick={handleReset}>
            Cancel
          </Button>
          <Button disabled={!isValid} variant="primary" type="submit">
            {internalEditToken?.isPristine ? 'Create' : 'Update'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export default EditTokenForm;
