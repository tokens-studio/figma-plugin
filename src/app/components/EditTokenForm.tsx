import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '@/stitches.config';
import { track } from '@/utils/analytics';
import IconDisclosure from '@/icons/disclosure.svg';
import { UpdateMode } from '@/types/state';
import { Dispatch } from '../store';
import useManageTokens from '../store/useManageTokens';
import BoxShadowInput from './BoxShadowInput';
import CompositionTokenForm from './CompositionTokenForm';
import Input from './Input';
import ColorPicker from './ColorPicker';
import useConfirm from '../hooks/useConfirm';
import useTokens from '../store/useTokens';
import { SingleBoxShadowToken, SingleCompositionToken } from '@/types/tokens';
import { checkIfContainsAlias, getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { activeTokenSetSelector, editTokenSelector } from '@/selectors';
import { TokenTypes } from '@/constants/TokenTypes';
import { EditTokenObject } from '../store/models/uiState';
import Stack from './Stack';
import DownshiftInput from './DownshiftInput';

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
  const [showAutoSuggest, setShowAutoSuggest] = React.useState<boolean>(false);
  const { confirm } = useConfirm();

  const isValid = React.useMemo(() => internalEditToken?.value && !error, [internalEditToken, error]);

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

  const handleAutoSuggest = React.useCallback(() => setShowAutoSuggest(!showAutoSuggest), [showAutoSuggest]);

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setError(null);
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({ ...internalEditToken, [e.target.name]: e.target.value });
        setShowAutoSuggest(false);
      }
    },
    [internalEditToken],
  );

  const handleShadowChange = React.useCallback(
    (shadow: SingleBoxShadowToken['value']) => {
      setError(null);
      if (internalEditToken?.type === TokenTypes.BOX_SHADOW) {
        setInternalEditToken({ ...internalEditToken, value: shadow });
      }
    },
    [internalEditToken],
  );

  const handleCompositionChange = React.useCallback(
    (style: SingleCompositionToken['value']) => {
      setError(null);
      if (internalEditToken?.type === TokenTypes.COMPOSITION) {
        setInternalEditToken({ ...internalEditToken, value: style });
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
      if (internalEditToken?.type === TokenTypes.TYPOGRAPHY && typeof internalEditToken?.value === 'object') {
        setInternalEditToken({
          ...internalEditToken,
          value: { ...internalEditToken.value, [e.target.name]: e.target.value },
        });
      }
    },
    [internalEditToken],
  );

  const handleOptionsChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      e.persist();
      if (internalEditToken) {
        setInternalEditToken({
          ...internalEditToken,
          options: { ...internalEditToken.options, [e.target.name]: e.target.value },
        });
      }
    },
    [internalEditToken],
  );

  // @TODO update to useCallback
  const submitTokenValue = async ({ value, name, options }: EditTokenObject) => {
    if (internalEditToken) {
      let oldName;
      if (internalEditToken.initialName !== name && internalEditToken.initialName) {
        oldName = internalEditToken.initialName;
      }

      const newName = name
        .split('/')
        .map((n) => n.trim())
        .join('.');

      if (internalEditToken.isPristine) {
        track('Create token', { type: internalEditToken.type });
        createSingleToken({
          parent: activeTokenSet,
          name: newName,
          value,
          options,
        });
      } else {
        editSingleToken({
          parent: activeTokenSet,
          name: newName,
          oldName,
          value,
          options,
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

  const StyledIconDisclosure = styled(IconDisclosure, {
    width: '16px',
    height: '16px',
    transition: 'transform 0.2s ease-in-out',
  });

  const StyledInputSuffix = styled('button', {
    width: '28px',
    height: '28px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const resolvedValue = React.useMemo(() => {
    if (internalEditToken) {
      return typeof internalEditToken?.value === 'object'
        ? null
        : getAliasValue(internalEditToken.value, resolvedTokens);
    }
    return null;
  }, [internalEditToken, resolvedTokens]);

  const renderTokenForm = () => {
    if (!internalEditToken) {
      return null;
    }
    switch (internalEditToken.type) {
      case 'boxShadow': {
        return <BoxShadowInput setValue={handleShadowChange} value={internalEditToken.value} />;
      }
      case 'typography': {
        return Object.entries(internalEditToken.schema ?? {}).map(([key, schemaValue]: [string, string]) => (
          <Input
            key={key}
            full
            label={key}
            value={internalEditToken.value[key]}
            onChange={handleTypographyChange}
            type="text"
            name={key}
            custom={schemaValue}
            required
          />
        ));
      }
      case 'composition': {
        return (
          <CompositionTokenForm
            value={internalEditToken.value}
            setValue={handleCompositionChange}
          />
        );
      }
      default: {
        return (
          <div>
            <DownshiftInput
              value={internalEditToken.value}
              type={internalEditToken.type}
              label={internalEditToken.property}
              showAutoSuggest={showAutoSuggest}
              resolvedTokens={resolvedTokens}
              handleChange={handleChange}
              setShowAutoSuggest={setShowAutoSuggest}
              setInputValue={(newInputValue: string) => setInternalEditToken({ ...internalEditToken, value: newInputValue })}
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
              suffix={(
                <StyledInputSuffix type="button" onClick={handleAutoSuggest}>
                  <StyledIconDisclosure />
                </StyledInputSuffix>
              )}
            />

            {inputHelperOpen && internalEditToken.type === 'color' && (
              <ColorPicker value={internalEditToken.value} onChange={handleColorValueChange} />
            )}
            {checkIfContainsAlias(internalEditToken.value) && (
              <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
                {internalEditToken.type === 'color' ? (
                  <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: resolvedValue }} />
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
    <form onSubmit={handleSubmit} className="flex flex-col justify-start space-y-4">
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

      {internalEditToken?.explainer && <div className="mt-1 text-gray-600 text-xxs">{internalEditToken.explainer}</div>}
      {internalEditToken?.optionsSchema
        ? Object.entries(internalEditToken?.optionsSchema).map(([key, schemaValue]: [string, string]) => (
          <Input
            key={key}
            full
            label={key}
            value={internalEditToken.options[key]}
            onChange={handleOptionsChange}
            type="text"
            name={key}
            custom={schemaValue}
            capitalize
          />
        ))
        : null}
      <Stack direction="row" justify="end" gap={2}>
        <button className="button button-link" type="button" onClick={handleReset}>
          Cancel
        </button>
        <button disabled={!isValid} className="button button-primary" type="submit">
          {internalEditToken?.isPristine ? 'Create' : 'Update'}
        </button>
      </Stack>
    </form>
  );
}

export default EditTokenForm;
