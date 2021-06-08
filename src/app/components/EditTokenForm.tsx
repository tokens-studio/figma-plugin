import {track} from '@/utils/analytics';
import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Dispatch, RootState} from '../store';
import useManageTokens from '../store/useManageTokens';
import Input from './Input';

const EditTokenForm = () => {
    const {activeTokenSet} = useSelector((state: RootState) => state.tokenState);
    const {editSingleToken, createSingleToken} = useManageTokens();
    const {editToken} = useSelector((state: RootState) => state.uiState);
    const dispatch = useDispatch<Dispatch>();

    const handleChange = (e) => {
        e.persist();
        dispatch.uiState.setEditToken({...editToken, [e.target.name]: e.target.value});
    };

    const handleObjectChange = (e) => {
        e.persist();
        dispatch.uiState.setEditToken({
            ...editToken,
            value: {...editToken.value, [e.target.name]: e.target.value},
        });
    };

    const handleOptionsChange = (e) => {
        e.persist();
        dispatch.uiState.setEditToken({
            ...editToken,
            options: {...editToken.options, [e.target.name]: e.target.value},
        });
    };

    const submitTokenValue = async ({value, name, options}) => {
        track('Edit Token');

        let oldName;
        if (editToken.initialName !== name && editToken.initialName) {
            oldName = editToken.initialName;
        }
        if (editToken.isPristine) {
            createSingleToken({
                parent: activeTokenSet,
                name,
                value,
                options,
            });
        } else {
            editSingleToken({
                parent: activeTokenSet,
                name,
                oldName,
                value,
                options,
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitTokenValue(editToken);
        dispatch.uiState.setShowEditForm(false);
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
            />
            {typeof editToken.schema === 'object' ? (
                Object.entries(editToken.schema).map(([key, schemaValue]: [string, string]) => (
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
                ))
            ) : (
                <Input
                    full
                    label={editToken.property}
                    value={editToken.value}
                    onChange={handleChange}
                    type="text"
                    name="value"
                    required
                    custom={editToken.schema}
                />
            )}
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
                      />
                  ))
                : null}
            {editToken.explainer && <div className="mt-1 text-xxs text-gray-600">{editToken.explainer}</div>}
            <div className="flex space-x-2 justify-end">
                <button className="button button-link" type="button" onClick={handleReset}>
                    Cancel
                </button>
                <button disabled={!editToken.value} className="button button-primary" type="submit">
                    {editToken.isPristine ? 'Create' : 'Update'}
                </button>
            </div>
        </form>
    );
};

export default EditTokenForm;
