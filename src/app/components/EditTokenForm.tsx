import getAliasValue from '@/utils/aliases';
import {track} from '@/utils/analytics';
import checkIfContainsAlias from '@/utils/checkIfContainsAlias';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import useManageTokens from '../store/useManageTokens';
import Input from './Input';

const EditTokenForm = ({resolvedTokens}) => {
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {editSingleToken, createSingleToken} = useManageTokens();
    const {editToken} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();
    const [currentEditToken, setCurrentEditToken] = React.useState(editToken);
    const [error, setError] = React.useState(null);

    const isValid = currentEditToken.value && currentEditToken.name.match(/^\S*$/) && !error;

    const hasNameThatExistsAlready = resolvedTokens.find((t) => t.name === currentEditToken.name);
    const nameWasChanged = currentEditToken?.initialName !== currentEditToken.name;

    React.useEffect(() => {
        if ((currentEditToken.isPristine || nameWasChanged) && hasNameThatExistsAlready) {
            setError('Token names must be unique');
        }
    }, [currentEditToken, hasNameThatExistsAlready, nameWasChanged]);

    const handleChange = (e) => {
        setError(null);
        e.persist();
        setCurrentEditToken({...currentEditToken, [e.target.name]: e.target.value});
    };

    const handleObjectChange = (e) => {
        e.persist();
        setCurrentEditToken({
            ...currentEditToken,
            value: {...currentEditToken.value, [e.target.name]: e.target.value},
        });
    };

    const handleOptionsChange = (e) => {
        e.persist();
        setCurrentEditToken({
            ...currentEditToken,
            options: {...currentEditToken.options, [e.target.name]: e.target.value},
        });
    };

    const submitTokenValue = async ({value, name, options}) => {
        track('Edit Token');

        let oldName;
        if (currentEditToken.initialName !== name && currentEditToken.initialName) {
            oldName = currentEditToken.initialName;
        }
        const newName = name
            .split('/')
            .map((n) => n.trim())
            .join('.');
        if (currentEditToken.isPristine) {
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
            submitTokenValue(currentEditToken);
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
        return typeof currentEditToken.value === 'object'
            ? null
            : getAliasValue(currentEditToken.value, resolvedTokens);
    }, [currentEditToken, resolvedTokens]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-start">
            <Input
                required
                full
                label="Name"
                value={currentEditToken.name}
                onChange={handleChange}
                type="text"
                name="name"
                inputRef={firstInput}
                error={error}
            />
            {typeof currentEditToken.schema === 'object' ? (
                Object.entries(currentEditToken.schema).map(([key, schemaValue]: [string, string]) => (
                    <Input
                        key={key}
                        full
                        label={key}
                        value={currentEditToken.value[key]}
                        onChange={handleObjectChange}
                        type="text"
                        name={key}
                        custom={schemaValue}
                        required
                    />
                ))
            ) : (
                <div>
                    <Input
                        full
                        label={currentEditToken.property}
                        value={currentEditToken.value}
                        onChange={handleChange}
                        type="text"
                        name="value"
                        required
                        custom={currentEditToken.schema}
                    />
                    {checkIfContainsAlias(currentEditToken.value) && (
                        <div className="p-2 rounded bg-gray-100 border-gray-300 font-mono text-xxs mt-2 text-gray-700 flex itms-center">
                            {currentEditToken.type === 'color' ? (
                                <div
                                    className="w-4 h-4 rounded border border-gray-200 mr-1"
                                    style={{backgroundColor: resolvedValue}}
                                />
                            ) : null}
                            {resolvedValue}
                        </div>
                    )}
                </div>
            )}
            {currentEditToken.explainer && (
                <div className="mt-1 text-xxs text-gray-600">{currentEditToken.explainer}</div>
            )}
            {currentEditToken.optionsSchema
                ? Object.entries(currentEditToken.optionsSchema).map(([key, schemaValue]: [string, string]) => (
                      <Input
                          key={key}
                          full
                          label={key}
                          value={currentEditToken.options[key]}
                          onChange={handleOptionsChange}
                          type="text"
                          name={key}
                          custom={schemaValue}
                      />
                  ))
                : null}
            <div className="flex space-x-2 justify-end">
                <button className="button button-link" type="button" onClick={handleReset}>
                    Cancel
                </button>
                <button disabled={!isValid} className="button button-primary" type="submit">
                    {currentEditToken.isPristine ? 'Create' : 'Update'}
                </button>
            </div>
        </form>
    );
};

export default EditTokenForm;
