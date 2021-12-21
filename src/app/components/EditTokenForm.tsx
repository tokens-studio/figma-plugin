import getAliasValue from '@/utils/aliases';
import {track} from '@/utils/analytics';
import checkIfContainsAlias from '@/utils/checkIfContainsAlias';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import useManageTokens from '../store/useManageTokens';
import BoxShadowInput from './BoxShadowInput';
import Input from './Input';
import ColorPicker from './ColorPicker';

const EditTokenForm = ({resolvedTokens}) => {
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {editSingleToken, createSingleToken} = useManageTokens();
    const {editToken} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();
    const [inputHelperOpen, setInputHelperOpen] = React.useState(false);
    const [error, setError] = React.useState(null);

    const isValid = React.useMemo(() => editToken.value && !error, [editToken, error]);

    const hasNameThatExistsAlready = React.useMemo(
        () =>
            resolvedTokens.filter((t) => t.internal__Parent === activeTokenSet).find((t) => t.name === editToken.name),
        [resolvedTokens, activeTokenSet]
    );
    const nameWasChanged = React.useMemo(() => editToken?.initialName !== editToken.name, [editToken]);

    React.useEffect(() => {
        if ((editToken.isPristine || nameWasChanged) && hasNameThatExistsAlready) {
            setError('Token names must be unique');
        }
    }, [editToken, hasNameThatExistsAlready, nameWasChanged]);

    const handleToggleInputHelper = React.useCallback(() => {
        setInputHelperOpen(!inputHelperOpen);
    }, [inputHelperOpen]);

    const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            setError(null);
            e.persist();
            dispatch.uiState.setEditToken({...editToken, [e.target.name]: e.target.value});
        },
        [dispatch, editToken]
    );

    const handleColorValueChange = React.useCallback(
        (color: string) => {
            setError(null);
            dispatch.uiState.setEditToken({...editToken, value: color});
        },
        [dispatch, editToken]
    );

    const handleObjectChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            e.persist();
            dispatch.uiState.setEditToken({...editToken, value: {...editToken.value, [e.target.name]: e.target.value}});
        },
        [dispatch, editToken]
    );

    const handleOptionsChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (e) => {
            e.persist();
            dispatch.uiState.setEditToken({
                ...editToken,
                options: {...editToken.options, [e.target.name]: e.target.value},
            });
        },
        [dispatch, editToken]
    );

    const submitTokenValue = async ({value, name, options}) => {
        track('Edit Token');

        let oldName;
        if (editToken.initialName !== name && editToken.initialName) {
            oldName = editToken.initialName;
        }
        const newName = name
            .split('/')
            .map((n) => n.trim())
            .join('.');
        if (editToken.isPristine) {
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
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) {
            submitTokenValue(editToken);
            dispatch.uiState.setShowEditForm(false);
        }
    };

    const handleReset = () => {
        dispatch.uiState.setShowEditForm(false);
    };

    const firstInput: React.RefObject<HTMLInputElement> = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => {
            firstInput.current.focus();
        }, 50);
    }, []);

    const resolvedValue = React.useMemo(() => {
        return typeof editToken.value === 'object' ? null : getAliasValue(editToken.value, resolvedTokens);
    }, [editToken, resolvedTokens]);

    const renderTokenForm = () => {
        switch (editToken.type) {
            case 'boxShadow': {
                return <BoxShadowInput />;
            }
            case 'typography': {
                return Object.entries(editToken.schema).map(([key, schemaValue]: [string, string]) => (
                    <Input
                        key={key}
                        full
                        label={key}
                        value={editToken.value[key]}
                        onChange={handleObjectChange}
                        type="text"
                        name={key}
                        custom={schemaValue}
                        required
                    />
                ));
            }
            default: {
                return (
                    <div>
                        <Input
                            full
                            label={editToken.property}
                            value={editToken.value}
                            onChange={handleChange}
                            type="text"
                            name="value"
                            required
                            custom={editToken.schema}
                            placeholder={
                                editToken.type === 'color' ? '#000000, hsla(), rgba() or {alias}' : 'Value or {alias}'
                            }
                            prefix={
                                editToken.type === 'color' && (
                                    <button
                                        type="button"
                                        className="block w-4 h-4 rounded-sm shadow-border shadow-gray-300 cursor-pointer"
                                        style={{background: editToken.value, fontSize: 0}}
                                        onClick={handleToggleInputHelper}
                                    >
                                        {editToken.value}
                                    </button>
                                )
                            }
                        />
                        {inputHelperOpen && editToken.type === 'color' && (
                            <ColorPicker value={editToken.value} onChange={handleColorValueChange} />
                        )}
                        {checkIfContainsAlias(editToken.value) && (
                            <div className="p-2 rounded bg-gray-100 border-gray-300 font-mono text-xxs mt-2 text-gray-700 flex itms-center">
                                {editToken.type === 'color' ? (
                                    <div
                                        className="w-4 h-4 rounded border border-gray-200 mr-1"
                                        style={{background: resolvedValue}}
                                    />
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
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-start">
            <Input
                required
                full
                label="Name"
                value={editToken.name}
                onChange={handleChange}
                type="text"
                name="name"
                inputRef={firstInput}
                error={error}
                placeholder="Unique name"
            />
            {renderTokenForm()}

            {editToken.explainer && <div className="mt-1 text-xxs text-gray-600">{editToken.explainer}</div>}
            {editToken.optionsSchema
                ? Object.entries(editToken.optionsSchema).map(([key, schemaValue]: [string, string]) => (
                      <Input
                          key={key}
                          full
                          label={key}
                          value={editToken.options[key]}
                          onChange={handleOptionsChange}
                          type="text"
                          name={key}
                          custom={schemaValue}
                          capitalize
                      />
                  ))
                : null}
            <div className="flex space-x-2 justify-end">
                <button className="button button-link" type="button" onClick={handleReset}>
                    Cancel
                </button>
                <button disabled={!isValid} className="button button-primary" type="submit">
                    {editToken.isPristine ? 'Create' : 'Update'}
                </button>
            </div>
        </form>
    );
};

export default EditTokenForm;
